import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import PortfolioCard from '../components/PortfolioCard.jsx'
import client from '../api/client.js'

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState([])
  const [summaries, setSummaries] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)

  const loadPortfolios = async () => {
    setLoading(true)
    const { data } = await client.get('/api/portfolios')
    setPortfolios(data)

    const summaryEntries = await Promise.all(
      data.map(async (p) => {
        try {
          const res = await client.get(`/api/portfolios/${p.id}/analytics/summary`)
          return [p.id, res.data]
        } catch {
          return [p.id, null]
        }
      }),
    )
    setSummaries(Object.fromEntries(summaryEntries))
    setLoading(false)
  }

  useEffect(() => {
    loadPortfolios()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await client.post('/api/portfolios', { name, description })
      setName('')
      setDescription('')
      setShowForm(false)
      await loadPortfolios()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Your portfolios</h1>
            <p style={styles.subtitle}>Track holdings, risk, and diversification across every account.</p>
          </div>
          <button style={styles.newBtn} onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : '+ New portfolio'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} style={styles.form}>
            <input
              style={styles.input}
              placeholder="Portfolio name (e.g. Long-term growth)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              style={styles.input}
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <button style={styles.submitBtn} type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        )}

        {loading ? (
          <p style={styles.muted}>Loading portfolios…</p>
        ) : portfolios.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No portfolios yet. Create one to start tracking holdings.</p>
          </div>
        ) : (
          <div style={styles.grid}>
            {portfolios.map((p) => (
              <PortfolioCard key={p.id} portfolio={p} summary={summaries[p.id]} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '36px 24px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  title: { fontSize: 26 },
  subtitle: { color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 },
  newBtn: {
    background: 'var(--accent)',
    color: '#1A1204',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 18px',
    fontWeight: 600,
    fontSize: 14,
  },
  form: {
    display: 'flex',
    gap: 10,
    marginBottom: 24,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 16,
  },
  input: {
    flex: 1,
    background: 'var(--surface-raised)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontSize: 14,
  },
  submitBtn: {
    background: 'var(--accent)',
    color: '#1A1204',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 18px',
    fontWeight: 600,
    fontSize: 14,
  },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 },
  muted: { color: 'var(--text-muted)' },
  emptyState: {
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: 48,
    textAlign: 'center',
    color: 'var(--text-secondary)',
  },
}
