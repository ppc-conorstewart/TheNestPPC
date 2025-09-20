import { resolveApiUrl, resolveBotUrl } from '../../api'
// =========================== FILE: client/src/components/HQ-Dashboard/ActionItemsCard.jsx ===========================
// Sections: Imports • Add Modal • Edit Modal • Reminder Modal • Docs Modal • Row • Component

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiBell, FiCheckCircle, FiEdit2, FiPaperclip, FiPlus, FiUser, FiX } from 'react-icons/fi'

// ===========================
// SECTION: Add Modal
// ===========================
function AddModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    description: '',
    priority: 'Normal',
    category: 'General',
    due_date: ''
  })
  const [members, setMembers] = useState([])
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState({})
  const [focused, setFocused] = useState(false)

  const [uploading, setUploading] = useState(false)
  const [fileUrl, setFileUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return
    setForm({ description: '', priority: 'Normal', category: 'General', due_date: '' })
    setPicked({})
    setQuery('')
    setUploading(false)
    setFileUrl('')
    setFileName('')

    let cancelled = false
    const loadMembers = async () => {
      const resolvedDirect = resolveBotUrl('/members')
      const directUrl = resolvedDirect && /^https?:\/\//i.test(resolvedDirect) ? resolvedDirect : ''
      const fallbackUrl = resolveApiUrl('/api/discord/members')
      const storedKey = typeof window !== 'undefined' ? window.localStorage?.getItem('bot_key') : null
      const botKey = storedKey || process.env.REACT_APP_BOT_KEY || 'Paloma2025*'

      const attempt = async (url, options) => {
        if (!url) return null
        try {
          const res = await fetch(url, options)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = await res.json()
          return Array.isArray(data) ? data : null
        } catch (err) {
          console.warn('Failed to load Discord members from', url, err)
          return null
        }
      }

      const headers = botKey ? { 'x-bot-key': botKey } : {}
      let list = await attempt(directUrl, directUrl ? { headers } : undefined)
      if (!list) list = await attempt(fallbackUrl)
      if (!cancelled) setMembers(list || [])
    }

    loadMembers()

    return () => { cancelled = true }
  }, [open])

  const suggestions = useMemo(() => {
    const list = Array.isArray(members) ? members : []
    const f = (query || '').trim().toLowerCase()
    if (!f) return []
    const norm = (m) => ((m.displayName || m.username || '') + '').toLowerCase()
    return list
      .filter(m => !picked[m.id])
      .filter(m => norm(m).includes(f))
      .slice(0, 8)
  }, [members, picked, query])

  const togglePick = (m) => {
    setPicked(p => {
      const next = { ...p }
      if (next[m.id]) delete next[m.id]
      else next[m.id] = m
      return next
    })
  }

  const removePick = (id) => setPicked(p => {
    const next = { ...p }
    delete next[id]
    return next
  })

  const doUpload = async (file) => {
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append('model', file) // server expects 'model'
      const r = await fetch(resolveApiUrl('/api/upload-model'), { method: 'POST', body: fd })
      if (!r.ok) throw new Error('upload failed')
      const data = await r.json()
      setFileUrl(data.url || '')
      setFileName(file.name)
    } catch {
      setFileUrl('')
      setFileName('')
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer?.files?.[0]
    if (f) doUpload(f)
  }

  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'>
      <div className='bg-black rounded-2xl border-2 border-[#6a7257] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden'>
        <div className='flex items-center justify-between px-4 pt-3 pb-2'>
          <h3 className='text-base font-extrabold text-[#e6e8df]'>Add Action Item</h3>
          <button className='text-gray-400 hover:text-[#f00] font-bold text-lg leading-none' onClick={onClose}>×</button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault()
            const stakeholders = Object.values(picked).map(m => m.displayName || m.username)
            const stakeholder_ids = Object.keys(picked)
            const stakeholder_objects = Object.values(picked).map(m => ({
              id: m.id,
              name: m.displayName || m.username || ''
            }))
            onSubmit({
              description: form.description,
              priority: form.priority,
              category: form.category,
              due_date: form.due_date || null,
              stakeholders,
              stakeholder_ids,
              stakeholder_objects,
              attachment_url: fileUrl || null,
              attachment_name: fileName || null
            })
          }}
          className='flex flex-col flex-1 px-4 pb-3'
        >
          <div className='flex-1 overflow-y-auto pr-1'>
            <div className='grid grid-cols-2 gap-3'>
              <div className='grid gap-3'>
                <label className='text-xs font-bold text-[#e6e8df]'>
                  Description
                  <textarea
                    rows={2}
                    className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs resize-none'
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    required
                  />
                </label>

                <div className='grid grid-cols-3 gap-3'>
                  <label className='text-xs font-bold text-[#e6e8df]'>
                    Priority
                    <select
                      className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
                      value={form.priority}
                      onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </label>
                  <label className='text-xs font-bold text-[#e6e8df]'>
                    Category
                    <select
                      className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    >
                      <option>General</option>
                      <option>Operations</option>
                      <option>Safety</option>
                      <option>Logistics</option>
                      <option>Finance</option>
                    </select>
                  </label>
                  <label className='text-xs font-bold text-[#e6e8df]'>
                    Due Date
                    <input
                      type='date'
                      className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
                      value={form.due_date}
                      onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                    />
                  </label>
                </div>

                <div className='grid gap-2'>
                  <div className='text-xs font-bold text-[#e6e8df]'>Selected Stakeholders</div>
                  <div className='flex flex-wrap gap-1'>
                    {Object.values(picked).map(m => (
                      <span key={m.id} className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-[#3a3d33] text-[11px] text-[#b0b79f]'>
                        <FiUser className='opacity-80' /> {(m.displayName || m.username)}
                        <button type='button' className='ml-1 text-[#6a7257] hover:text-[#ffe066] font-bold' onClick={() => removePick(m.id)}>×</button>
                      </span>
                    ))}
                    {Object.keys(picked).length === 0 && (
                      <span className='text-[11px] text-[#6a7257] italic'>None</span>
                    )}
                  </div>
                </div>
              </div>

              <div className='grid gap-2'>
                <div className='text-xs font-bold text-[#e6e8df]'>Discord Members</div>

                <div className='relative grid gap-0'>
                  <input
                    className='w-full px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs mt-0'
                    placeholder='Search members...'
                    value={query}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setTimeout(() => setFocused(false), 150)}
                    onChange={e => setQuery(e.target.value)}
                  />

                  {focused && suggestions.length > 0 && (
                    <div className='absolute left-0 right-0 top-[30px] rounded-lg border-2 border-[#3a3d33] bg-[#171a14] p-1 z-10'>
                      {suggestions.map(m => (
                        <label key={m.id} className='flex items-center gap-2 py-1 px-2 text-[12px] text-[#cfd3c3] cursor-pointer hover:bg-[#20241a] rounded'>
                          <input
                            type='checkbox'
                            checked={!!picked[m.id]}
                            onChange={() => togglePick(m)}
                            className='accent-[#6a7257]'
                          />
                          {m.avatar ? <img src={m.avatar} alt='' className='w-5 h-5 rounded-full' /> : <FiUser className='opacity-70' />}
                          <span className='font-bold'>{m.displayName || m.username}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                  onDrop={onDrop}
                  className='rounded-xl border-2 border-dashed border-[#3a3d33] bg-[#171a14] px-3 py-3'
                  style={{ minHeight: 140 }}
                >
                  {!fileUrl ? (
                    <div className='flex items-center gap-2 text-[12px] text-[#cfd3c3]'>
                      <FiPaperclip className='opacity-80' />
                      <span className='font-bold'>Drag & drop file here, or</span>
                      <button
                        type='button'
                        onClick={() => inputRef.current?.click()}
                        className='underline'
                      >
                        browse
                      </button>
                      {uploading && <span className='italic text-[#6a7257]'>uploading…</span>}
                    </div>
                  ) : (
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2 text-[12px] text-[#cfd3c3]'>
                        <FiPaperclip className='opacity-80' />
                        <span className='font-bold'>{fileName}</span>
                        <span className='text-[#6a7257] font-mono'>{fileUrl}</span>
                      </div>
                      <button
                        type='button'
                        onClick={() => { setFileUrl(''); setFileName('') }}
                        className='text-[#ffe066] hover:text-white'
                        title='Remove'
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type='file'
                    className='hidden'
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) doUpload(f)
                      e.currentTarget.value = ''
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className='mt-3 flex justify-end gap-2 shrink-0'>
            <button
              type='button'
              className='px-3 py-1 rounded font-bold text-xs'
              style={{ background: '#10110e', border: '2px solid #6a7257', color: '#ffe066' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-3 py-1 rounded font-bold text-xs'
              style={{ background: '#6a7257', border: '2px solid #e6ffe6', color: '#fff' }}
              disabled={uploading}
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===========================
// SECTION: Edit Modal
// ===========================
function EditModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(() => ({
    description: initial?.description || '',
    priority: initial?.priority || 'Normal',
    category: initial?.category || 'General',
    due_date: initial?.due_date ? initial.due_date.slice(0, 10) : '',
    stakeholders: (initial?.stakeholders || []).join(', ')
  }))
  useEffect(() => {
    if (!initial) return
    setForm({
      description: initial.description || '',
      priority: initial.priority || 'Normal',
      category: initial.category || 'General',
      due_date: initial.due_date ? initial.due_date.slice(0, 10) : '',
      stakeholders: (initial.stakeholders || []).join(', ')
    })
  }, [initial])
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
      <div className='bg-[#23241b] rounded-2xl shadow-2xl border-2 border-[#6a7257] p-6 min-w-[420px] max-w-md w-full relative'>
        <button className='absolute top-3 right-3 text-gray-400 hover:text-[#f00] font-bold text-lg' onClick={onClose}>×</button>
        <h3 className='text-lg font-extrabold text-[#e6e8df] mb-4 text-center'>Edit Action Item</h3>
        <form
          onSubmit={e => {
            e.preventDefault()
            onSubmit({
              description: form.description,
              priority: form.priority,
              category: form.category,
              due_date: form.due_date || null,
              stakeholders: form.stakeholders.split(',').map(s => s.trim()).filter(Boolean)
            })
          }}
          className='grid gap-3'
        >
          <label className='text-xs font-bold text-[#e6e8df]'>
            Description
            <input
              className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              required
            />
          </label>
          <div className='grid grid-cols-3 gap-3'>
            <label className='text-xs font-bold text-[#e6e8df]'>
              Priority
              <select
                className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              >
                <option>Low</option>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </label>
            <label className='text-xs font-bold text-[#e6e8df]'>
              Category
              <select
                className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                <option>General</option>
                <option>Operations</option>
                <option>Safety</option>
                <option>Logistics</option>
                <option>Finance</option>
              </select>
            </label>
            <label className='text-xs font-bold text-[#e6e8df]'>
              Due Date
              <input
                type='date'
                className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
                value={form.due_date}
                onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
              />
            </label>
          </div>
          <label className='text-xs font-bold text-[#e6e8df]'>
            Tagged Stakeholders (comma-separated)
            <input
              className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
              value={form.stakeholders}
              onChange={e => setForm(f => ({ ...f, stakeholders: e.target.value }))}
            />
          </label>
          <div className='flex justify-end gap-2 pt-1'>
            <button
              type='button'
              className='px-3 py-1 rounded font-bold text-xs'
              style={{ background: '#10110e', border: '2px solid #6a7257', color: '#ffe066' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-3 py-1 rounded font-bold text-xs'
              style={{ background: '#6a7257', border: '2px solid #e6ffe6', color: '#fff' }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===========================
// SECTION: Reminder Modal
// ===========================
function ReminderModal({ open, onClose, onSubmit, initial }) {
  const [when, setWhen] = useState('24h')
  const [note, setNote] = useState('')
  useEffect(() => { setWhen('24h'); setNote('') }, [initial])
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
      <div className='bg-[#23241b] rounded-2xl shadow-2xl border-2 border-[#6a7257] p-6 min-w-[380px] max-w-md w-full relative'>
        <button className='absolute top-3 right-3 text-gray-400 hover:text-[#f00] font-bold text-lg' onClick={onClose}>×</button>
        <h3 className='text-lg font-extrabold text-[#e6e8df] mb-4 text-center'>Schedule Reminder</h3>
        <div className='grid gap-3'>
          <label className='text-xs font-bold text-[#e6e8df]'>
            When
            <select
              className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
              value={when}
              onChange={e => setWhen(e.target.value)}
            >
              <option value='1h'>In 1 hour</option>
              <option value='24h'>In 24 hours</option>
              <option value='3d'>In 3 days</option>
              <option value='1w'>In 1 week</option>
            </select>
          </label>
          <label className='text-xs font-bold text-[#e6e8df]'>
            Note (optional)
            <input
              className='w-full mt-1 px-2 py-1 rounded bg-[#191d18] text-white border-2 border-[#6a7257] font-bold text-xs'
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </label>
          <div className='flex justify-end gap-2 pt-1'>
            <button
              type='button'
              className='px-3 py-1 rounded font-bold text-xs'
              style={{ background: '#10110e', border: '2px solid #6a7257', color: '#ffe066' }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type='button'
              className='px-3 py-1 rounded font-bold text-xs'
              style={{ background: '#6a7257', border: '2px solid #e6ffe6', color: '#fff' }}
              onClick={() => onSubmit({ when, note })}
            >
              Set
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===========================
// SECTION: Docs Modal
// ===========================
function DocsModal({ open, onClose, item }) {
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
      <div className='bg-[#23241b] rounded-2xl shadow-2xl border-2 border-[#6a7257] p-6 min-w-[420px] max-w-2xl w-full relative'>
        <button className='absolute top-3 right-3 text-gray-400 hover:text-[#f00] font-bold text-lg' onClick={onClose}>×</button>
        <h3 className='text-lg font-extrabold text-[#e6e8df] mb-4 text-center'>Supporting Documents</h3>
        <div className='text-xs text-[#b0b79f] mb-3 text-center'>{item?.description || ''}</div>
        <div className='grid gap-2'>
          {(item?.documents || []).map((d, i) => (
            <a key={i} href={d.url} target='_blank' rel='noreferrer' className='underline text-[#cfd3c3] text-xs'>{d.name || d.url}</a>
          ))}
          {(!item?.documents || !item.documents.length) && (
            <div className='text-center text-[#6a7257] text-xs italic'>No documents attached.</div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===========================
// SECTION: Row
// ===========================
function Row({ item, selected, onSelect }) {
  const pill = (val) => {
    const map = {
      Low: 'bg-[#23301d] text-[#a9c27a] border-[#3b4a31]',
      Normal: 'bg-[#1f2b33] text-[#69bfe8] border-[#2e3f47]',
      High: 'bg-[#38231f] text-[#ffb39a] border-[#4a2d27]',
      Urgent: 'bg-[#3a2626] text-[#ff8e8e] border-[#523030]'
    }
    const cls = 'px-2 py-0.5 text[11px] text-[11px] font-bold rounded border ' + (map[val] || 'bg-[#252821] text-[#cfd3c3] border-[#3a3d33]')
    return <span className={cls}>{val}</span>
  }
  const base = 'grid grid-cols-[1fr_110px_140px_140px_1.2fr] items-center py-1 rounded-lg transition-all duration-150 cursor-pointer '
  const cls = base + (selected ? 'bg-gradient-to-r from-[#28301d]/90 to-[#1b1e16]/90 ring-2 ring-[#6a7257]' : 'hover:bg-[#20241a]/80')
  return (
    <div onClick={() => onSelect(item)} className={cls} style={{ minHeight: 32 }}>
      <div className='px-2'>
        <span className='text-[11px] text-[#e6e8df] font-bold leading-snug'>{item.description}</span>
      </div>
      <div className='px-2 flex items-center'>{pill(item.priority)}</div>
      <div className='px-2'>
        <span className='text-[11px] text-[#cfd3c3] font-bold'>{item.category || 'General'}</span>
      </div>
      <div className='px-2'>
        <span className='text-[11px] font-bold font-mono text-[#e6e8df]'>
          {item.due_date ? new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-'}
        </span>
      </div>
      <div className='px-2 flex flex-wrap gap-1 items-center'>
        {(() => {
          const detailList = Array.isArray(item.stakeholders_detail) && item.stakeholders_detail.length
            ? item.stakeholders_detail
            : (item.stakeholders || []).map(name => ({ name }))
          if (!detailList.length) {
            return <span className='text-[11px] text-[#6a7257] italic'>None</span>
          }
          return detailList.map((detail, i) => {
            const acknowledged = Boolean(detail.acknowledged)
            const baseCls = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition-colors'
            const ackCls = acknowledged
              ? 'border-[#2f4a31] bg-[#1b2d1b] text-[#8fffbb]'
              : 'border-[#3a3d33] bg-transparent text-[#b0b79f]'
            return (
              <span
                key={`${detail.id || detail.name || i}`}
                className={`${baseCls} ${ackCls}`}
                title={acknowledged ? 'Acknowledged' : 'Awaiting acknowledgement'}
              >
                {acknowledged ? <FiCheckCircle className='text-[#8fffbb]' size={10} /> : <FiUser className='opacity-80' size={10} />}
                {detail.name || 'Stakeholder'}
              </span>
            )
          })
        })()}
      </div>
    </div>
  )
}

// ===========================
// SECTION: Component
// ===========================
export default function ActionItemsCard() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openRemind, setOpenRemind] = useState(false)
  const [openDocs, setOpenDocs] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch(resolveApiUrl('/api/hq/action-items'))
      .then(r => (r.ok ? r.json() : []))
      .then(data => {
        const normalized = Array.isArray(data) ? data.map(item => {
          const detail = Array.isArray(item.stakeholders_detail) ? item.stakeholders_detail : []
          const mappedDetail = detail.map(entry => ({
            id: entry?.id ? String(entry.id) : null,
            name: entry?.name || '',
            acknowledged: Boolean(entry?.acknowledged),
            acknowledged_at: entry?.acknowledged_at || null
          }))
          const stakeholders = Array.isArray(item.stakeholders) && item.stakeholders.length
            ? item.stakeholders
            : mappedDetail.map(entry => entry.name).filter(Boolean)
          return {
            ...item,
            stakeholders,
            stakeholders_detail: mappedDetail,
            acknowledged_ids: Array.isArray(item.acknowledged_ids) ? item.acknowledged_ids : mappedDetail.filter(entry => entry.acknowledged && entry.id).map(entry => entry.id)
          }
        }) : []
        setItems(normalized)
        setLoading(false)
        setSelected(null)
      })
      .catch(() => {
        setItems([])
        setLoading(false)
        setSelected(null)
      })
  }, [])

  useEffect(() => {
    load()
    // Removed polling - loads once on mount
  }, [load])

  const header = useMemo(() => (
    <div className='grid grid-cols-[1fr_110px_140px_140px_1.2fr] items-center pb-1 pt-2 border-b border-[#393c32] mb-1 font-bold text-[#b0b79f] text-xs uppercase tracking-wider'>
      <span className='pl-2 underline'>Description</span>
      <span className='underline'>Priority</span>
      <span className='underline'>Category</span>
      <span className='underline'>Due Date</span>
      <span className='underline'>Tagged Stakeholders</span>
    </div>
  ), [])

  const handleAdd = async (payload) => {
    try {
      await fetch(resolveApiUrl('/api/hq/action-items'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      setOpenAdd(false)
      load()
    } catch {
      setOpenAdd(false)
    }
  }

  const handleSaveEdit = async (payload) => {
    if (!selected) return
    try {
      await fetch(resolveApiUrl(`/api/hq/action-items/${selected.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      setOpenEdit(false)
      load()
    } catch {
      setOpenEdit(false)
    }
  }

  const handleReminder = async ({ when, note }) => {
    if (!selected) return
    try {
      await fetch(resolveApiUrl(`/api/hq/action-items/${selected.id}/reminders`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ when, note })
      })
    } finally {
      setOpenRemind(false)
    }
  }

  const handleCloseOut = async () => {
    if (!selected) return
    try {
      await fetch(resolveApiUrl(`/api/hq/action-items/${selected.id}/close`), { method: 'PATCH' })
      load()
    } catch {}
  }

  const sidebarBase = 'rounded-full border-2 flex items-center justify-center bg-[#191d18] transition duration-150 transform w-[28px] h-[28px] '
  const editCls = sidebarBase + (selected ? 'hover:scale-110 hover:border-[#ffe066] border-[#393c32]' : 'opacity-40 cursor-not-allowed border-[#2a2d23]')
  const remindCls = sidebarBase + (selected ? 'hover:scale-110 hover:border-[#57b4ff] border-[#393c32]' : 'opacity-40 cursor-not-allowed border-[#2a2d23]')
  const closeCls = sidebarBase + (selected ? 'hover:scale-110 hover:border-[#8fffbb] border-[#393c32]' : 'opacity-40 cursor-not-allowed border-[#2a2d23]')
  const docsCls = sidebarBase + (selected ? 'hover:scale-110 hover:border-[#cfd3c3] border-[#393c32]' : 'opacity-40 cursor-not-allowed border-[#2a2d23]')
  const addCls = sidebarBase + 'hover:scale-110 hover:border-[#8fffbb] border-[#393c32]'

  return (
    <div
      className='relative border-2 border-[#6a7257] rounded-2xl shadow-2xl px-4 flex flex-row min-h-[60px]'
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--glass-tint)',
        backdropFilter: 'blur(var(--glass-blur))',
        WebkitBackdropFilter: 'blur(var(--glass-blur))',
        boxShadow: 'var(--glass-shadow)',
        borderColor: '#6a7257'
      }}
    >
      <AddModal open={openAdd} onClose={() => setOpenAdd(false)} onSubmit={handleAdd} />
      <EditModal open={openEdit} onClose={() => setOpenEdit(false)} onSubmit={handleSaveEdit} initial={selected} />
      <ReminderModal open={openRemind} onClose={() => setOpenRemind(false)} onSubmit={handleReminder} initial={selected} />
      <DocsModal open={openDocs} onClose={() => setOpenDocs(false)} item={selected} />

      <div className='flex-1 min-w-0'>
        {loading ? (
          <div className='text-center text-gray-400 py-6'>Loading...</div>
        ) : (
          <div className='w-full h-full'>
            {header}
            <div className='flex flex-col'>
              {items.length === 0 ? (
                <div className='text-center py-8 text-[#6a7257] text-sm italic font-bold tracking-wide opacity-70'>No action items yet.</div>
              ) : (
                items.map(item => (
                  <Row
                    key={item.id || item.description}
                    item={item}
                    selected={selected?.id === item.id}
                    onSelect={setSelected}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <div className='ml-3 pl-3 fhq-action-rail'>
        <button
          type='button'
          className={addCls}
          onClick={() => setOpenAdd(true)}
          aria-label='Add Item'
          title='Add Item'
        >
          <FiPlus color='#8fffbb' size={16} />
        </button>
        <button
          type='button'
          className={editCls}
          onClick={() => selected && setOpenEdit(true)}
          aria-label='Edit Action Item'
          title='Edit Action Item'
        >
          <FiEdit2 color='#ffe066' size={16} />
        </button>
        <button
          type='button'
          className={remindCls}
          onClick={() => selected && setOpenRemind(true)}
          aria-label='Reminders'
          title='Reminders'
        >
          <FiBell color='#57b4ff' size={16} />
        </button>
        <button
          type='button'
          className={closeCls}
          onClick={handleCloseOut}
          aria-label='Close Out'
          title='Close Out'
        >
          <FiCheckCircle color='#8fffbb' size={16} />
        </button>
        <button
          type='button'
          className={docsCls}
          onClick={() => selected && setOpenDocs(true)}
          aria-label='Supporting Documents'
          title='Supporting Documents'
        >
          <FiPaperclip color='#cfd3c3' size={16} />
        </button>
      </div>
    </div>
  )
}
