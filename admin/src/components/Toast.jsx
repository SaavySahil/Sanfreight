import { useEffect } from 'react'
import styles from './Toast.module.css'

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`${styles.toast} ${styles[type]}`}>
      {message}
      <button className={styles.close} onClick={onClose}>×</button>
    </div>
  )
}
