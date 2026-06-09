#!/usr/bin/env python3
"""
DeltaScreener Twitter Marketing Agent
Posts 5 tweets/day targeting US investors
Reads API keys from twitter_config.json
"""

import json
import requests
import tweepy
import os
import sys
import time
import random
from datetime import datetime, date
import anthropic

# ── Random human-like delay (0–15 minutes) ───────────────────────────────────
# This makes each post land at a slightly different time every day
_delay_seconds = random.randint(0, 900)
print(f"⏳ Human delay: {_delay_seconds // 60}m {_delay_seconds % 60}s before posting...")
time.sleep(_delay_seconds)

# ── Load config ──────────────────────────────────────────────────────────────
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "twitter_config.json")

with open(CONFIG_PATH) as f:
    cfg = json.load(f)["twitter_api"]

TWITTER_API_KEY        = cfg["api_key"]
TWITTER_API_SECRET     = cfg["api_key_secret"]
TWITTER_ACCESS_TOKEN   = cfg["access_token"]
TWITTER_ACCESS_SECRET  = cfg["access_token_secret"]
BEARER_TOKEN           = cfg["bearer_token"]

# ── Tweet slot argument (1-5) ─────────────────────────────────────────────────
SLOT = int(sys.argv[1]) if len(sys.argv) > 1 else 1

# ── Twitter client ────────────────────────────────────────────────────────────
client = tweepy.Client(
    consumer_key=TWITTER_API_KEY,
    consumer_secret=TWITTER_API_SECRET,
    access_token=TWITTER_ACCESS_TOKEN,
    access_token_secret=TWITTER_ACCESS_SECRET,
)

# ── FMP API key (from env or hardcoded fallback) ──────────────────────────────
FMP_API_KEY = os.environ.get("FMP_API_KEY", "")

# ── DeltaScreener blog API ────────────────────────────────────────────────────
BLOG_API = "https://api.deltascreener.com/api/blog"
BLOG_SECRET = os.environ.get("DELTASCREENER_SECRET", "")

SITE_URL = "https://deltascreener.com"

# ── Anthropic client for tweet copy ──────────────────────────────────────────
ai = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))


def fetch_latest_blog():
    try:
        r = requests.get(BLOG_API, timeout=10)
        posts = r.json()
        if isinstance(posts, list) and posts:
            return posts[0]
    except Exception:
        pass
    return None


def fetch_market_data(endpoint: str, **kwargs):
    params = {"apikey": FMP_API_KEY, **kwargs}
    url = f"https://financialmodelingprep.com/api/v3/{endpoint}"
    try:
        r = requests.get(url, params=params, timeout=10)
        return r.json()
    except Exception:
        return []


def ai_tweet(prompt: str) -> str:
    msg = ai.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=120,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text.strip()


def post_tweet(text: str):
    print(f"\n📤 Posting tweet:\n{text}\n")
    resp = client.create_tweet(text=text)
    print(f"✅ Posted! Tweet ID: {resp.data['id']}")
    return resp


# ══════════════════════════════════════════════════════════════════════════════
# SLOT DEFINITIONS  (5 per day, US market hours)
# Slot 1 → 8:30am ET  — Pre-market brief + blog post
# Slot 2 → 10:30am ET — Top gainer spotlight
# Slot 3 → 12:30pm ET — Midday market insight / screener tip
# Slot 4 → 3:00pm ET  — Sector/momentum tip
# Slot 5 → 5:00pm ET  — End-of-day recap + CTA
# ══════════════════════════════════════════════════════════════════════════════

def slot_1_premarket_blog():
    """Pre-market brief + latest blog post link."""
    blog = fetch_latest_blog()
    gainers = fetch_market_data("stock_market/gainers")[:3]
    gainer_names = ", ".join(g.get("ticker", "") for g in gainers) if gainers else "markets moving"

    if blog:
        title = blog.get("title", "Stock Screening Guide")
        slug  = blog.get("slug", "")
        link  = f"{SITE_URL}/blog/{slug}" if slug else SITE_URL
        prompt = (
            f"Write a single tweet (max 240 chars) for US stock investors. "
            f"Morning pre-market tone. Mention today's blog post titled '{title}'. "
            f"Include this link: {link}. "
            f"Trending tickers today: {gainer_names}. "
            f"End with #StockScreener #USStocks. No emojis overload, sound professional."
        )
    else:
        prompt = (
            f"Write a single tweet (max 240 chars) for US stock investors. "
            f"Morning pre-market tone. Promote DeltaScreener ({SITE_URL}) as the best free US stock screener. "
            f"Trending tickers: {gainer_names}. End with #StockScreener #USStocks."
        )
    tweet = ai_tweet(prompt)
    post_tweet(tweet)


def slot_2_gainer_spotlight():
    """Top gainer spotlight — attract momentum traders."""
    gainers = fetch_market_data("stock_market/gainers")[:5]
    if not gainers:
        gainers = [{"ticker": "SPY", "changesPercentage": 1.2, "name": "S&P 500 ETF"}]

    top = gainers[0]
    ticker = top.get("ticker", "")
    pct    = top.get("changesPercentage", 0)
    name   = top.get("name", ticker)

    prompt = (
        f"Write a single tweet (max 240 chars) for US investors. "
        f"Highlight that ${ticker} ({name}) is up {pct:.1f}% today. "
        f"Tell them to screen for more breakout stocks at {SITE_URL}. "
        f"Sound like a savvy trader. Include #{ticker} #Stocks #StockScreener."
    )
    tweet = ai_tweet(prompt)
    post_tweet(tweet)


def slot_3_screener_tip():
    """Midday screener education tip — SEO-friendly."""
    tips = [
        ("P/E Ratio", "filter undervalued growth stocks before earnings season"),
        ("RSI < 30", "find oversold stocks before a potential bounce"),
        ("52-Week High Breakout", "spot momentum stocks breaking to new highs"),
        ("Debt-to-Equity < 0.5", "screen for financially healthy companies"),
        ("EPS Growth > 20%", "find high-growth stocks the market may be underpricing"),
        ("Volume Surge", "catch stocks with unusual buying interest early"),
    ]
    import hashlib
    idx = int(hashlib.md5(str(date.today()).encode()).hexdigest(), 16) % len(tips)
    metric, use_case = tips[idx]

    prompt = (
        f"Write a single educational tweet (max 240 chars) for US retail investors. "
        f"Explain how to use '{metric}' to {use_case}. "
        f"Tell them DeltaScreener ({SITE_URL}) has this filter built in — free. "
        f"Tone: helpful, knowledgeable. End with #Investing #StockScreener #USStocks."
    )
    tweet = ai_tweet(prompt)
    post_tweet(tweet)


def slot_4_sector_momentum():
    """Sector performance — attract sector-rotation traders."""
    sectors = fetch_market_data("sector-performance")
    if sectors and isinstance(sectors, list):
        sectors_sorted = sorted(sectors, key=lambda x: float(x.get("changesPercentage", 0) or 0), reverse=True)
        top_sector = sectors_sorted[0] if sectors_sorted else None
    else:
        top_sector = None

    if top_sector:
        sec_name = top_sector.get("sector", "Technology")
        sec_pct  = top_sector.get("changesPercentage", "1.5")
        prompt = (
            f"Write a single tweet (max 240 chars) for US stock investors. "
            f"The {sec_name} sector is leading today at +{sec_pct}%. "
            f"Tell them to screen {sec_name} stocks on DeltaScreener ({SITE_URL}). "
            f"Sound like a market analyst. Include #{sec_name.replace(' ','')} #SectorRotation #Stocks."
        )
    else:
        prompt = (
            f"Write a single tweet (max 240 chars) for US investors about sector rotation strategy. "
            f"Mention DeltaScreener ({SITE_URL}) as the tool to find leading sectors. "
            f"Include #SectorRotation #Investing #StockScreener."
        )
    tweet = ai_tweet(prompt)
    post_tweet(tweet)


def slot_5_eod_recap():
    """End-of-day recap + strong CTA to sign up."""
    losers  = fetch_market_data("stock_market/losers")[:3]
    gainers = fetch_market_data("stock_market/gainers")[:3]

    g_names = ", ".join(f"${g.get('ticker','')}" for g in gainers) if gainers else "$SPY"
    l_names = ", ".join(f"${l.get('ticker','')}" for l in losers)  if losers  else "$QQQ"

    prompt = (
        f"Write a single end-of-day recap tweet (max 240 chars) for US investors. "
        f"Today's top gainers: {g_names}. Notable losers: {l_names}. "
        f"CTA: Use DeltaScreener ({SITE_URL}) to build your watchlist for tomorrow — it's free. "
        f"Tone: confident, helpful. End with #StockMarket #USStocks #StockScreener."
    )
    tweet = ai_tweet(prompt)
    post_tweet(tweet)


# ── Dispatch ──────────────────────────────────────────────────────────────────
SLOTS = {
    1: slot_1_premarket_blog,
    2: slot_2_gainer_spotlight,
    3: slot_3_screener_tip,
    4: slot_4_sector_momentum,
    5: slot_5_eod_recap,
}

if __name__ == "__main__":
    print(f"🐦 DeltaScreener Twitter Agent — Slot {SLOT} — {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    SLOTS.get(SLOT, slot_1_premarket_blog)()
