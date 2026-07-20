import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import styles from './Layout.module.css'

export default function Layout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className={styles.shell}>
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button 
          className={styles.menuToggle} 
          onClick={() => setSidebarOpen(true)}
          aria-label="Open Menu"
        >
          ☰
        </button>
        <span className={styles.mobileBrand}>Sanfreight Admin</span>
      </header>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`${styles.sidebarWrapper} ${isSidebarOpen ? styles.open : ''}`}
      >
        <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <main className={styles.main}>
        <div className={styles.contentContainer}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
