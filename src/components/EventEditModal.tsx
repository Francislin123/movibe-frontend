import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { updateEvent, updateEventImage } from '../services/api'
import type { EventResponse, ApiError, EventType } from '../types'

interface EventEditModalProps {
  event: EventResponse | null
  onClose: () => void
  onSuccess: () => void
}

// Helper para formatar data/hora para datetime-local sem conversão UTC
function formatDateTimeLocal(dateString: string): string {
  if (!dateString) return ''

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateString)) {
    return dateString
  }

  if (dateString.includes('Z') || dateString.includes('+')) {
    return dateString.split('T')[0] + 'T00:00'
  }

  return dateString
}

export default function EventEditModal({ event, onClose, onSuccess }: EventEditModalProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<Partial<EventResponse>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ── image state ─────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(event?.image || null)
  const fileRef = useRef<HTMLInputElement>(null)

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Sincronizar form quando o evento mudar
  useEffect(() => {
    if (event) {
      setForm(event)
      setError(null)
      setSuccess(false)
      setImagePreview(event.image)
      setImageFile(null)
    }
  }, [event])

  // ── image file picker ───────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Invalid image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(t('maxSize'))
      return
    }

    setError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ── submit ───────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!event) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // 1. Atualiza os dados textuais via PUT
      await updateEvent(event.id, {
        type: form.type || event.type,
        title: form.title || event.title,
        category: form.category || event.category,
        desc: form.desc || event.desc,
        image: form.image || event.image,
        startsAt: form.startsAt || event.startsAt,
        endsAt: form.endsAt || event.endsAt
      })

      // 2. Se escolheu nova imagem, faz o upload
      if (imageFile) {
        await updateEventImage(event.id, imageFile)
      }

      setSuccess(true)
      setTimeout(() => onSuccess(), 400)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  if (!event) return null

  const displayTitle = form.title || event.title || 'Evento'
  const initials = displayTitle.charAt(0).toUpperCase()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0B0B0F 0%, #15151D 100%)',
          border: '1px solid rgba(123, 47, 255, 0.2)',
          boxShadow: '0 0 60px rgba(123, 47, 255, 0.3), inset 0 0 60px rgba(123, 47, 255, 0.05)'
        }}
      >
        {/* ── HEADER ── */}
        <div className="relative px-8 py-6 border-b border-[#7B2FFF]/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7B2FFF]/10 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B2FFF] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#7B2FFF]/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t('editEntity', { entity: t('nav.events') })}</h2>
                <p className="text-sm text-[#B3B3C3] mt-0.5">{t('updateInfo')}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="w-10 h-10 rounded-xl bg-[#15151D] hover:bg-[#1F1F2D] text-[#B3B3C3] hover:text-white transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── BODY ── */}
        <form onSubmit={handleSave} id="edit-event-form" className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="px-8 py-6 space-y-6">

            {/* ── AVATAR SECTION ── */}
            <div className="flex items-center gap-4 p-4 bg-[#15151D]/50 rounded-2xl border border-[#7B2FFF]/20">
              <div className="relative shrink-0 group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={displayTitle}
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-[#7B2FFF] shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7B2FFF] to-[#A855F7] flex items-center justify-center text-white text-3xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#7B2FFF] hover:bg-[#A855F7] text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                  title={t('changeImage')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{displayTitle}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-[#7B2FFF] hover:text-[#A855F7] font-medium transition"
                >
                  {imageFile ? `✓ ${imageFile.name}` : t('clickToChangePhoto')}
                </button>
                {imageFile && (
                  <p className="text-xs text-[#B3B3C3] mt-0.5">
                    {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                  </p>
                )}
              </div>
            </div>

            {/* ── FORM FIELDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('type')} *</label>
                <select
                  required
                  value={form.type || event.type || 'STANDARD'}
                  onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                  className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]"
                >
                  <option value="STANDARD">{t('eventTypeStandard')}</option>
                  <option value="PREMIUM_BALLAD">{t('eventTypePremium')}</option>
                  <option value="NETWORK">{t('eventTypeNetwork')}</option>
                  <option value="OPEN">{t('eventTypeOpen')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Categoria</label>
                <select
                  value={form.category || event.category || 'Geral'}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]"
                >
                  <option value="Geral">Geral</option>
                  <option value="Sertanejo">Sertanejo</option>
                  <option value="Eletrônico">Eletrônico</option>
                  <option value="Funk">Funk</option>
                  <option value="Rock">Rock</option>
                  <option value="Pagode">Pagode</option>
                  <option value="HIP_HOP">Hip Hop</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('eventTitle')} *</label>
                <input
                  type="text"
                  required
                  value={form.title || event.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={t('placeholderTitle')}
                  className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('description')}</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white placeholder-[#B3B3C3]/50 focus:outline-none focus:border-[#7B2FFF] resize-none"
                  rows={3}
                  value={form.desc || event.desc || ''}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder={t('placeholderDesc')}
                  maxLength={4000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('startDate')} *</label>
                <input
                  type="datetime-local"
                  required
                  step="60"
                  value={form.startsAt ? formatDateTimeLocal(form.startsAt) : formatDateTimeLocal(event.startsAt)}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('endDate')} *</label>
                <input
                  type="datetime-local"
                  required
                  step="60"
                  value={form.endsAt ? formatDateTimeLocal(form.endsAt) : formatDateTimeLocal(event.endsAt)}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]"
                />
              </div>
            </div>

            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                {t('eventUpdated')}
              </div>
            )}

            </div>
        </form>

        {/* ── FOOTER ── */}
        <div className="px-8 py-6 border-t border-[#7B2FFF]/20 bg-[#0B0B0F]/50 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl border border-[#7B2FFF]/30 text-[#B3B3C3] hover:text-white transition-all font-medium disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="edit-event-form"
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7B2FFF] to-[#A855F7] text-white font-semibold shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
          >
            {saving ? 'Salvando...' : t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  )
}