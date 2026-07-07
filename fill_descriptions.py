import os
#!/usr/bin/env python3
"""
Stock Description Agent for DeltaScreener
Fetches descriptions from FMP /stable/profile for all stocks missing descriptions in D1.

Usage: python3 fill_descriptions.py [--limit N] [--offset N] [--test] [--force]
  --limit N    Only process N stocks (default: all)
  --offset N   Start from offset N (default: 0)
  --test       Test mode: show descriptions but don't write to DB
  --force      Re-fill even stocks that already have a description
"""

import json
import time
import sys
import urllib.request
import urllib.parse
import urllib.error

# Config
FMP_KEY     = os.environ["FMP_KEY"]  # see SECRETS.md
FMP_URL     = "https://financialmodelingprep.com/stable/profile"

CF_TOKEN    = os.environ["CF_TOKEN"]  # see SECRETS.md
CF_ACCOUNT  = "2c46b2a79ec379ad9e5d58836b0566ef"
DB_ID       = "08aead05-4787-462b-986c-01e0b8d14646"
CF_API      = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT}/d1/database/{DB_ID}/query"

BATCH_SIZE  = 100   # stocks per D1 query
FMP_DELAY   = 0.25  # seconds between FMP requests (Starter plan: 300 req/min)
MAX_WORDS   = 300   # truncate very long descriptions


# ── D1 helpers ──────────────────────────────────────────────────────────────

def d1_query(sql, params=None):
    payload = {"sql": sql}
    if params:
        payload["params"] = params
    data = json.dumps(payload).encode()
    req = urllib.request.Request(
        CF_API, data=data,
        headers={"Authorization": f"Bearer {CF_TOKEN}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read())


def get_batch(offset):
    result = d1_query(
        f"SELECT ticker, overview FROM stock_data LIMIT {BATCH_SIZE} OFFSET {offset}"
    )
    return result.get("result", [{}])[0].get("results", [])


def needs_description(row, force=False):
    try:
        ov = json.loads(row["overview"] or "{}")
        desc = (ov.get("description") or "").strip()
        if force or not desc or desc in ("None", "null"):
            return True, ov
        return False, ov
    except Exception:
        return True, {}


def update_description(ticker, description, ov):
    ov["description"] = description
    result = d1_query(
        "UPDATE stock_data SET overview = ? WHERE ticker = ?",
        [json.dumps(ov), ticker]
    )
    return result.get("success", False)


# ── FMP helper ───────────────────────────────────────────────────────────────

def fmp_get_description(ticker):
    """Fetch description from FMP stable/profile. Returns (description, extra_fields) or (None, None)."""
    url = f"{FMP_URL}?symbol={urllib.parse.quote(ticker)}&apikey={FMP_KEY}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "DeltaScreener/1.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read())

        if isinstance(data, dict) and data.get("Error Message"):
            print(f"\n  FMP Error: {data['Error Message'][:80]}", flush=True)
            return None, None

        profile = data if isinstance(data, dict) else (data[0] if data else None)
        if not profile:
            return None, None

        description = (profile.get("description") or "").strip()
        if not description:
            return None, None

        words = description.split()
        if len(words) > MAX_WORDS:
            description = " ".join(words[:MAX_WORDS]) + "..."

        extra = {
            "name":      profile.get("companyName"),
            "sector":    profile.get("sector"),
            "industry":  profile.get("industry"),
            "website":   profile.get("website"),
            "ceo":       profile.get("ceo"),
            "employees": profile.get("fullTimeEmployees"),
            "ipoDate":   profile.get("ipoDate"),
            "country":   profile.get("country"),
            "image":     profile.get("image"),
        }
        extra = {k: v for k, v in extra.items() if v}

        return description, extra

    except urllib.error.HTTPError as e:
        if e.code == 429:
            print(f"\n    Rate limited (429), sleeping 30s...", flush=True)
            time.sleep(30)
        return None, None
    except Exception:
        return None, None


def make_fallback(ticker, ov):
    sector = ov.get("sector", "")
    industry = ov.get("industry", "")
    if sector and industry and sector != industry:
        return f"{ticker} is a publicly listed {industry} company in the {sector} sector, traded on US stock exchanges."
    elif sector:
        return f"{ticker} is a publicly listed company in the {sector} sector, traded on US stock exchanges."
    return f"{ticker} is a publicly listed company traded on US stock exchanges."


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]
    test_mode = "--test" in args
    force     = "--force" in args
    limit     = None
    offset    = 0

    for i, arg in enumerate(args):
        if arg == "--limit" and i + 1 < len(args):
            limit = int(args[i + 1])
        if arg == "--offset" and i + 1 < len(args):
            offset = int(args[i + 1])

    print("=" * 65)
    print("  DeltaScreener — FMP Description Agent")
    if test_mode: print("  MODE: TEST (no DB writes)")
    if force:     print("  MODE: FORCE (overwrite existing descriptions)")
    print("=" * 65)

    total_res = d1_query("SELECT COUNT(*) as total FROM stock_data")
    total_stocks = total_res["result"][0]["results"][0]["total"]
    print(f"  Total stocks in DB : {total_stocks}")
    print(f"  Starting at offset : {offset}")
    if limit: print(f"  Processing limit   : {limit}")
    print()

    filled = skipped = failed = fallback_used = processed = 0
    current_offset = offset

    while current_offset < total_stocks:
        if limit and processed >= limit:
            break

        batch = get_batch(current_offset)
        if not batch:
            break

        for row in batch:
            if limit and processed >= limit:
                break

            ticker = row["ticker"]
            needs, ov = needs_description(row, force)
            processed += 1
            num = current_offset + processed - (BATCH_SIZE - len(batch))

            if not needs:
                skipped += 1
                continue

            print(f"  [{num:>4}/{total_stocks}] {ticker:<8} ", end="", flush=True)

            description, extra = fmp_get_description(ticker)

            if description:
                if not test_mode:
                    if extra:
                        for k, v in extra.items():
                            if v and not ov.get(k):
                                ov[k] = v
                    ok = update_description(ticker, description, ov)
                    if ok:
                        print(f"✓  FMP ({len(description.split())}w)")
                        filled += 1
                    else:
                        print(f"✗  DB write failed")
                        failed += 1
                else:
                    print(f"[TEST] {description[:100]}...")
                    filled += 1
            else:
                fb = make_fallback(ticker, ov)
                if not test_mode:
                    update_description(ticker, fb, ov)
                print(f"~  fallback")
                fallback_used += 1

            time.sleep(FMP_DELAY)

        current_offset += BATCH_SIZE
        total_done = filled + fallback_used + failed
        print(f"\n  --- Batch: {total_done} done, {filled} FMP, {fallback_used} fallback, "
              f"{skipped} skipped, {failed} failed ---\n")

    print("=" * 65)
    print(f"  COMPLETE")
    print(f"  FMP descriptions   : {filled}")
    print(f"  Fallback           : {fallback_used}")
    print(f"  Already had desc   : {skipped}")
    print(f"  DB write failures  : {failed}")
    print("=" * 65)


if __name__ == "__main__":
    main()
