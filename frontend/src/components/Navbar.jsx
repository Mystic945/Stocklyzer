import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>
        <span style={styles.brandMark}>◆</span> Stocklyzer
      </Link>
      {user && (
        <div style={styles.right}>
          <span style={styles.name}>{user.full_name}</span>
          <button
            style={styles.logoutBtn}
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 32px',
    borderBottom: '1px solid var(--border)',
    background: 'var(--surface)',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  brandMark: {
    color: 'var(--accent)',
    fontSize: 14,
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  name: {
    color: 'var(--text-secondary)',
    fontSize: 14,
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border)',
    color: 'var(--text-secondary)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 14px',
    fontSize: 13,
  },
}
