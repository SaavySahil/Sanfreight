import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client, { API_BASE } from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import styles from './Form.module.css'

const INITIAL = {
  title: '',
  summary: '',
  body: '',
  thumbnail: '',
  category: '',
  author: 'Sanfreight Team',
  is_published: false,
}

const CATEGORIES = ['Construction', 'Innovation', 'Sustainability', 'Safety', 'Company News', 'Projects']

export default function ArticleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = Boolean(id)
  const addToast = useToast()
  const [form, setForm] = useState(INITIAL)
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.body.trim()) e.body = 'Body content is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const { data: existing } = useQuery({
    queryKey: ['admin-article', id],
    queryFn: () => client.get('/api/admin/articles').then(r => r.data.find(a => a.id === id)),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      const sanitized = { ...INITIAL }
      Object.keys(INITIAL).forEach(key => {
        sanitized[key] = existing[key] ?? INITIAL[key]
      })
      setForm(sanitized)
    }
  }, [existing])

  function set(key, val) { 
    const safeVal = val ?? ''
    setForm(prev => ({ ...prev, [key]: safeVal })) 
  }

  async function handleThumbnailChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await client.post('/api/admin/upload', fd)
      set('thumbnail', res.data.filename)
    } catch { addToast('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  const saveMutation = useMutation({
    mutationFn: () => isEdit
      ? client.put(`/api/admin/articles/${id}`, form)
      : client.post('/api/admin/articles', form),
    onSuccess: () => {
      qc.invalidateQueries(['admin-articles'])
      navigate('/articles')
    },
    onError: () => addToast('Save failed', 'error'),
  })

  return (
    <div className={styles.shell}>
      <h1 className={styles.heading}>{isEdit ? 'Edit Article' : 'New Article'}</h1>

      <div className={styles.form}>
        <label className={styles.label}>Title *</label>
        <input className={`${styles.input} ${errors.title ? styles.inputError : ''}`} value={form.title}
          onChange={e => { set('title', e.target.value); setErrors(p => ({ ...p, title: '' })) }}
          placeholder="Article title" />
        {errors.title && <span className={styles.fieldError}>{errors.title}</span>}

        <label className={styles.label}>Category</label>
        <select className={styles.input} value={form.category} onChange={e => set('category', e.target.value)}>
          <option value="">— Select category —</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <label className={styles.label}>Author</label>
        <input className={styles.input} value={form.author} onChange={e => set('author', e.target.value)} placeholder="Author name" />

        <label className={styles.label}>Summary</label>
        <textarea className={styles.textarea} rows={3} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Short description shown on the articles listing page" />

        <label className={styles.label}>Body (HTML or plain text) *</label>
        <textarea className={`${styles.textarea} ${errors.body ? styles.inputError : ''}`} rows={14} value={form.body}
          onChange={e => { set('body', e.target.value); setErrors(p => ({ ...p, body: '' })) }}
          placeholder="Full article content..." />
        {errors.body && <span className={styles.fieldError}>{errors.body}</span>}

        <label className={styles.label}>Thumbnail</label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} className={styles.input} />
        {uploading && <p className={styles.hint}>Uploading…</p>}
        {form.thumbnail && (
          <img
            src={`${API_BASE}/api/uploads/images/${form.thumbnail}`}

            alt="thumbnail preview"
            style={{ maxWidth: 220, marginTop: 8, borderRadius: 6 }}
          />
        )}

        <label className={styles.label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} />
          Publish immediately
        </label>

        <div className={styles.btnRow}>
          <button className={styles.save} onClick={() => validate() && saveMutation.mutate()} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Article'}
          </button>
          <button className={styles.cancel} onClick={() => navigate('/articles')}>Cancel</button>
        </div>
      </div>

    </div>
  )
}
