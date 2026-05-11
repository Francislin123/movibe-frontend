import { useEffect, useRef, useState } from 'react'
import { updateMoviber, updateMoviberImage, deleteMoviber } from '../services/api'
import { ErrorAlert, Input, Label, Select, Spinner, SubscriptionBadge } from './ui'
import type { ApiError, MoviberResponse, PromoterSubscription, UpdateMoviberRequest, UserResponse } from '../types'

interface Props {
  moviber: MoviberResponse
  linkedUser?: UserResponse
  onClose: () => void
  onSaved: (updated: MoviberResponse) => void
  onDeleted?: (id: string) => void
}

// ─── Mask helpers ─────────────────────────────────────────────────────────────

function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 11)
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
}

function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 11)
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 2) return `(${cleaned}`
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

function isUrlValue(value: string | null | undefined): boolean {
  if (!value) return false
  return /^(https?:\/\/|\/\/)/i.test(value) || /cloudinary\.com/i.test(value)
}

export default function MoviberEditModal({ moviber, linkedUser, onClose, onSaved, onDeleted }: Props) {
  // ── avatar state ─────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null)
  // Usa imagem do Moviber, ou do Usuário vinculado, ou null
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (moviber.image) return moviber.image
    if (isUrlValue(moviber.email)) return moviber.email
    return linkedUser?.image ?? null
  })
  const fileRef = useRef<HTMLInputElement>(null)

  // ── delete state ───────────────────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // ── form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<UpdateMoviberRequest>({
    followerCount: moviber.followerCount,
    subscription: moviber.subscription,
    name: moviber.name ?? '',
    email: (isUrlValue(moviber.email) ? '' : moviber.email) ?? linkedUser?.email ?? '',
    cpf: moviber.cpf ?? '',
    cellPhoneNumber: moviber.cellPhoneNumber ?? linkedUser?.cellPhoneNumber ?? '',
    responsibleName: moviber.responsibleName ?? linkedUser?.responsibleName ?? '',
    cep: moviber.cep ?? linkedUser?.cep ?? '',
    telephoneNumber: moviber.telephoneNumber ?? linkedUser?.telephoneNumber ?? '',
    image: moviber.image ?? linkedUser?.image ?? '',
  })

  // ── save state ───────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // ── image file picker ───────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    setError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ── input handlers ───────────────────────────────────────────────────────────
  const handleChange = (key: keyof UpdateMoviberRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(prev => ({ ...prev, [key]: e.target.value }))
    }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, cellPhoneNumber: formatPhone(e.target.value) }))
  }

  // ── submit ───────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // 1. Atualiza dados textuais via PUT
      const payload: UpdateMoviberRequest = {
        ...form,
        name: form.name || undefined,
        email: form.email || undefined,
        cpf: form.cpf?.replace(/\D/g, '') || undefined,
        cellPhoneNumber: form.cellPhoneNumber?.replace(/\D/g, '') || undefined,
        responsibleName: form.responsibleName || undefined,
        cep: form.cep || undefined,
        telephoneNumber: form.telephoneNumber || undefined,
        image: form.image || undefined,
      }

      let updated = await updateMoviber(moviber.id, payload)

      // 2. Se escolheu nova imagem, faz upload
      if (imageFile) {
        updated = await updateMoviberImage(moviber.id, imageFile)
      }

      setSuccess(true)
      setTimeout(() => onSaved(updated), 400)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  // ── delete handler ────────────────────────────────────────────────────────────
  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteMoviber(moviber.id)
      setShowDeleteConfirm(false)
      onDeleted?.(moviber.id)
      onClose()
    } catch (e) {
      setError((e as ApiError).message)
      setDeleting(false)
    }
  }

  // ── initials avatar ──────────────────────────────────────────────────────────
  const displayName = form.name || linkedUser?.displayName || 'Moviber'
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  // ── subscription options ─────────────────────────────────────────────────────
  const subscriptionLabels: Record<PromoterSubscription, { label: string; description: string }> = {
    NONE: {
      label: 'Free',
      description: 'Sem acesso a eventos premium'
    },
    VIP_BALLADS_FOR_PROMOTERS: {
      label: 'VIP Baladas',
      description: 'Eventos premium liberados'
    },
  }

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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-textPrimary">Editar Moviber</h2>
              <p className="text-xs text-textTertiary">Atualize as informações do promoter</p>
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
                    alt={displayName}
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-primary shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {initials || 'M'}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary hover:bg-primaryHover text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                  title="Trocar foto"
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
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-textPrimary truncate">{displayName || 'Sem nome'}</h3>
                  <SubscriptionBadge sub={form.subscription} />
                </div>
                {linkedUser && (
                  <p className="text-xs text-textSecondary mt-1">
                    Vinculado a: <span className="text-primary">{linkedUser.displayName}</span>
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-primary hover:text-primaryHover font-medium transition-colors flex items-center gap-1"
                >
                  {imageFile ? (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {imageFile.name}
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {imagePreview ? 'Trocar imagem' : 'Adicionar imagem'}
                    </>
                  )}
                </button>
                {imageFile && (
                  <p className="text-xs text-textTertiary mt-1">
                    {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                  </p>
                )}
              </div>
            </div>

            {/* ── FORM FIELDS ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="sm:col-span-2">
                <Label>Nome do Moviber</Label>
                <Input
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Nome de exibição do promoter"
                  maxLength={100}
                />
              </div>

              {/* Email */}
              <div className="sm:col-span-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* CPF */}
              <div>
                <Label>CPF</Label>
                <Input
                  value={form.cpf}
                  onChange={handleCPFChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              {/* Celular */}
              <div>
                <Label>Celular</Label>
                <Input
                  value={form.cellPhoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>

              {/* Subscription */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <Label>Assinatura</Label>
                  <SubscriptionBadge sub={form.subscription} />
                </div>
                <Select
                  value={form.subscription}
                  onChange={e => setForm(prev => ({ ...prev, subscription: e.target.value as PromoterSubscription }))}
                >
                  <option value="NONE" className="bg-surface text-textPrimary">
                    {subscriptionLabels.NONE.label} — {subscriptionLabels.NONE.description}
                  </option>
                  <option value="VIP_BALLADS_FOR_PROMOTERS" className="bg-surface text-textPrimary">
                    ★ {subscriptionLabels.VIP_BALLADS_FOR_PROMOTERS.label} — {subscriptionLabels.VIP_BALLADS_FOR_PROMOTERS.description}
                  </option>
                </Select>
                <p className="text-xs text-textTertiary mt-1.5">
                  {form.subscription === 'VIP_BALLADS_FOR_PROMOTERS'
                    ? 'Permite criar eventos do tipo PREMIUM_BALLAD e acessar funcionalidades exclusivas.'
                    : 'Apenas eventos do tipo STANDARD podem ser criados.'}
                </p>
              </div>
            </div>

            {/* ── FEEDBACK ── */}
            {error && <ErrorAlert message={error} />}
            {success && (
              <div className="flex items-center gap-2 bg-success/10 border border-success text-success text-sm rounded-xl px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Alterações salvas com sucesso!
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="sticky bottom-0 bg-surface border-t border-surfaceBorder px-6 py-4 flex gap-3 bg-gradient-to-t from-surface to-surface/95">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="flex-none px-4 bg-surfaceHover border border-surfaceBorder text-textPrimary hover:bg-error hover:border-error hover:text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Excluir Movibe"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Excluir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-surfaceBorder text-textSecondary hover:bg-surfaceHover hover:text-textPrimary py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary hover:bg-primaryHover disabled:bg-primaryLight text-textInverse py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Spinner size={4} />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Salvar alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm mx-4 bg-surface border border-surfaceBorder rounded-2xl shadow-2xl shadow-black/40 animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-textPrimary text-center mb-2">
                Excluir Movibe?
              </h3>
              <p className="text-sm text-textSecondary text-center">
                Esta ação não pode ser desfeita. O Movibe <strong className="text-textPrimary">{moviber.name || linkedUser?.displayName || 'selecionado'}</strong> será removido permanentemente.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-surfaceBorder flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 border border-surfaceBorder text-textSecondary hover:bg-surfaceHover hover:text-textPrimary py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-error hover:bg-error/90 disabled:bg-error/50 text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Spinner size={4} />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
