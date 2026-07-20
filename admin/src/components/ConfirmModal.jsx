import styles from './ConfirmModal.module.css'

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-msg">
      <div className={styles.modal}>
        <p className={styles.msg} id="confirm-msg">{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel} autoFocus>Cancel</button>
          <button className={styles.confirm} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
}
