import styles from './StatusBadge.module.css'

const MAP = {
  ongoing:   { label: 'Ongoing',   cls: styles.ongoing },
  completed: { label: 'Completed', cls: styles.completed },
  'full-time':  { label: 'Full-Time',  cls: styles.fulltime },
  'part-time':  { label: 'Part-Time',  cls: styles.parttime },
  contract:  { label: 'Contract',  cls: styles.contract },
  active:    { label: 'Active',    cls: styles.active },
  inactive:  { label: 'Inactive',  cls: styles.inactive },
  published: { label: 'Published', cls: styles.active },
  draft:     { label: 'Draft',     cls: styles.inactive },
}

export default function StatusBadge({ value }) {
  const entry = MAP[value] || { label: value, cls: styles.default }
  return <span className={`${styles.badge} ${entry.cls}`}>{entry.label}</span>
}
