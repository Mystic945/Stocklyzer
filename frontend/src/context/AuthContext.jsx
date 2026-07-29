import { createContext, useContext, useEffect, useState } from 'react'
import client from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('stocklyzer_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  const persistSession = (data) => {
    localStorage.setItem('stocklyzer_token', data.access_token)
    localStorage.setItem('stocklyzer_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const register = async ({ email, fullName, password }) => {
    setLoading(true)
    try {
      const { data } = await client.post('/api/auth/register', {
        email,
        full_name: fullName,
        password,
      })
      persistSession(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const login = async ({ email, password }) => {
    setLoading(true)
    try {
      const form = new URLSearchParams()
      form.set('username', email)
      form.set('password', password)
      const { data } = await client.post('/api/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      persistSession(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async (idToken) => {
    setLoading(true)
    try {
      const { data } = await client.post('/api/auth/google', { id_token: idToken })
      persistSession(data)
      return data
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('stocklyzer_token')
    localStorage.removeItem('stocklyzer_user')
    setUser(null)
  }

  useEffect(() => {
    // Keep tab in sync if token is cleared elsewhere (e.g. 401 interceptor)
    const handler = () => {
      if (!localStorage.getItem('stocklyzer_token')) setUser(null)
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
