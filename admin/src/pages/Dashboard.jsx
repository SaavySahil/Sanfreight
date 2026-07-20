import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import client from '../api/client.js'
import { SkeletonCard } from '../components/Skeleton.jsx'
import styles from './Dashboard.module.css'

function useCount(url) {
  return useQuery({
    queryKey: [url],
    queryFn: () => client.get(url).then(r => r.data.length),
  })
}

const CARD_DEFS = [
  { label: 'Projects',     url: '/api/admin/projects',     to: '/projects'     },
  { label: 'Job Listings', url: '/api/admin/jobs',         to: '/jobs'         },
  { label: 'Articles',     url: '/api/admin/articles',     to: '/articles'     },
  { label: 'Applications', url: '/api/admin/applications', to: '/applications' },
]

function StatCard({ label, to, value, isLoading }) {
  if (isLoading) return <SkeletonCard />
  return (
    <Link to={to} className={styles.card}>
      <span className={styles.count}>{value ?? '—'}</span>
      <span className={styles.cardLabel}>{label}</span>
    </Link>
  )
}

export default function Dashboard() {
  const projects     = useCount('/api/admin/projects')
  const jobs         = useCount('/api/admin/jobs')
  const articles     = useCount('/api/admin/articles')
  const applications = useCount('/api/admin/applications')

  const results = [projects, jobs, articles, applications]

  return (
    <div>
      <h1 className={styles.heading}>Dashboard</h1>
      <div className={styles.grid}>
        {CARD_DEFS.map((c, i) => (
          <StatCard
            key={c.label}
            label={c.label}
            to={c.to}
            value={results[i].data}
            isLoading={results[i].isLoading}
          />
        ))}
      </div>

      <div className={styles.links}>
        <h2 className={styles.sub}>Quick Actions</h2>
        <div className={styles.btnRow}>
          <Link to="/projects/new" className={styles.action}>+ New Project</Link>
          <Link to="/jobs/new"     className={styles.action}>+ New Job</Link>
          <Link to="/articles/new" className={styles.action}>+ New Article</Link>
        </div>
      </div>
    </div>
  )
}
