import os
#!/usr/bin/env python3
"""Backfill missing overview fields (description, name, website, avgVolume, beta, etc.)
for all stocks in D1 using FMP /stable/profile. Runs until done. Safe to re-run."""
import json, sys, time, urllib.request, urllib.parse

FMP_KEY    = os.environ["FMP_KEY"]  # see SECRETS.md
CF_TOKEN   = os.environ["CF_TOKEN"]  # see SECRETS.md
CF_ACCOUNT = "2c46b2a79ec379ad9e5d58836b0566ef"
DB_ID      = "08aead05-4787-462b-986c-01e0b8d14646"
CF_API     = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT}/d1/database/{DB_ID}/query"
BATCH      = 100
DELAY      = 0.25  # 240 req/min < FMP 300/min limit

NEEDS_SQL = """
    SELECT ticker, overview FROM stock_data
    WHERE overview IS NOT NULL AND overview NOT IN ('', '{{}}', 'null')
      AND (
        json_extract(overview, '$.description') IS NULL OR json_extract(overview, '$.description') = ''
        OR json_extract(overview, '$.website') IS NULL OR json_extract(overview, '$.website') = ''
        OR json_extract(overview, '$.avgVolume') IS NULL
        OR json_extract(overview, '$.name') IS NULL OR json_extract(overview, '$.name') = ticker
      )
      AND COALESCE(json_extract(overview, '$._profileTried'), 0) = 0
    LIMIT {limit}
"""

def d1(sql, params=None, retries=3):
    payload = {"sql": sql}
    if params: payload["params"] = params
    for i in range(retries):
        try:
            req = urllib.request.Request(CF_API, json.dumps(payload).encode(),
                {"Authorization": f"Bearer {CF_TOKEN}", "Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=25) as r:
                return json.loads(r.read())
        except Exception as e:
            if i == retries - 1: raise
            time.sleep(2 * (i + 1))

def fmp_profile(ticker):
    url = f"https://financialmodelingprep.com/stable/profile?symbol={urllib.parse.quote(ticker)}&apikey={FMP_KEY}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "DS/1.0"})
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
        return data if isinstance(data, dict) else (data[0] if data else None)
    except Exception:
        return None

def patch(ov, p, ticker):
    changed = False
    def setif(key, val, allow_overwrite_name=False):
        nonlocal changed
        if val in (None, "", 0) and not isinstance(val, (int, float)):
            return
        cur = ov.get(key)
        empty = cur in (None, "") or (key == "name" and cur == ticker)
        if empty:
            ov[key] = val; changed = True
    desc = (p.get("description") or "").strip()
    if desc:
        words = desc.split()
        if len(words) > 300: desc = " ".join(words[:300]) + "..."
        if not ov.get("description"): ov["description"] = desc; changed = True
    setif("name", p.get("companyName"))
    setif("sector", p.get("sector"))
    setif("industry", p.get("industry"))
    setif("website", p.get("website"))
    setif("ceo", p.get("ceo"))
    setif("image", p.get("image"))
    setif("ipoDate", p.get("ipoDate"))
    setif("city", p.get("city"))
    setif("country", p.get("country"))
    if ov.get("employees") is None and p.get("fullTimeEmployees"):
        try: ov["employees"] = int(p["fullTimeEmployees"]); changed = True
        except Exception: pass
    av = p.get("averageVolume") or p.get("volAvg")
    if ov.get("avgVolume") is None and av:
        ov["avgVolume"] = av; changed = True
    if ov.get("beta") is None and p.get("beta") is not None:
        ov["beta"] = p.get("beta"); changed = True
    return changed

total_patched = total_skipped = 0
while True:
    rows = d1(NEEDS_SQL.format(limit=BATCH))["result"][0]["results"]
    if not rows:
        break
    for row in rows:
        ticker = row["ticker"]
        try: ov = json.loads(row["overview"] or "{}")
        except Exception: ov = {}
        p = fmp_profile(ticker)
        ov["_profileTried"] = 1  # mark so we never re-fetch dead tickers
        if p and patch(ov, p, ticker):
            total_patched += 1
            print(f"OK {ticker}", flush=True)
        else:
            # fallback description so the About section isn't empty
            if not ov.get("description"):
                sector, industry = ov.get("sector", ""), ov.get("industry", "")
                if sector and industry and sector != industry:
                    ov["description"] = f"{ticker} is a publicly listed {industry} company in the {sector} sector, traded on US stock exchanges."
                elif sector:
                    ov["description"] = f"{ticker} is a publicly listed company in the {sector} sector, traded on US stock exchanges."
                else:
                    ov["description"] = f"{ticker} is a publicly listed company traded on US stock exchanges."
            total_skipped += 1
            print(f"-- {ticker} (no profile)", flush=True)
        d1("UPDATE stock_data SET overview=? WHERE ticker=?", [json.dumps(ov), ticker])
        time.sleep(DELAY)
    print(f"BATCH DONE (patched={total_patched} skipped={total_skipped})", flush=True)

print(f"ALL DONE: patched={total_patched} skipped={total_skipped}")
