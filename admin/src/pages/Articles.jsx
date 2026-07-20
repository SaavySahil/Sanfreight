import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import client from '../api/client.js'
import StatusBadge from '../components/StatusBadge.jsx'
import { SkeletonRow } from '../components/Skeleton.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useToast } from '../context/ToastContext.jsx'
import styles from './ListPage.module.css'

export default function Articles() {
  const qc = useQueryClient()
  const addToast = useToast()
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search, setSearch] = useState('')

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => client.get('/api/admin/articles').then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: id => client.delete(`/api/admin/articles/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['admin-articles'])
      addToast('Article deleted', 'success')
    },
    onError: () => addToast('Delete failed', 'error'),
  })

  const q = search.toLowerCase()
  const filtered = articles.filter(a =>
    a.title?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q) || a.author?.toLowerCase().includes(q)
  )

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.heading}>Blog Articles</h1>
        <Link to="/articles/new" className={styles.addBtn}>+ New Article</Link>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search articles…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search articles"
        />
        {search && <span className={styles.searchCount}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>}
      </div>

      {isLoading ? (
        <div className={styles.table}>
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)}
        </div>
      ) : (
        <div className={styles.table}>
          <div className={`${styles.row} ${styles.thead}`}>
            <span className={styles.title}>Title</span><span>Category</span><span>Author</span><span>Status</span><span>Published</span><span className={styles.actions}>Actions</span>
          </div>
          {filtered.map(a => (
            <div key={a.id} className={styles.row}>
              <span className={styles.title}>{a.title}</span>
              <span className={styles.muted}>{a.category || '—'}</span>
              <span className={styles.muted}>{a.author}</span>
              <span><StatusBadge value={a.is_published ? 'published' : 'draft'} /></span>
              <span className={styles.muted}>{a.published_at ? fmtDate(a.published_at) : '—'}</span>
              <span className={styles.actions}>
                <Link to={`/articles/${a.id}/edit`} className={styles.edit}>Edit</Link>
                <button className={styles.del} onClick={() => setDeleteTarget(a)}>Delete</button>
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className={styles.empty}>{search ? 'No results found.' : 'No articles yet. Create your first one.'}</p>
          )}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.title}"?`}
          onConfirm={() => { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null) }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
