import axios from 'axios'

const h = window.location.hostname
const fallbackAPI = (h === 'localhost' || h === '127.0.0.1')
    ? 'http://localhost:5000'
    : 'https://sanfreight-api.onrender.com'

export const API_BASE = import.meta.env.VITE_API_BASE || fallbackAPI


const client = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
})

// Attach JWT token from localStorage
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sanfreight_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto logout on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sanfreight_token')
      localStorage.removeItem('sanfreight_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

export default client
