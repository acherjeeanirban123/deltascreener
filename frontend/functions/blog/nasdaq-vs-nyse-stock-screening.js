import { renderSpaShell, SITE_ORIGIN } from '../_lib/spa-shell.js'

export async function onRequestGet() {
  const title = 'NYSE vs NASDAQ: Key Differences for Stock Pickers | DeltaScreener'
  const description = 'Understand NYSE vs NASDAQ exchanges. Learn listing requirements, trading volumes, and how to screen tech vs traditional stocks effectively.'
  const slug = 'nasdaq-vs-nyse-stock-screening'
  const canonicalUrl = `${SITE_ORIGIN}/blog/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'NYSE vs NASDAQ: Key Differences for Stock Pickers',
      description,
      url: canonicalUrl,
      datePublished: new Date().toISOString().split('T')[0],
      author: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
      publisher: { '@type': 'Organization', name: 'DeltaScreener', url: SITE_ORIGIN },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog` },
        { '@type': 'ListItem', position: 3, name: 'NYSE vs NASDAQ', item: canonicalUrl },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is the main difference between NYSE and NASDAQ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The NYSE uses a hybrid floor-based specialist model with Designated Market Makers who maintain fair markets, while NASDAQ operates as a fully electronic dealer market with no physical trading floor. This makes NASDAQ faster and more modern, while NYSE maintains a traditional approach.',
          },
        },
        {
          '@type': 'Question',
          name: 'Which exchange is better for tech stocks?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'NASDAQ is widely known for hosting tech-focused companies and is seen as the more modern exchange. Many of the largest tech firms like Apple, Amazon, and Microsoft trade on NASDAQ. However, both exchanges have companies from all sectors.',
          },
        },
        {
          '@type': 'Question',
          name: 'Are there different listing requirements for NYSE and NASDAQ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. NYSE requires companies to have a $100M market cap and three years of earnings history, while NASDAQ allows a $50M market cap with lower earnings thresholds. It is typically 70-80% cheaper to list on NASDAQ compared to NYSE.',
          },
        },
      ],
    },
  ]

  const bodyHtml = `
    <main style="max-width:760px;margin:0 auto;padding:40px 16px 72px;font-family:Inter,system-ui,sans-serif">
      <nav aria-label="Breadcrumb" style="margin-bottom:20px">
        <ol style="list-style:none;padding:0;margin:0;display:flex;gap:6px;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#5c6774">
          <li><a href="/" style="color:#0f766e;text-decoration:none">Home</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li><a href="/blog" style="color:#0f766e;text-decoration:none">Blog</a></li>
          <li aria-hidden="true" style="color:#9ca3af">/</li>
          <li aria-current="page" style="color:#374151">NYSE vs NASDAQ</li>
        </ol>
      </nav>
      <div style="font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#0f766e;margin-bottom:10px">Stock Investing</div>
      <h1 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:clamp(28px,5vw,46px);line-height:1.1;letter-spacing:-.04em;margin:0 0 16px;color:#111827">NYSE vs NASDAQ: Key Differences for Stock Pickers</h1>
      <p style="color:#6b7280;font-size:14px;margin:0 0 32px">By DeltaScreener · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">If you're building a stock screen or researching companies, you've probably noticed that different stocks trade on different exchanges. The two largest in the US are the New York Stock Exchange (NYSE) and the NASDAQ. But what's the difference between them, and does it matter for your investing? Understanding these exchanges will help you build better screens and identify stocks that fit your strategy.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#111827">How the NYSE and NASDAQ Actually Trade</h2>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">The most fundamental difference between these exchanges is <strong>how they execute trades</strong>. The NYSE uses a hybrid floor-based specialist model. This means human traders (Designated Market Makers, or DMMs) work on the physical trading floor in New York to match buyers and sellers. These specialists are responsible for maintaining fair and orderly markets in specific stocks and must continuously quote bid and ask prices.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">NASDAQ, on the other hand, is fully electronic. There is no physical trading floor. Instead, trades are matched through computer systems operated by market makers and dealers who compete electronically. This electronic model generally means faster order execution and tighter bid-ask spreads, especially for liquid stocks.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">In practice, both exchanges handle enormous daily trading volumes. The NYSE processes around 4–5 billion shares per day, while NASDAQ handles 5–6 billion shares daily, reflecting their comparable scale and importance to the US stock market.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#111827">Listing Requirements: Easier on NASDAQ</h2>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">Not all companies can list on the NYSE or NASDAQ—each exchange has standards that must be met. And these standards differ significantly, which is worth understanding if you're screening for newer or smaller companies.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">The <strong>NYSE requires</strong> companies to have a market capitalization of at least $100 million and a minimum of three years of profitability history. The exchange also has stricter governance and financial standards overall, reflecting its more traditional, conservative reputation.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">The <strong>NASDAQ requires</strong> only a $50 million market cap and has lower earnings thresholds. This lower barrier to entry is one reason why growth-stage and tech companies often choose NASDAQ. Listing on NASDAQ is typically 70–80% cheaper than listing on the NYSE, making it more accessible to smaller companies looking to go public.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">If you're screening for established, profitable companies with strong track records, you'll find more of them on the NYSE. If you're interested in growth-stage tech firms or companies earlier in their public journey, NASDAQ will have a larger pool.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#111827">Sector Concentration: Tech on NASDAQ, Diversified on NYSE</h2>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">NASDAQ has earned its reputation as the "tech exchange." Companies like Apple, Microsoft, Amazon, Alphabet, and NVIDIA—some of the largest and most successful tech firms in the world—trade on NASDAQ. This dominance of high-growth, high-ROE technology companies gives NASDAQ a distinctly different character.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">The NYSE, by contrast, is more diversified. You'll find major financial institutions, industrial companies, consumer staples, utilities, and energy firms on the NYSE. This reflects its longer history and traditional role as the primary market for established US corporations across all sectors.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">This sector distribution matters when you're screening. If you want to isolate high-ROE tech stocks, you'll find a richer selection on NASDAQ. If you're looking for high-ROE companies across utilities, financials, or energy, the NYSE will have more options.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#111827">Market Cap and Scale</h2>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">Both the NYSE and NASDAQ are enormous markets with roughly equal total market capitalization. As of 2026, they hold a combined market cap in the trillions, and they're nearly balanced in size. This means neither exchange has a monopoly on the largest companies—both have mega-cap firms trading on them.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">However, the composition differs. NASDAQ leans toward larger tech and biotech names, while the NYSE has more traditional large-cap corporations. When you're screening, this distinction helps: if you want to avoid overexposure to any single sector or trading pattern, it's valuable to understand which exchange a stock trades on.</p>

      <div style="margin:32px 0;padding:16px;border-left:4px solid #0f766e;background:#f0fdf9">
        <h3 style="font-size:16px;font-weight:700;color:#0f766e;margin:0 0 8px">Key Takeaway for Stock Screeners</h3>
        <p style="color:#374151;line-height:1.7;font-size:15px;margin:0">When you're building a stock screen, knowing which exchange a company trades on gives you insight into its profile. NASDAQ leans tech and growth; NYSE is more diversified and traditional. Use this knowledge to refine your filters—screen for high-ROE tech on NASDAQ or stable dividend payers on the NYSE.</p>
      </div>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#111827">How to Use DeltaScreener to Screen by Exchange</h2>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">Now that you understand the differences, you can use this knowledge in your screening strategy. DeltaScreener lets you filter stocks by exchange, sector, and financial metrics like ROE, debt-to-equity, and dividend yield. This means you can build screens tailored to each exchange's characteristics.</p>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">For example, you could <a href="/screener" style="color:#0f766e;text-decoration:underline">screen for high-ROE NASDAQ stocks</a> to isolate profitable tech companies, or filter for dividend-paying NYSE stocks to find stable income generators. By combining exchange selection with other filters, you'll uncover stocks that match your exact investment criteria.</p>

      <h2 style="font-family:'IBM Plex Serif',Georgia,serif;font-size:24px;line-height:1.2;letter-spacing:-.02em;margin:32px 0 16px;color:#111827">FAQs</h2>

      <h3 style="font-size:16px;font-weight:700;color:#111827;margin:16px 0 8px">Which exchange is better for investing?</h3>
      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">Neither is inherently "better"—they're different. Choose based on your investment goals. If you want exposure to tech growth, NASDAQ has more options. If you want diversified sectors and established blue-chips, the NYSE is stronger.</p>

      <h3 style="font-size:16px;font-weight:700;color:#111827;margin:16px 0 8px">Do stocks move differently on NYSE vs NASDAQ?</h3>
      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">Not inherently, but broader market trends and sector momentum affect them differently. NASDAQ is more volatile because of its tech concentration. NYSE tends to be more stable due to its mix of sectors. This is reflected in volatility metrics and correlations.</p>

      <h3 style="font-size:16px;font-weight:700;color:#111827;margin:16px 0 8px">Can I screen for stocks from both exchanges at once?</h3>
      <p style="color:#374151;line-height:1.7;font-size:15px;margin:0 0 16px">Yes. On DeltaScreener, you can apply all your filters (ROE, debt levels, sector) across both exchanges, or select one exchange to narrow your focus. This flexibility lets you compare high-ROE companies across the whole market or zoom into specific exchange characteristics.</p>

      <div style="margin-top:40px;padding:20px 24px;border-radius:16px;background:#eef8f5;border:1px solid rgba(15,118,110,.15)">
        <strong style="display:block;font-size:15px;color:#0f766e;margin-bottom:8px">Try it on DeltaScreener</strong>
        <p style="margin:0 0 12px;color:#374151;line-height:1.7;font-size:14px">Filter stocks by exchange, ROE, sector, and more—all free, no sign-up required.</p>
        <a href="/screener" style="display:inline-flex;padding:10px 16px;border-radius:12px;background:#0f766e;color:#fff;text-decoration:none;font-weight:800;font-size:14px">Open Free Screener →</a>
      </div>

      <p style="color:#374151;line-height:1.7;font-size:15px;margin:40px 0 0">Understanding NYSE and NASDAQ gives you a strategic edge when screening for stocks. Each exchange reflects different investor appetites, growth profiles, and sectors. Use this knowledge to refine your searches and find stocks that truly fit your criteria. Start exploring with our free stock screener today.</p>
    </main>`

  return new Response(renderSpaShell({
    title,
    description,
    canonicalUrl,
    keywords: 'NYSE vs NASDAQ, stock exchange differences, listing requirements, tech stocks, stock screening',
    jsonLd,
    bodyHtml,
  }), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
