import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client.js'
import Toast from '../components/Toast.jsx'
import styles from './Content.module.css'

export default function Content() {
  const qc = useQueryClient()
  const [toast, setToast] = useState(null)
  const [editing, setEditing] = useState({})

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ['admin-content'],
    queryFn: () => client.get('/api/admin/content').then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: ({ key, value }) => client.put(`/api/admin/content/${key}`, { value }),
    onSuccess: (_, { key }) => {
      qc.invalidateQueries(['admin-content'])
      setEditing(prev => { const n = { ...prev }; delete n[key]; return n })
      setToast({ message: 'Saved', type: 'success' })
    },
    onError: () => setToast({ message: 'Save failed', type: 'error' }),
  })

  function startEdit(field) {
    setEditing(prev => ({ ...prev, [field.key]: field.value }))
  }

  function cancelEdit(key) {
    setEditing(prev => { const n = { ...prev }; delete n[key]; return n })
  }

  return (
    <div>
      <h1 className={styles.heading}>CMS Content</h1>
      <p className={styles.sub}>Edit text content that appears on the public website.</p>

      {isLoading ? <p className={styles.muted}>Loading…</p> : (
        <div className={styles.list}>
          {fields.map(f => (
            <div key={f.key} className={styles.field}>
              <div className={styles.fieldMeta}>
                <span className={styles.fieldLabel}>{f.label || f.key}</span>
                <span className={styles.fieldKey}>{f.key}</span>
              </div>

              {editing[f.key] !== undefined ? (
                <div className={styles.editRow}>
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={editing[f.key]}
                    onChange={e => setEditing(prev => ({ ...prev, [f.key]: e.target.value }))}
                  />
                  <div className={styles.editActions}>
                    <button className={styles.cancel} onClick={() => cancelEdit(f.key)}>Cancel</button>
                    <button
                      className={styles.save}
                      disabled={saveMutation.isPending}
                      onClick={() => saveMutation.mutate({ key: f.key, value: editing[f.key] })}
                    >Save</button>
                  </div>
                </div>
              ) : (
                <div className={styles.valueRow}>
                  <p className={styles.value}>{f.value || <em className={styles.empty}>—</em>}</p>
                  <button className={styles.editBtn} onClick={() => startEdit(f)}>Edit</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  )
}
