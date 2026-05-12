import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createEvent, updateEventImage } from '../services/api'
import { Label, Input, ErrorAlert, Spinner } from '../components/ui'
import type { CreateEventRequest, ApiError, EventType } from '../types'

interface Props {
  hostBaladaId: string
  hostBaladaName: string
  onClose: () => void
  onSuccess: () => void
}

function isValidDateTimeLocal(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)
}

function toIso(local: string) {
  return local.length === 16 ? `${local}:00` : local
}

export default function CreateEventModal({ hostBaladaId, hostBaladaName, onClose, onSuccess }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState<{
    type: EventType; title: string; cep: string; desc: string; startsAt: string; endsAt: string
  }>({ type: 'STANDARD', title: '', cep: '', desc: '', startsAt: '', endsAt: '' })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const s = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.startsAt || !form.endsAt) {
      setError(t('datesRequired'))
      return
    }
    if (!isValidDateTimeLocal(form.startsAt) || !isValidDateTimeLocal(form.endsAt)) {
      setError(t('invalidDateTimeFormat'))
      return
    }

    setSaving(true)
    try {
      const payload: CreateEventRequest = {
        hostBaladaId,
        type: form.type,
        title: form.title,
        startsAt: toIso(form.startsAt),
        endsAt: toIso(form.endsAt),
        ...(form.cep && { cep: form.cep }),
        ...(form.desc && { desc: form.desc }),
      }
      const created = await createEvent(payload)

      if (imageFile) {
        await updateEventImage(created.id, imageFile)
      }

      setSuccess(t('eventCreated', { title: created.title }))
      setTimeout(() => onSuccess(), 1500)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  const initials = form.title ? form.title.charAt(0).toUpperCase() : '🎉'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg bg-surface rounded-2xl shadow-2xl overflow-hidden border border-surfaceBorder"
        style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surfaceBorder bg-gradient-to-r from-surface to-surface/95">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-textPrimary">{t('createEvent')}</h2>
              <p className="text-xs text-textTertiary mt-0.5">
                {t('balada')}: <span className="text-primary font-medium">{hostBaladaName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[75vh]">
          <div className="px-6 py-6 space-y-5">

            {/* Image upload */}
            <div className="flex items-center gap-4 p-4 bg-surface/50 rounded-2xl border border-surfaceBorder/50">
              <div className="relative shrink-0 group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
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
                  title={t('addImage')}
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
                <p className="text-sm font-semibold text-textPrimary">{t('eventPhoto')}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-primary hover:text-primaryHover font-medium transition"
                >
                  {imageFile ? `✓ ${imageFile.name}` : t('clickToAddPhoto')}
                </button>
                {imageFile && (
                  <p className="text-xs text-textTertiary mt-0.5">
                    {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                  </p>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>{t('eventTitle')} *</Label>
                <Input required value={form.title} onChange={s('title')} placeholder={t('placeholderTitle')} />
              </div>

              <div className="col-span-2">
                <Label>{t('type')} *</Label>
                <select
                  value={form.type}
                  onChange={s('type')}
                  className="w-full px-4 py-2.5 bg-surface border border-surfaceBorder rounded-xl text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="STANDARD">{t('eventTypeStandard')}</option>
                  <option value="PREMIUM_BALLAD">{t('eventTypePremium')}</option>
                  <option value="NETWORK">{t('eventTypeNetwork')}</option>
                  <option value="OPEN">{t('eventTypeOpen')}</option>
                </select>
              </div>

              <div>
                <Label>{t('startTime')} *</Label>
                <Input
                  type="datetime-local"
                  required
                  step="60"
                  value={form.startsAt}
                  onChange={s('startsAt')}
                  className={form.startsAt && !isValidDateTimeLocal(form.startsAt) ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <Label>{t('endTime')} *</Label>
                <Input
                  type="datetime-local"
                  required
                  step="60"
                  value={form.endsAt}
                  onChange={s('endsAt')}
                  className={form.endsAt && !isValidDateTimeLocal(form.endsAt) ? 'border-red-500' : ''}
                />
              </div>

              <div>
                <Label>{t('cep')}</Label>
                <Input value={form.cep} onChange={s('cep')} placeholder="00000-000" maxLength={9} />
              </div>
            </div>

            <div>
              <Label>{t('description')}</Label>
              <textarea
                value={form.desc}
                onChange={s('desc')}
                placeholder={t('placeholderDesc')}
                rows={3}
                className="w-full px-4 py-2.5 bg-surface border border-surfaceBorder rounded-xl text-textPrimary text-sm placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
              />
            </div>

            {error && <ErrorAlert message={error} />}
            {success && (
              <div className="text-xs text-center bg-success/10 border border-success/20 text-success rounded-xl px-4 py-3">
                {success}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-surfaceBorder bg-surface/30 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-surfaceBorder text-textSecondary hover:bg-surfaceHover py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primaryHover disabled:bg-primaryLight text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Spinner size={4} />
                  <span>{t('creating')}</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{t('createEvent')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
