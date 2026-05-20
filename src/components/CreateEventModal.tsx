import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createEvent, updateEventImage } from '../services/api'
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

  // CORREÇÃO: Adicionado 'category' ao estado inicial para bater com CreateEventRequest
  const [form, setForm] = useState<{
    type: EventType;
    title: string;
    category: string; // Adicionado
    desc: string;
    startsAt: string;
    endsAt: string
  }>({
    type: 'STANDARD',
    title: '',
    category: 'Geral', // Valor padrão inicial
    desc: '',
    startsAt: '',
    endsAt: ''
  })

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
      // CORREÇÃO: category incluída no payload (agora obrigatória no tipo)
      const payload: CreateEventRequest = {
        hostBaladaId,
        type: form.type,
        title: form.title,
        category: form.category, // Adicionado
        startsAt: toIso(form.startsAt),
        endsAt: toIso(form.endsAt),
        ...(form.desc && { desc: form.desc }),
      }
      const created = await createEvent(payload)

      if (imageFile) {
        await updateEventImage(created.id, imageFile)
      }

      setSuccess(t('eventCreated', { title: created.title }))
      
      // Dispatch custom event for surgical event count update
      window.dispatchEvent(new CustomEvent('event-created', { 
        detail: { baladaId: hostBaladaId, eventId: created.id } 
      }))
      
      onSuccess()
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  const initials = form.title ? form.title.charAt(0).toUpperCase() : '🎉'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #0B0B0F 0%, #15151D 100%)',
          border: '1px solid rgba(123, 47, 255, 0.2)',
          boxShadow: '0 0 60px rgba(123, 47, 255, 0.3), inset 0 0 60px rgba(123, 47, 255, 0.05)'
        }}
      >
        {/* Header */}
        <div className="relative px-8 py-6 border-b border-[#7B2FFF]/20">
          <div className="absolute inset-0 bg-gradient-to-r from-[#7B2FFF]/10 to-transparent" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7B2FFF] to-[#A855F7] flex items-center justify-center shadow-lg shadow-[#7B2FFF]/50">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{t('createEvent')}</h2>
                <p className="text-sm text-[#B3B3C3] mt-0.5">
                  {t('balada')}: <span className="text-[#7B2FFF] font-medium">{hostBaladaName}</span>
                </p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} id="create-event-form" className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="px-8 py-6 space-y-6">

            {/* Image upload preview */}
            <div className="flex items-center gap-4 p-4 bg-[#15151D]/50 rounded-2xl border border-[#7B2FFF]/20">
              <div className="relative shrink-0 group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
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
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{t('eventPhoto')}</p>
                <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 text-xs text-[#7B2FFF] font-medium">
                  {imageFile ? `✓ ${imageFile.name}` : t('clickToAddPhoto')}
                </button>
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('eventTitle')} *</label>
                <input type="text" required value={form.title} onChange={s('title')} placeholder={t('placeholderTitle')} className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Categoria *</label>
                <select
                  value={form.category}
                  onChange={s('category')}
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
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('type')} *</label>
                <select
                  value={form.type}
                  onChange={s('type')}
                  className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]"
                >
                  <option value="STANDARD">{t('eventTypeStandard')}</option>
                  <option value="PREMIUM_BALLAD">{t('eventTypePremium')}</option>
                  <option value="NETWORK">{t('eventTypeNetwork')}</option>
                  <option value="OPEN">{t('eventTypeOpen')}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('startTime')} *</label>
                <input
                  type="datetime-local"
                  required
                  step="60"
                  value={form.startsAt}
                  onChange={s('startsAt')}
                  className={form.startsAt && !isValidDateTimeLocal(form.startsAt) ? 'w-full px-4 py-3 rounded-xl bg-[#15151D] border border-red-500 text-white focus:outline-none' : 'w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]'}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('endTime')} *</label>
                <input
                  type="datetime-local"
                  required
                  step="60"
                  value={form.endsAt}
                  onChange={s('endsAt')}
                  className={form.endsAt && !isValidDateTimeLocal(form.endsAt) ? 'w-full px-4 py-3 rounded-xl bg-[#15151D] border border-red-500 text-white focus:outline-none' : 'w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#B3B3C3] mb-2">{t('description')}</label>
              <textarea
                value={form.desc}
                onChange={s('desc')}
                placeholder={t('placeholderDesc')}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white placeholder-[#B3B3C3]/50 focus:outline-none focus:border-[#7B2FFF] resize-none"
              />
            </div>

            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
            {success && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
                {success}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
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
            form="create-event-form"
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7B2FFF] to-[#A855F7] text-white font-semibold shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? 'Criando...' : t('createEvent')}
          </button>
        </div>
      </div>
    </div>
  )
}