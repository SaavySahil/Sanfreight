import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import client from '../api/client.js'
import styles from './Login.module.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [slowHint, setSlowHint] = useState(false)
  const slowTimer = useRef(null)
  const hintTimer = useRef(null)

  // Pre-warm the Render backend as soon as the login page mounts
  useEffect(() => {
    client.get('/api/health').catch(() => {})
  }, [])

  function startSlowHint() {
    slowTimer.current = setTimeout(() => setSlowHint(true), 5000)
  }

  function stopSlowHint() {
    clearTimeout(slowTimer.current)
    clearTimeout(hintTimer.current)
    setSlowHint(false)
  }

  async function handleSubmit(e) {
    if (e) e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Email is required'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email address'); return }
    if (!password) { setError('Password is required'); return }
    setLoading(true)
    startSlowHint()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
      stopSlowHint()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrapper}>
          <img src="/sanfreight-logo.webp" alt="Sanfreight" className={styles.logo} />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="admin@sanfreight.com"
          required
          autoFocus
        />

        <label className={styles.label}>Password</label>
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="••••••••"
          required
        />

        <button className={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {slowHint && (
          <p className={styles.slowHint}>
            Server is warming up — this can take up to 30 seconds on first load.
          </p>
        )}
      </div>
    </div>
  )
}
