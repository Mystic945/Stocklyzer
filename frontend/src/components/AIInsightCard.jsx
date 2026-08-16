import { useState } from 'react'

export default function AIInsightCard({ onGenerate }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await onGenerate()
      setInsight(result)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not generate insight right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass" style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>AI portfolio insight</h3>
        <button style={styles.genBtn} onClick={handleGenerate} disabled={loading}>
          {loading ? 'Analyzing…' : insight ? 'Regenerate' : 'Generate insight'}
        </button>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      {insight ? (
        <div style={styles.body}>
          {insight.summary.split('\n').filter(Boolean).map((para, i) => (
            <p key={i} style={styles.para}>{para}</p>
          ))}
          <p style={styles.timestamp}>
            Generated {new Date(insight.generated_at).toLocaleString()}
          </p>
        </div>
      ) : (
        !loading && <p style={styles.placeholder}>Ask Claude to summarize this portfolio's risk and diversification.</p>
      )}
    </div>
  )
}

const styles = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 22,
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16 },
  genBtn: {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    color: 'var(--accent)',
    borderRadius: 'var(--radius-sm)',
    padding: '7px 14px',
    fontSize: 13,
    fontWeight: 500,
  },
  body: { marginTop: 14 },
  para: { fontSize: 14, lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: 10 },
  timestamp: { fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6 },
  placeholder: { color: 'var(--text-muted)', fontSize: 13.5, marginTop: 14 },
  error: { color: 'var(--negative)', fontSize: 13, marginTop: 10 },
}
