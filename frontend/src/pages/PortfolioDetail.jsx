import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import HoldingsTable from '../components/HoldingsTable.jsx'
import AddHoldingModal from '../components/AddHoldingModal.jsx'
import RiskPanel from '../components/RiskPanel.jsx'
import AIInsightCard from '../components/AIInsightCard.jsx'
import client from '../api/client.js'

export default function PortfolioDetail() {
  const { portfolioId } = useParams()
  const [portfolio, setPortfolio] = useState(null)
  const [summary, setSummary] = useState(null)
  const [risk, setRisk] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [tab, setTab] = useState('holdings')

  const loadAll = async () => {
    setLoading(true)
    const [{ data: p }, { data: s }] = await Promise.all([
      client.get(`/api/portfolios/${portfolioId}`),
      client.get(`/api/portfolios/${portfolioId}/analytics/summary`),
    ])
    setPortfolio(p)
    setSummary(s)
    setLoading(false)

    // Risk metrics can be slower (pulls price history) — load after initial paint
    client.get(`/api/portfolios/${portfolioId}/analytics/risk`).then(({ data }) => setRisk(data))
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolioId])

  const handleAddHolding = async (payload) => {
    await client.post(`/api/portfolios/${portfolioId}/holdings`, payload)
    await loadAll()
  }

  const handleDeleteHolding = async (holdingId) => {
    await client.delete(`/api/portfolios/${portfolioId}/holdings/${holdingId}`)
    await loadAll()
  }

  const handleGenerateInsight = async () => {
    const { data } = await client.post(`/api/portfolios/${portfolioId}/insights`, {})
    return data
  }

  if (loading || !portfolio) {
    return (
      <div>
        <Navbar />
        <p style={{ padding: 32, color: 'var(--text-muted)' }}>Loading portfolio…</p>
      </div>
    )
  }

  const isPositive = (summary?.total_gain_loss ?? 0) >= 0

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <Link to="/" style={styles.backLink}>← All portfolios</Link>

        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>{portfolio.name}</h1>
            {portfolio.description && <p style={styles.subtitle}>{portfolio.description}</p>}
          </div>
          <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
            + Add holding
          </button>
        </div>

        <div style={styles.summaryRow}>
          <div>
            <div style={styles.summaryLabel}>Market value</div>
            <div className="mono-num" style={styles.summaryValue}>
              ${summary.total_market_value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div style={styles.summaryLabel}>Total gain/loss</div>
            <div className={`mono-num ${isPositive ? 'positive' : 'negative'}`} style={styles.summaryValue}>
              {isPositive ? '+' : ''}
              {summary.total_gain_loss.toLocaleString(undefined, { maximumFractionDigits: 2 })} ({isPositive ? '+' : ''}
              {summary.total_gain_loss_pct.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="ticker-rule" />

        <div style={styles.tabs}>
          {['holdings', 'risk', 'ai'].map((t) => (
            <button
              key={t}
              style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
              onClick={() => setTab(t)}
            >
              {t === 'holdings' ? 'Holdings' : t === 'risk' ? 'Risk & diversification' : 'AI insight'}
            </button>
          ))}
        </div>

        {tab === 'holdings' && (
          <HoldingsTable holdings={summary.holdings} onDelete={handleDeleteHolding} />
        )}
        {tab === 'risk' && <RiskPanel risk={risk} />}
        {tab === 'ai' && <AIInsightCard onGenerate={handleGenerateInsight} />}
      </div>

      {showAddModal && (
        <AddHoldingModal onClose={() => setShowAddModal(false)} onSubmit={handleAddHolding} />
      )}
    </div>
  )
}

const styles = {
  container: { maxWidth: 1000, margin: '0 auto', padding: '28px 24px 60px' },
  backLink: { color: 'var(--text-secondary)', fontSize: 13 },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 16 },
  title: { fontSize: 26 },
  subtitle: { color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 },
  addBtn: {
    background: 'var(--accent)',
    color: '#1A1204',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 18px',
    fontWeight: 600,
    fontSize: 14,
  },
  summaryRow: { display: 'flex', gap: 48, marginTop: 24 },
  summaryLabel: { color: 'var(--text-muted)', fontSize: 12, marginBottom: 6 },
  summaryValue: { fontSize: 22, fontWeight: 600 },
  tabs: { display: 'flex', gap: 4, marginBottom: 18 },
  tab: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 16px',
    fontSize: 13.5,
  },
  tabActive: {
    background: 'var(--surface-raised)',
    color: 'var(--accent)',
    borderColor: 'var(--accent-dim)',
  },
}
