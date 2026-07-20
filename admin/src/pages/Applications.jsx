import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client from '../api/client.js'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { useToast } from '../context/ToastContext.jsx'
import styles from './Applications.module.css'

const STATUS_META = {
  new:         { label: 'New',         color: '#3b82f6', bg: '#eff6ff' },
  reviewed:    { label: 'Reviewed',    color: '#d97706', bg: '#fffbeb' },
  shortlisted: { label: 'Shortlisted', color: '#059669', bg: '#ecfdf5' },
  rejected:    { label: 'Rejected',    color: '#dc2626', bg: '#fef2f2' },
}

export default function Applications() {
  const qc = useQueryClient()
  const addToast = useToast()
  const [selected, setSelected] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-applications'],
    queryFn: () => client.get('/api/admin/applications').then(r => r.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      client.patch(`/api/admin/applications/${id}/status`, { status }),
    onSuccess: (res) => {
      qc.setQueryData(['admin-applications'], old =>
        old.map(a => a.id === res.data.id ? res.data : a)
      )
      setSelected(res.data)
      addToast('Status updated', 'success')
    },
    onError: () => addToast('Failed to update status', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: id => client.delete(`/api/admin/applications/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['admin-applications'])
      addToast('Application deleted', 'success')
      closeModal()
    },
    onError: () => addToast('Delete failed', 'error'),
  })

  // Load resume preview blob whenever selected changes
  useEffect(() => {
    if (!selected?.has_resume) { setPreviewUrl(null); return }
    let active = true
    setPreviewLoading(true)
    setPreviewUrl(null)
    client.get(`/api/admin/applications/${selected.id}/resume?inline=1`, { responseType: 'blob' })
      .then(res => { if (active) setPreviewUrl(URL.createObjectURL(res.data)) })
      .catch(() => { if (active) setPreviewUrl(null) })
      .finally(() => { if (active) setPreviewLoading(false) })
    return () => { active = false }
  }, [selected?.id])

  async function downloadResume(app) {
    try {
      const res = await client.get(`/api/admin/applications/${app.id}/resume`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume-${app.applicant_name.replace(/\s+/g, '-')}.${app.resume_ext || 'pdf'}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      addToast('Failed to download resume', 'error')
    }
  }

  function closeModal() {
    setSelected(null)
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
  }

  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter(a => a.status === filterStatus)

  return (
    <div className={styles.page}>
      {/* ── HEADER ── */}
      <div className={styles.header}>
        <h1 className={styles.heading}>Applications</h1>
        <div className={styles.filterRow}>
          {['all', 'new', 'reviewed', 'shortlisted', 'rejected'].map(s => {
            const count = s === 'all'
              ? applications.length
              : applications.filter(a => a.status === s).length
            const meta = STATUS_META[s]
            return (
              <button
                key={s}
                className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ''}`}
                style={filterStatus === s && meta ? { borderColor: meta.color, color: meta.color } : {}}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? 'All' : meta.label}
                <span className={styles.filterCount}
                  style={filterStatus === s && meta ? { background: meta.color } : {}}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── TABLE ── */}
      {isLoading ? (
        <p className={styles.empty}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>No applications{filterStatus !== 'all' ? ` with status "${filterStatus}"` : ''} yet.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Email</th>
                <th>Applied For</th>
                <th>Date</th>
                <th>Status</th>
                <th>Resume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const meta = STATUS_META[a.status] || STATUS_META.new
                return (
                  <tr key={a.id}>
                    <td className={styles.tdName}>{a.applicant_name}</td>
                    <td className={styles.tdMuted}>{a.email}</td>
                    <td>{a.job_title || '—'}</td>
                    <td className={styles.tdMuted}>{fmtDate(a.applied_at)}</td>
                    <td>
                      <span className={styles.statusPill}
                        style={{ color: meta.color, background: meta.bg }}>
                        {meta.label}
                      </span>
                    </td>
                    <td>
                      {a.has_resume
                        ? <span className={styles.resumeTag}>Attached</span>
                        : <span className={styles.tdMuted}>—</span>}
                    </td>
                    <td className={styles.tdActions}>
                      <button className={styles.viewBtn} onClick={() => setSelected(a)}>View</button>
                      <button className={styles.delRowBtn} onClick={() => setDeleteTarget(a)}>Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      {selected && (
        <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div className={styles.modal}>

            {/* Modal header */}
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalName}>{selected.applicant_name}</h2>
                <p className={styles.modalMeta}>
                  {selected.email}{selected.phone && ` · ${selected.phone}`}
                </p>
              </div>
              <div className={styles.modalActions}>
                {selected.has_resume && (
                  <button className={styles.downloadBtn} onClick={() => downloadResume(selected)}>
                    ↓ Download Resume
                  </button>
                )}
                <button className={styles.closeBtn} onClick={closeModal}>✕</button>
              </div>
            </div>

            {/* Modal body: info left | resume right */}
            <div className={styles.modalBody}>

              {/* Left: details */}
              <div className={styles.detailCol}>
                <div className={styles.detailBlock}>
                  <label className={styles.fieldLabel}>Status</label>
                  <select
                    className={styles.statusSelect}
                    value={selected.status}
                    onChange={e => statusMutation.mutate({ id: selected.id, status: e.target.value })}
                    disabled={statusMutation.isPending}
                    style={{
                      color: STATUS_META[selected.status]?.color,
                      borderColor: STATUS_META[selected.status]?.color,
                    }}
                  >
                    {Object.entries(STATUS_META).map(([val, m]) => (
                      <option key={val} value={val}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.detailGrid}>
                  <div className={styles.detailBlock}>
                    <label className={styles.fieldLabel}>Applied For</label>
                    <p className={styles.fieldValue}>{selected.job_title || '—'}</p>
                  </div>
                  <div className={styles.detailBlock}>
                    <label className={styles.fieldLabel}>Date</label>
                    <p className={styles.fieldValue}>{fmtDate(selected.applied_at)}</p>
                  </div>
                  <div className={styles.detailBlock}>
                    <label className={styles.fieldLabel}>Email</label>
                    <p className={styles.fieldValue}>{selected.email}</p>
                  </div>
                  <div className={styles.detailBlock}>
                    <label className={styles.fieldLabel}>Phone</label>
                    <p className={styles.fieldValue}>{selected.phone || '—'}</p>
                  </div>
                </div>

                {selected.cover_note && (
                  <div className={styles.detailBlock} style={{ marginTop: 4 }}>
                    <label className={styles.fieldLabel}>Cover Letter</label>
                    <p className={styles.coverText}>{selected.cover_note}</p>
                  </div>
                )}

                <div className={styles.dangerZone}>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => { setDeleteTarget(selected); }}
                  >
                    Delete Application
                  </button>
                </div>
              </div>

              {/* Right: resume iframe */}
              <div className={styles.resumeCol}>
                <p className={styles.fieldLabel} style={{ marginBottom: 8 }}>Resume</p>
                {!selected.has_resume && (
                  <div className={styles.noResume}>No resume submitted</div>
                )}
                {selected.has_resume && previewLoading && (
                  <div className={styles.noResume}>Loading preview…</div>
                )}
                {selected.has_resume && !previewLoading && previewUrl && selected.resume_ext === 'pdf' && (
                  <iframe src={previewUrl} className={styles.resumeFrame} title="Resume" />
                )}
                {selected.has_resume && !previewLoading && selected.resume_ext !== 'pdf' && (
                  <div className={styles.noResume}>
                    <p>.{selected.resume_ext} files can't be previewed in browser.</p>
                    <button className={styles.downloadBtn} style={{ marginTop: 12 }} onClick={() => downloadResume(selected)}>
                      ↓ Download to View
                    </button>
                  </div>
                )}
                {selected.has_resume && !previewLoading && !previewUrl && selected.resume_ext === 'pdf' && (
                  <div className={styles.noResume}>Could not load preview. Use Download button.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Delete application from "${deleteTarget.applicant_name}"?`}
          onConfirm={() => {
            deleteMutation.mutate(deleteTarget.id)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}
