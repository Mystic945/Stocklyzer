export default function RiskPanel({ risk }) {
  if (!risk) return null

  const metrics = [
    { label: 'Annualized volatility', value: `${risk.portfolio_volatility_annualized.toFixed(1)}%` },
    { label: 'Sharpe ratio', value: risk.sharpe_ratio != null ? risk.sharpe_ratio.toFixed(2) : '—' },
    { label: 'Beta vs S&P 500', value: risk.beta_vs_market != null ? risk.beta_vs_market.toFixed(2) : '—' },
    { label: 'Diversification score', value: `${risk.diversification_score.toFixed(0)} / 100` },
  ]

  return (
    <div>
      <div style={styles.metricGrid}>
        {metrics.map((m) => (
          <div key={m.label} className="glass" style={styles.metricCard}>
            <div style={styles.metricLabel}>{m.label}</div>
            <div className="mono-num" style={styles.metricValue}>{m.value}</div>
          </div>
        ))}
      </div>

      {risk.sector_allocation?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={styles.sectionLabel}>Sector allocation</div>
          {risk.sector_allocation.map((s) => (
            <div key={s.sector} style={styles.barRow}>
              <span style={styles.barLabel}>{s.sector}</span>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${Math.max(s.weight_pct, 2)}%` }} />
              </div>
              <span className="mono-num" style={styles.barValue}>{s.weight_pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}

      {risk.concentration_risk?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={styles.sectionLabel}>Largest positions</div>
          {risk.concentration_risk.map((c) => (
            <div key={c.ticker} style={styles.barRow}>
              <span style={styles.barLabel}>{c.ticker}</span>
              <div style={styles.barTrack}>
                <div style={{ ...styles.barFill, width: `${Math.max(c.weight_pct, 2)}%`, background: 'var(--accent)' }} />
              </div>
              <span className="mono-num" style={styles.barValue}>{c.weight_pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  metricGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 },
  metricCard: {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 16,
  },
  metricLabel: { color: 'var(--text-muted)', fontSize: 12, marginBottom: 8 },
  metricValue: { fontSize: 20, fontWeight: 600 },
  sectionLabel: { color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12, fontWeight: 500 },
  barRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 },
  barLabel: { width: 100, fontSize: 13, color: 'var(--text-primary)', flexShrink: 0 },
  barTrack: { flex: 1, height: 8, background: 'var(--surface-raised)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', background: 'var(--positive)', borderRadius: 4 },
  barValue: { width: 50, textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' },
}
