import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Sidebar.module.css'

const NAV = [
  { to: '/dashboard',    label: 'Dashboard' },
  { to: '/jobs',         label: 'Jobs' },
  { to: '/applications', label: 'Applications' },
  { to: '/articles',     label: 'Blog Articles' },
]

export default function Sidebar({ onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function handleNavClick() {
    if (onClose) onClose()
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandTop}>
          <img
            src="/sanfreight-logo.webp"
            alt="Sanfreight Logistics"
            className={styles.brandLogo}
          />
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">×</button>
          )}
        </div>
      </div>

      <nav className={styles.nav} aria-label="Main navigation">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>


      <div className={styles.footer}>
        <p className={styles.userEmail}>{user?.email}</p>
        <button className={styles.logout} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}
