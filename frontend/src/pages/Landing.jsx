import { Link } from 'react-router-dom'

const FEATURES = [
  {
    title: 'Live portfolio tracking',
    desc: 'Add real holdings and see current price, day change, and gain/loss update automatically.',
  },
  {
    title: 'Risk & diversification',
    desc: 'Volatility, Sharpe ratio, beta vs the S&P 500, sector allocation, and a diversification score — computed from real price history.',
  },
  {
    title: 'AI portfolio insight',
    desc: "Ask Claude to summarize your portfolio's risk and concentration in plain language. Informational only — never buy/sell advice.",
  },
  {
    title: 'Multiple portfolios',
    desc: 'Separate long-term, speculative, or per-goal portfolios and track each one independently.',
  },
]

export default function Landing() {
  return (
    <div style={styles.page}>
      <nav className="glass" style={styles.nav}>
        <div style={styles.brand}>
          <span style={styles.brandMark}>◆</span> Stocklyzer
        </div>
        <div style={styles.navLinks}>
          <Link to="/login" style={styles.navLink}>Sign in</Link>
          <Link to="/register" style={styles.navCta}>Get started</Link>
        </div>
      </nav>

      <header style={styles.hero}>
        <div style={styles.heroText}>
          <div style={styles.eyebrow}>Portfolio tracking · Risk analytics · AI insight</div>
          <h1 style={styles.h1}>See what your portfolio is actually doing.</h1>
          <p style={styles.heroSub}>
            Stocklyzer tracks your holdings, computes real risk and diversification metrics from
            market data, and lets you ask Claude for a plain-language read on where your
            portfolio stands. No predictions, no buy/sell calls — just a clearer picture.
          </p>
          <div style={styles.heroActions}>
            <Link to="/register" style={styles.primaryBtn}>Create your first portfolio</Link>
            <Link to="/login" style={styles.secondaryBtn}>I have an account</Link>
          </div>
        </div>

        <div className="glass" style={styles.heroCard}>
          <div style={styles.heroCardHeader}>
            <span>Long-term growth</span>
            <span style={styles.heroCardCurrency}>USD</span>
          </div>
          <div className="ticker-rule" />
          <div className="mono-num" style={styles.heroCardValue}>$48,213.62</div>
          <div className="mono-num positive" style={styles.heroCardChange}>+1,842.10 (+3.97%)</div>
          <div style={styles.heroCardRows}>
            {[
              { t: 'AAPL', v: '+2.14%' },
              { t: 'MSFT', v: '+1.08%' },
              { t: 'NVDA', v: '-0.63%' },
            ].map((r) => (
              <div key={r.t} style={styles.heroCardRow}>
                <span>{r.t}</span>
                <span className={`mono-num ${r.v.startsWith('-') ? 'negative' : 'positive'}`}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <section style={styles.features}>
        <div className="ticker-rule" />
        <h2 style={styles.featuresTitle}>Everything you need, nothing you don't</h2>
        <div style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className="glass" style={styles.featureCard}>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={styles.ctaBand}>
        <h2 style={styles.ctaTitle}>Track your first portfolio in under a minute.</h2>
        <Link to="/register" style={styles.primaryBtn}>Get started — it's free</Link>
      </section>

      <footer style={styles.footer}>
        <span>Stocklyzer</span>
        <span style={styles.footerNote}>Not investment advice. Market data may be delayed.</span>
      </footer>
    </div>
  )
}

const styles = {
  page: { background: 'var(--bg)', minHeight: '100vh' },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 32px',
    borderBottom: '1px solid var(--border)',
    maxWidth: 1100,
    margin: '0 auto',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: { color: 'var(--accent)', fontSize: 14 },
  navLinks: { display: 'flex', alignItems: 'center', gap: 18 },
  navLink: { color: 'var(--text-secondary)', fontSize: 14 },
  navCta: {
    background: 'var(--accent)',
    color: '#1A1204',
    borderRadius: 'var(--radius-sm)',
    padding: '9px 16px',
    fontWeight: 600,
    fontSize: 14,
  },
  hero: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '64px 32px 40px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(280px, 380px)',
    gap: 48,
    alignItems: 'center',
  },
  heroText: {},
  eyebrow: {
    color: 'var(--accent)',
    fontSize: 12.5,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  h1: { fontSize: 42, lineHeight: 1.15, marginBottom: 18, maxWidth: 560 },
  heroSub: { color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6, maxWidth: 520, marginBottom: 28 },
  heroActions: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  primaryBtn: {
    background: 'var(--accent)',
    color: '#1A1204',
    borderRadius: 'var(--radius-sm)',
    padding: '13px 22px',
    fontWeight: 600,
    fontSize: 15,
  },
  secondaryBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
    borderRadius: 'var(--radius-sm)',
    padding: '13px 22px',
    fontWeight: 500,
    fontSize: 15,
  },
  heroCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
  },
  heroCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 14,
    color: 'var(--text-secondary)',
  },
  heroCardCurrency: { fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: 12 },
  heroCardValue: { fontSize: 28, fontWeight: 600, marginTop: 4 },
  heroCardChange: { fontSize: 14, marginTop: 4, marginBottom: 18 },
  heroCardRows: { display: 'flex', flexDirection: 'column', gap: 10 },
  heroCardRow: { display: 'flex', justifyContent: 'space-between', fontSize: 13.5 },
  features: { maxWidth: 1100, margin: '0 auto', padding: '20px 32px 64px' },
  featuresTitle: { fontSize: 26, marginBottom: 28, maxWidth: 480 },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 },
  featureCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 22,
  },
  featureTitle: { fontSize: 16, marginBottom: 10 },
  featureDesc: { color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.55, margin: 0 },
  ctaBand: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '48px 32px 72px',
    textAlign: 'center',
    borderTop: '1px solid var(--border)',
  },
  ctaTitle: { fontSize: 24, marginBottom: 22 },
  footer: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '20px 32px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    color: 'var(--text-muted)',
    fontSize: 13,
    borderTop: '1px solid var(--border)',
  },
  footerNote: { color: 'var(--text-muted)' },
}
