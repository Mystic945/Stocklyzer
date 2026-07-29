export default function HoldingsTable({ holdings, onDelete }) {
  if (!holdings || holdings.length === 0) {
    return <div style={styles.empty}>No holdings yet. Add your first position above.</div>
  }

  return (
    <div style={styles.wrapper} className="scrollbar-thin">
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Ticker</th>
            <th style={styles.th}>Qty</th>
            <th style={styles.th}>Avg cost</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Day</th>
            <th style={styles.th}>Market value</th>
            <th style={styles.th}>Gain/Loss</th>
            <th style={styles.th}></th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => {
            const isPositive = h.gain_loss >= 0
            const dayPositive = (h.day_change_pct ?? 0) >= 0
            return (
              <tr key={h.id} style={styles.row}>
                <td style={{ ...styles.td, fontWeight: 600 }}>{h.ticker}</td>
                <td className="mono-num" style={styles.td}>{h.quantity}</td>
                <td className="mono-num" style={styles.td}>${h.average_cost.toFixed(2)}</td>
                <td className="mono-num" style={styles.td}>${h.current_price.toFixed(2)}</td>
                <td className={`mono-num ${dayPositive ? 'positive' : 'negative'}`} style={styles.td}>
                  {h.day_change_pct != null ? `${dayPositive ? '+' : ''}${h.day_change_pct.toFixed(2)}%` : '—'}
                </td>
                <td className="mono-num" style={styles.td}>
                  ${h.market_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </td>
                <td className={`mono-num ${isPositive ? 'positive' : 'negative'}`} style={styles.td}>
                  {isPositive ? '+' : ''}
                  {h.gain_loss.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}
                  {h.gain_loss_pct.toFixed(2)}%)
                </td>
                <td style={styles.td}>
                  <button style={styles.deleteBtn} onClick={() => onDelete(h.id)} title="Remove holding">
                    ✕
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const styles = {
  wrapper: { overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13.5 },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    color: 'var(--text-muted)',
    fontWeight: 500,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  row: { borderBottom: '1px solid var(--border)' },
  td: { padding: '12px 16px', color: 'var(--text-primary)' },
  deleteBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    fontSize: 13,
  },
  empty: {
    padding: 28,
    textAlign: 'center',
    color: 'var(--text-muted)',
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 13.5,
  },
}
