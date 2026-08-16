import { useState } from 'react'

export default function AddHoldingModal({ onClose, onSubmit }) {
  const [ticker, setTicker] = useState('')
  const [quantity, setQuantity] = useState('')
  const [averageCost, setAverageCost] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await onSubmit({
        ticker: ticker.toUpperCase().trim(),
        quantity: parseFloat(quantity),
        average_cost: parseFloat(averageCost),
      })
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not add holding. Check the ticker symbol.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div className="glass" style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 4 }}>Add a holding</h3>
        <p style={styles.subtitle}>Enter the ticker symbol as listed on the exchange (e.g. AAPL, RELIANCE.NS).</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Ticker symbol
            <input style={styles.input} value={ticker} onChange={(e) => setTicker(e.target.value)} required />
          </label>
          <div style={styles.row}>
            <label style={styles.label}>
              Quantity
              <input
                style={styles.input}
                type="number"
                step="any"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </label>
            <label style={styles.label}>
              Avg. cost / share
              <input
                style={styles.input}
                type="number"
                step="any"
                min="0"
                value={averageCost}
                onChange={(e) => setAverageCost(e.target.value)}
                required
              />
            </label>
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn} disabled={submitting}>
              {submitting ? 'Adding…' : 'Add holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(6, 8, 12, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modal: {
    width: 380,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 28,
  },
  subtitle: { color: 'var(--text-secondary)', fontSize: 13, marginBottom: 18 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'flex', gap: 12 },
  label: { flex: 1, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' },
  input: {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontSize: 14,
  },
  error: { color: 'var(--negative)', fontSize: 13, margin: 0 },
  actions: { display: 'flex', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 0',
    fontSize: 14,
  },
  submitBtn: {
    flex: 1,
    background: 'var(--accent)',
    color: '#1A1204',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 0',
    fontWeight: 600,
    fontSize: 14,
  },
}
