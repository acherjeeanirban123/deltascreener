import os
#!/usr/bin/env python3
"""Fast FMP description filler — finds first unfilled stock and fills 60 at a time"""
import json, sys, time, urllib.request, urllib.parse, urllib.error

FMP_KEY   = os.environ["FMP_KEY"]  # see SECRETS.md
CF_TOKEN  = os.environ["CF_TOKEN"]  # see SECRETS.md
CF_ACCOUNT= "2c46b2a79ec379ad9e5d58836b0566ef"
DB_ID     = "08aead05-4787-462b-986c-01e0b8d14646"
CF_API    = f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT}/d1/database/{DB_ID}/query"
LIMIT     = 60

def d1(sql, params=None):
    payload = {"sql": sql}
    if params: payload["params"] = params
    req = urllib.request.Request(CF_API, json.dumps(payload).encode(),
        {"Authorization": f"Bearer {CF_TOKEN}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.loads(r.read())

def fmp(ticker):
    url = f"https://financialmodelingprep.com/stable/profile?symbol={urllib.parse.quote(ticker)}&apikey={FMP_KEY}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "DS/1.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            data = json.loads(r.read())
        p = data if isinstance(data, dict) else (data[0] if data else None)
        if not p: return None, None
        desc = (p.get("description") or "").strip()
        if not desc: return None, None
        words = desc.split()
        if len(words) > 300: desc = " ".join(words[:300]) + "..."
        extra = {k: p.get(v) for k, v in [
            ("name","companyName"),("sector","sector"),("industry","industry"),
            ("website","website"),("ceo","ceo"),("image","image"),("ipoDate","ipoDate")
        ] if p.get(v)}
        return desc, extra
    except: return None, None

# Fetch LIMIT stocks that have no description
rows = d1(f"""
    SELECT ticker, overview FROM stock_data
    WHERE json_extract(overview, '$.description') IS NULL
       OR json_extract(overview, '$.description') = ''
    LIMIT {LIMIT}
""")["result"][0]["results"]

if not rows:
    print("ALL DONE — no more stocks need descriptions!")
    sys.exit(0)

filled = fallback = 0
for row in rows:
    ticker = row["ticker"]
    try: ov = json.loads(row["overview"] or "{}")
    except: ov = {}

    desc, extra = fmp(ticker)
    if desc:
        if extra:
            for k, v in extra.items():
                if v and not ov.get(k): ov[k] = v
        ov["description"] = desc
        d1("UPDATE stock_data SET overview=? WHERE ticker=?", [json.dumps(ov), ticker])
        print(f"✓ {ticker} ({len(desc.split())}w)", flush=True)
        filled += 1
    else:
        sector = ov.get("sector",""); industry = ov.get("industry","")
        if sector and industry and sector != industry:
            fb = f"{ticker} is a publicly listed {industry} company in the {sector} sector, traded on US stock exchanges."
        elif sector:
            fb = f"{ticker} is a publicly listed company in the {sector} sector, traded on US stock exchanges."
        else:
            fb = f"{ticker} is a publicly listed company traded on US stock exchanges."
        ov["description"] = fb
        d1("UPDATE stock_data SET overview=? WHERE ticker=?", [json.dumps(ov), ticker])
        print(f"~ {ticker} (fallback)", flush=True)
        fallback += 1

# Final count
r = d1("SELECT COUNT(*) as total, SUM(CASE WHEN json_extract(overview,'$.description') IS NOT NULL AND json_extract(overview,'$.description') != '' THEN 1 ELSE 0 END) as filled FROM stock_data")
row = r["result"][0]["results"][0]
remaining = row['total'] - row['filled']
print(f"\nDONE: +{filled} FMP +{fallback} fallback | Total: {row['filled']}/{row['total']} filled | {remaining} remaining")
