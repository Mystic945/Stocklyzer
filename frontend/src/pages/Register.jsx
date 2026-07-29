import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({ email, fullName, password })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Start tracking a portfolio in minutes.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Full name
            <input style={styles.input} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label style={styles.label}>
            Email
            <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label style={styles.label}>
            Password
            <input
              style={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </label>
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.submitBtn} type="submit" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: 20,
  },
  card: {
    width: 380,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: 36,
  },
  title: { fontSize: 26, marginBottom: 6 },
  subtitle: { color: 'var(--text-secondary)', fontSize: 14, marginTop: 4, marginBottom: 20 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  label: { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-secondary)' },
  input: {
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
    padding: '11px 0',
    fontWeight: 600,
    fontSize: 14,
    marginTop: 6,
  },
  error: { color: 'var(--negative)', fontSize: 13, margin: 0 },
  footer: { textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)', marginTop: 20 },
  link: { color: 'var(--accent)', fontWeight: 500 },
}
