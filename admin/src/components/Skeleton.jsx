import styles from './Skeleton.module.css'

export function Skeleton({ width, height, radius, className }) {
  return (
    <span
      className={`${styles.skeleton} ${className || ''}`}
      style={{ width, height, borderRadius: radius }}
    />
  )
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <div className={styles.row}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height="14px" width={i === 0 ? '40%' : '60px'} radius="4px" />
      ))}
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <Skeleton height="36px" width="60px" radius="6px" />
      <Skeleton height="13px" width="80px" radius="4px" />
    </div>
  )
}
