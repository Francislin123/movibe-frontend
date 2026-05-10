import { useEffect, useRef, useState } from 'react'
import { updateMoviberImage } from '../services/api'
import { ErrorAlert, Label, Select, Spinner } from './ui'
import type { ApiError, MoviberResponse, PromoterSubscription } from '../types'

interface Props {
  moviber: MoviberResponse
  onClose: () => void
  onSaved: (updated: MoviberResponse) => void
}

export default function MoviberEditModal({ moviber, onClose, onSaved }: Props) {
  // ── avatar state ─────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(moviber.image)
  const fileRef = useRef<HTMLInputElement>(null)

  // ── form state ──────────────────────────────────────────────────────────────
  const [subscription, setSubscription] = useState<PromoterSubscription>(moviber.subscription)

  // ── save state ───────────────────────────────────────────────────────────────
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    // Validação básica
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido')
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    setError(null)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ── submit ───────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Se escolheu nova imagem, faz o upload
      let updated = moviber
      if (imageFile) {
        updated = await updateMoviberImage(moviber.id, imageFile)
      }

      onSaved(updated)
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  // ── initials avatar ──────────────────────────────────────────────────────────
  const initials = (moviber.name ?? 'M')
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
          <h2 className="text-base font-bold text-textPrimary">Editar Moviber</h2>
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
            <div className="flex items-center gap-3">
              {/* Photo preview */}
              <div className="relative shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={moviber.name ?? 'Moviber'}
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
                  title="Trocar logo"
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

              <div className="flex flex-col items-start">
                <p className="text-sm font-semibold text-textPrimary">{moviber.name ?? 'Moviber sem nome'}</p>
                <p className="text-xs text-textTertiary font-mono mt-0.5 break-all">{moviber.id}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-1.5 text-xs text-primary hover:text-primaryHover font-medium transition"
                >
                  {imageFile ? `✓ ${imageFile.name}` : 'Clique para trocar a logo'}
                </button>
                {imageFile && (
                  <p className="text-xs text-textTertiary mt-0.5">
                    {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                  </p>
                )}
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-surfaceBorder" />

            {/* ── Dados principais ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label>Assinatura *</Label>
                <Select
                  value={subscription}
                  onChange={e => setSubscription(e.target.value as PromoterSubscription)}
                >
                  <option value="NONE">Free — sem acesso a eventos premium</option>
                  <option value="VIP_BALLADS_FOR_PROMOTERS">★ VIP Baladas — eventos premium liberados</option>
                </Select>
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
