import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { updateEvent, updateEventImage } from '../services/api'
import { Label, Input, SubmitButton, ErrorAlert } from '../components/ui'
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
        cep: form.cep || event.cep,
        numb: form.numb || event.numb,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-surfaceBorder animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(124, 58, 237, 0.1)'
        }}
      >
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surfaceBorder bg-gradient-to-r from-surface to-surface/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-textPrimary">{t('editEntity', { entity: t('nav.events') })}</h2>
              <p className="text-xs text-textTertiary">{t('updateInfo')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 rounded-xl hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-all duration-200 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── BODY ── */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1">
          <div className="px-6 py-6 space-y-6">

            {/* ── AVATAR SECTION ── */}
            <div className="flex items-center gap-4 p-4 bg-surface/50 rounded-2xl border border-surfaceBorder/50">
              <div className="relative shrink-0 group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={displayTitle}
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-primary shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary hover:bg-primaryHover text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
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
                <p className="text-sm font-semibold text-textPrimary truncate">{displayTitle}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-primary hover:text-primaryHover font-medium transition"
                >
                  {imageFile ? `✓ ${imageFile.name}` : t('clickToChangePhoto')}
                </button>
                {imageFile && (
                  <p className="text-xs text-textTertiary mt-0.5">
                    {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                  </p>
                )}
              </div>
            </div>

            {/* ── FORM FIELDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>{t('type')} *</Label>
                <select
                  required
                  value={form.type || event.type || 'STANDARD'}
                  onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                  className="w-full mt-1 px-4 py-2.5 bg-surface border border-surfaceBorder rounded-xl text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="STANDARD">{t('eventTypeStandard')}</option>
                  <option value="PREMIUM_BALLAD">{t('eventTypePremium')}</option>
                  <option value="NETWORK">{t('eventTypeNetwork')}</option>
                  <option value="OPEN">{t('eventTypeOpen')}</option>
                </select>
              </div>

              <div>
                <Label>{t('eventTitle')} *</Label>
                <Input
                  required
                  value={form.title || event.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={t('placeholderTitle')}
                />
              </div>

              <div>
                <Label>{t('cep')}</Label>
                <Input
                  value={form.cep || event.cep || ''}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>

              <div>
                <Label>{t('number')}</Label>
                <Input
                  value={form.numb || event.numb || ''}
                  onChange={(e) => setForm({ ...form, numb: e.target.value })}
                  placeholder="123"
                />
              </div>

              <div className="md:col-span-2">
                <Label>{t('description')}</Label>
                <textarea
                  className="w-full mt-1 px-4 py-2.5 bg-surface border border-surfaceBorder rounded-xl text-textPrimary text-sm placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                  rows={3}
                  value={form.desc || event.desc || ''}
                  onChange={(e) => setForm({ ...form, desc: e.target.value })}
                  placeholder={t('placeholderDesc')}
                  maxLength={4000}
                />
              </div>

              <div>
                <Label>{t('startDate')} *</Label>
                <Input
                  type="datetime-local"
                  required
                  step="60"
                  value={form.startsAt ? formatDateTimeLocal(form.startsAt) : formatDateTimeLocal(event.startsAt)}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                />
              </div>

              <div>
                <Label>{t('endDate')} *</Label>
                <Input
                  type="datetime-local"
                  required
                  step="60"
                  value={form.endsAt ? formatDateTimeLocal(form.endsAt) : formatDateTimeLocal(event.endsAt)}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                />
              </div>
            </div>

            {error && <ErrorAlert message={error} />}
            {success && (
              <div className="text-xs text-center bg-success/10 border border-success/20 text-success rounded-xl px-4 py-3">
                {t('eventUpdated')}
              </div>
            )}

            </div>

          {/* ── FOOTER ── */}
          <div className="px-6 py-4 border-t border-surfaceBorder bg-surface/30 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-textSecondary hover:text-textPrimary hover:bg-surfaceHover rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <SubmitButton loading={saving}>{t('saveChanges')}</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
