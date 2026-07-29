import { Link } from 'react-router-dom'

export default function PortfolioCard({ portfolio, summary }) {
  const gain = summary?.total_gain_loss ?? 0
  const gainPct = summary?.total_gain_loss_pct ?? 0
  const isPositive = gain >= 0

  return (
    <Link to={`/portfolios/${portfolio.id}`} style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.name}>{portfolio.name}</h3>
        <span style={styles.currency}>{portfolio.base_currency}</span>
      </div>
      {portfolio.description && <p style={styles.desc}>{portfolio.description}</p>}

      <div className="ticker-rule" />

      {summary ? (
        <>
          <div className="mono-num" style={styles.value}>
            ${summary.total_market_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className={`mono-num ${isPositive ? 'positive' : 'negative'}`} style={styles.change}>
            {isPositive ? '+' : ''}
            {gain.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}
            {gainPct.toFixed(2)}%)
          </div>
        </>
      ) : (
        <div style={styles.empty}>No holdings yet</div>
      )}
    </Link>
  )
}

const styles = {
  card: {
    display: 'block',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 22,
    transition: 'border-color 0.15s ease',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  name: { fontSize: 17 },
  currency: { color: 'var(--text-muted)', fontSize: 12, fontFamily: 'var(--font-mono)' },
  desc: { color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 },
  value: { fontSize: 24, fontWeight: 600 },
  change: { fontSize: 14, marginTop: 4 },
  empty: { color: 'var(--text-muted)', fontSize: 13 },
}
