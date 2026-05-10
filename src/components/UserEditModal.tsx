import { useEffect, useRef, useState } from 'react'
import { updateUser, updateAvatar } from '../services/api'
import { ErrorAlert, Input, Label, Select, Spinner } from './ui'
import type { ApiError, UpdateUserRequest, UserResponse, UserStatus } from '../types'

interface Props {
  user: UserResponse
  onClose: () => void
  onSaved: (updated: UserResponse) => void
}

export default function UserEditModal({ user, onClose, onSaved }: Props) {
  // ── form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState<UpdateUserRequest>({
    displayName:    user.displayName,
    status:         user.status,
    email:          user.email          ?? '',
    cellPhoneNumber:user.cellPhoneNumber ?? '',
    telephoneNumber:user.telephoneNumber ?? '',
    cep:            user.cep            ?? '',
    description:    user.description    ?? '',
    link:           user.link           ?? '',
    image:          user.image          ?? '',
    birthDate:      user.birthDate      ?? '',
  })

  // ── avatar state ─────────────────────────────────────────────────────────────
  const [avatarFile,    setAvatarFile]    = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── save state ───────────────────────────────────────────────────────────────
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // ── avatar file picker ───────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  // ── submit ───────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // 1. Atualiza os dados textuais via PUT
      let updated = await updateUser(user.id, {
        ...form,
        email:           form.email           || undefined,
        cellPhoneNumber: form.cellPhoneNumber  || undefined,
        telephoneNumber: form.telephoneNumber  || undefined,
        cep:             form.cep              || undefined,
        description:     form.description      || undefined,
        link:            form.link             || undefined,
        image:           form.image            || undefined,
      })

      // 2. Se escolheu nova foto, faz o upload e atualiza o campo image
      if (avatarFile) {
        updated = await updateAvatar(user.id, avatarFile)
      }

      onSaved(updated)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  const f = (k: keyof UpdateUserRequest) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  // ── initials avatar ──────────────────────────────────────────────────────────
  const initials = user.displayName
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal */}
      <div className="bg-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-surfaceBorder">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surfaceBorder">
          <h2 className="text-base font-bold text-textPrimary">Editar Usuário</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surfaceHover text-textSecondary hover:text-textPrimary transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <form onSubmit={handleSave} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-6">

            {/* ── Avatar ── */}
            <div className="flex items-center gap-5">
              {/* Photo preview */}
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-primary shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-textInverse text-2xl font-bold shadow-lg">
                    {initials}
                  </div>
                )}
                {/* Upload trigger badge */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary hover:bg-primaryHover text-textInverse flex items-center justify-center shadow-md transition"
                  title="Trocar foto"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

              <div>
                <p className="text-sm font-semibold text-textPrimary">{user.displayName}</p>
                <p className="text-xs text-textTertiary font-mono mt-0.5 break-all">{user.id}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-primary hover:text-primaryHover font-medium transition"
                >
                  {avatarFile ? `✓ ${avatarFile.name}` : 'Clique para trocar a foto de perfil'}
                </button>
                {avatarFile && (
                  <p className="text-xs text-textTertiary mt-0.5">
                    {(avatarFile.size / 1024).toFixed(0)} KB · {avatarFile.type}
                  </p>
                )}
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-surfaceBorder" />

            {/* ── Dados principais ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Nome de exibição *</Label>
                <Input required value={form.displayName} onChange={f('displayName')} placeholder="Nome completo" />
              </div>

              <div>
                <Label>Status *</Label>
                <Select
                  value={form.status}
                  onChange={e => setForm(p => ({ ...p, status: e.target.value as UserStatus }))}
                >
                  <option value="ACTIVE">✅ Ativo</option>
                  <option value="SUSPENDED">🚫 Suspenso</option>
                  <option value="DELETED">🗑 Deletado</option>
                </Select>
              </div>

              <div>
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={f('email')} placeholder="email@exemplo.com" />
              </div>

              <div>
                <Label>Celular</Label>
                <Input value={form.cellPhoneNumber} onChange={f('cellPhoneNumber')} placeholder="(11) 99999-9999" />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input value={form.telephoneNumber} onChange={f('telephoneNumber')} placeholder="(11) 3000-0000" />
              </div>

              <div>
                <Label>CEP</Label>
                <Input value={form.cep} onChange={f('cep')} placeholder="00000-000" />
              </div>

              <div>
                <Label>Instagram</Label>
                <Input value={form.link} onChange={f('link')} placeholder="@username ou https://instagram.com/user" />
              </div>

              <div>
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={form.birthDate}
                  onChange={f('birthDate')}
                />
              </div>

              <div className="sm:col-span-2">
                <Label>Bio / Descrição</Label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={f('description')}
                  placeholder="Uma breve descrição sobre o usuário…"
                  className="w-full border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm bg-surface text-textPrimary placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-y"
                />
              </div>
            </div>

            {error && <ErrorAlert message={error} />}
          </div>

          {/* ── Footer ── */}
          <div className="sticky bottom-0 bg-surface border-t border-surfaceBorder px-6 py-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-surfaceBorder text-textSecondary hover:bg-surfaceHover py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
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
                  Salvando…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
