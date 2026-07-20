import { createContext, useContext, useState } from 'react'
import client from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sanfreight_token'))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sanfreight_user')) } catch { return null }
  })

  async function login(email, password) {
    const res = await client.post('/api/auth/login', { email, password })
    const { token: tok, user: u } = res.data
    localStorage.setItem('sanfreight_token', tok)
    localStorage.setItem('sanfreight_user', JSON.stringify(u))
    setToken(tok)
    setUser(u)
  }

  function logout() {
    localStorage.removeItem('sanfreight_token')
    localStorage.removeItem('sanfreight_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
