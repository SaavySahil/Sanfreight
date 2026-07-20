import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import client, { API_BASE } from '../api/client.js'
import { useToast } from '../context/ToastContext.jsx'
import styles from './Form.module.css'

const INITIAL = {
  title: '', category: '', status: 'ongoing', location: '',
  scope: '', size: '', client_name: '', services: '',
  partners: '', story_headline: '', story_body: '',
  client_testimonial: '', thumbnail: '', is_featured: false,
}

export default function ProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = Boolean(id)
  const [form, setForm] = useState(INITIAL)
  const addToast = useToast()
  const [gallery, setGallery] = useState([])
  const [uploading, setUploading] = useState(false)

  const { data: existing } = useQuery({
    queryKey: ['project', id],
    queryFn: () => client.get(`/api/admin/projects`).then(r => r.data.find(p => p.id === id)),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      const sanitized = { ...INITIAL }
      Object.keys(INITIAL).forEach(key => {
        sanitized[key] = existing[key] ?? INITIAL[key]
      })
      setForm(sanitized)
      setGallery(existing.gallery || [])
    }
  }, [existing])

  function set(key, val) { 
    const safeVal = val ?? ''
    setForm(prev => ({ ...prev, [key]: safeVal })) 
  }

  async function uploadImage(file) {
    const fd = new FormData()
    fd.append('image', file)
    const res = await client.post('/api/admin/upload', fd)
    return res.data.filename
  }

  async function handleThumbnailChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const filename = await uploadImage(file)
      set('thumbnail', filename)
    } catch { addToast('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  async function handleGalleryAdd(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const filename = await uploadImage(file)
      setGallery(prev => [...prev, filename])
    } catch { addToast('Upload failed', 'error') }
    finally { setUploading(false) }
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = { ...form, gallery }
      return isEdit
        ? client.put(`/api/admin/projects/${id}`, payload)
        : client.post('/api/admin/projects', payload)
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-projects'])
      navigate('/projects')
    },
    onError: err => addToast(err.response?.data?.error || 'Save failed', 'error'),
  })

  function handleSubmit(e) {
    e.preventDefault()
    saveMutation.mutate()
  }



  return (
    <div>
      <h1 className={styles.heading}>{isEdit ? 'Edit Project' : 'New Project'}</h1>
      <div className={styles.form}>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>Title *</label>
            <input className={styles.input} value={form.title}
              onChange={e => set('title', e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Category</label>
            <input className={styles.input} value={form.category}
              onChange={e => set('category', e.target.value)} placeholder="e.g. Residential" />
          </div>
        </div>

        <div className={styles.row3}>
          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <select className={styles.input} value={form.status}
              onChange={e => set('status', e.target.value)}>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Location</label>
            <input className={styles.input} value={form.location}
              onChange={e => set('location', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Size</label>
            <input className={styles.input} value={form.size}
              onChange={e => set('size', e.target.value)} placeholder="e.g. 45,000 sq ft" />
          </div>
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label}>Client Name</label>
            <input className={styles.input} value={form.client_name}
              onChange={e => set('client_name', e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Scope</label>
            <input className={styles.input} value={form.scope}
              onChange={e => set('scope', e.target.value)} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Services (comma-separated)</label>
          <input className={styles.input} value={form.services}
            onChange={e => set('services', e.target.value)}
            placeholder="Design, Construction, Project Management" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Story Headline</label>
          <input className={styles.input} value={form.story_headline}
            onChange={e => set('story_headline', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Story Body</label>
          <textarea className={styles.textarea} rows={5} value={form.story_body}
            onChange={e => set('story_body', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Client Testimonial</label>
          <textarea className={styles.textarea} rows={3} value={form.client_testimonial}
            onChange={e => set('client_testimonial', e.target.value)} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Thumbnail</label>
          <input type="file" accept="image/*" onChange={handleThumbnailChange} className={styles.fileInput} />
          {form.thumbnail && (
            <img src={`${API_BASE}/api/uploads/images/${form.thumbnail}`}
              alt="thumbnail" className={styles.thumb} />
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Gallery Images</label>
          <input type="file" accept="image/*" onChange={handleGalleryAdd} className={styles.fileInput} />
          <div className={styles.gallery}>
            {gallery.map((f, i) => (
              <div key={f} className={styles.galleryItem}>
                <img src={`${API_BASE}/api/uploads/images/${f}`} alt={`gallery-${i}`} />
                <button type="button" className={styles.removeImg}
                  onClick={() => setGallery(prev => prev.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.checkRow}>
          <input type="checkbox" id="featured" checked={form.is_featured}
            onChange={e => set('is_featured', e.target.checked)} />
          <label htmlFor="featured" className={styles.checkLabel}>Featured project (shown on homepage)</label>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.cancel}
            onClick={() => navigate('/projects')}>Cancel</button>
          <button type="button" className={styles.save}
            onClick={handleSubmit}
            disabled={saveMutation.isPending || uploading}>
            {saveMutation.isPending ? 'Saving…' : 'Save Project'}
          </button>
        </div>
      </div>
    </div>
  )
}
