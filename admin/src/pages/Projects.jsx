import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import client from '../api/client.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { SkeletonRow } from '../components/Skeleton.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useToast } from '../context/ToastContext.jsx'
import styles from './ListPage.module.css'

export default function Projects() {
  const qc = useQueryClient()
  const addToast = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => client.get('/api/admin/projects').then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: id => client.delete(`/api/admin/projects/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['admin-projects'])
      addToast('Project deleted', 'success')
    },
    onError: () => addToast('Delete failed', 'error'),
  })

  function confirmDelete(project) { setDeleteTarget(project) }
  function handleDelete() {
    deleteMutation.mutate(deleteTarget.id)
    setDeleteTarget(null)
  }

  const q = search.toLowerCase()
  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
  )

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Projects</h1>
        <Link to="/projects/new" className={styles.addBtn}>+ Add Project</Link>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search projects…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search projects"
        />
        {search && <span className={styles.searchCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>}
      </div>

      {isLoading ? (
        <div className={styles.table}>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)}
        </div>
      ) : (
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.thead}`}>
            <span className={styles.title}>Title</span><span>Category</span><span>Status</span><span>Featured</span><span className={styles.actions}>Actions</span>
          </div>
          {filtered.map(p => (
            <div key={p.id} className={styles.row}>
              <span className={styles.title}>{p.title}</span>
              <span className={styles.muted}>{p.category || '—'}</span>
              <span><StatusBadge value={p.status} /></span>
              <span>{p.is_featured ? '★' : ''}</span>
              <span className={styles.actions}>
                <Link to={`/projects/${p.id}/edit`} className={styles.edit}>Edit</Link>
                <button className={styles.del} onClick={() => confirmDelete(p)}>Delete</button>
              </span>
            </div>
          ))}
          {filtered.length === 0 && <p className={styles.empty}>{search ? 'No results found.' : 'No projects yet.'}</p>}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}
