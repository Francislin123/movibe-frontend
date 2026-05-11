import { useState, useEffect, useRef } from 'react'
import { updateBalada, updateBaladaImage } from '../services/api'
import { Label, Input, ErrorAlert, Spinner } from '../components/ui'
import type { BaladaResponse, ApiError } from '../types'

// ─── Mask helpers ─────────────────────────────────────────────────────────────

function formatCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 14)
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
}

function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 10)
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 2) return `(${cleaned}`
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6, 10)}`
}

function formatCellPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 11)
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 2) return `(${cleaned}`
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

interface BaladaEditModalProps {
  balada: BaladaResponse | null
  onClose: () => void
  onSuccess: () => void
}

export default function BaladaEditModal({ balada, onClose, onSuccess }: BaladaEditModalProps) {
  const [form, setForm] = useState<Partial<BaladaResponse>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── avatar state ─────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(balada?.image || null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Sincronizar form quando a balada mudar
  useEffect(() => {
    if (balada) {
      setForm(balada)
      setError(null)
      setImagePreview(balada.image)
    }
  }, [balada])

  // ── image file picker ───────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  // ── submit ───────────────────────────────────────────────────────────────────
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!balada) return

    setSaving(true)
    setError(null)

    try {
      // 1. Atualiza os dados textuais via PUT
      await updateBalada(balada.id, {
        tradeName: form.tradeName || balada.tradeName,
        cnpj: form.cnpj || balada.cnpj,
        reasonSocial: form.reasonSocial || balada.reasonSocial,
        email: form.email || balada.email,
        responsibleName: form.responsibleName || balada.responsibleName,
        cep: form.cep || balada.cep,
        numb: form.numb || balada.numb,
        local: form.local || balada.local,
        description: form.description || balada.description,
        cellPhoneNumber: form.cellPhoneNumber || balada.cellPhoneNumber,
        telephoneNumber: form.telephoneNumber || balada.telephoneNumber,
        rules: form.rules || balada.rules,
        link: form.link || balada.link,
        image: form.image || balada.image,
        verified: form.verified !== undefined ? form.verified : balada.verified
      })

      // 2. Se escolheu nova imagem, faz o upload e atualiza o campo image
      if (imageFile) {
        await updateBaladaImage(balada.id, imageFile)
      }

      onSuccess()
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  if (!balada) return null

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-textPrimary">Editar Balada</h2>
              <p className="text-xs text-textTertiary">Atualize as informações do estabelecimento</p>
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
                    alt={balada.tradeName}
                    className="w-24 h-24 rounded-2xl object-cover ring-2 ring-primary shadow-lg transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-105">
                    {balada.tradeName?.charAt(0)?.toUpperCase() || 'B'}
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
                <h3 className="text-base font-semibold text-textPrimary truncate">{balada.tradeName}</h3>
                <p className="text-xs text-textTertiary font-mono mt-1 break-all">{balada.id}</p>
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
            <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Nome Fantasia *</Label>
              <Input
                required
                value={form.tradeName || balada.tradeName || ''}
                onChange={(e) => setForm({ ...form, tradeName: e.target.value })}
                placeholder="Ex: Balada Show"
              />
            </div>

            <div>
              <Label>CNPJ</Label>
              <Input
                value={form.cnpj ? formatCNPJ(form.cnpj) : balada.cnpj ? formatCNPJ(balada.cnpj) : ''}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value.replace(/\D/g, '') })}
                placeholder="00.000.000/0001-00"
                maxLength={18}
              />
            </div>

            <div>
              <Label>Razão Social</Label>
              <Input
                value={form.reasonSocial || balada.reasonSocial || ''}
                onChange={(e) => setForm({ ...form, reasonSocial: e.target.value })}
                placeholder="Nome da empresa no contrato social"
              />
            </div>

            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email || balada.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contato@balada.com"
              />
            </div>

            <div>
              <Label>Nome do Responsável</Label>
              <Input
                value={form.responsibleName || balada.responsibleName || ''}
                onChange={(e) => setForm({ ...form, responsibleName: e.target.value })}
                placeholder="Nome completo do responsável"
              />
            </div>

            <div>
              <Label>CEP</Label>
              <Input
                value={form.cep || balada.cep || ''}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div>
              <Label>Número</Label>
              <Input
                value={form.numb || balada.numb || ''}
                onChange={(e) => setForm({ ...form, numb: e.target.value })}
                placeholder="123"
              />
            </div>

            <div>
              <Label>Localização</Label>
              <Input
                value={form.local || balada.local || ''}
                onChange={(e) => setForm({ ...form, local: e.target.value })}
                placeholder="Rua das Flores, 123 - Centro"
              />
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <textarea
                className="w-full px-4 py-2.5 border border-surfaceBorder rounded-xl text-sm bg-surface text-textPrimary placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-y"
                rows={3}
                value={form.description || balada.description || ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição detalhada da balada..."
                maxLength={4000}
              />
            </div>

            <div>
              <Label>Telefone</Label>
              <Input
                value={form.telephoneNumber ? formatPhone(form.telephoneNumber) : balada.telephoneNumber ? formatPhone(balada.telephoneNumber) : ''}
                onChange={(e) => setForm({ ...form, telephoneNumber: e.target.value.replace(/\D/g, '') })}
                placeholder="(00) 0000-0000"
                maxLength={14}
              />
            </div>

            <div>
              <Label>Celular</Label>
              <Input
                value={form.cellPhoneNumber ? formatCellPhone(form.cellPhoneNumber) : balada.cellPhoneNumber ? formatCellPhone(balada.cellPhoneNumber) : ''}
                onChange={(e) => setForm({ ...form, cellPhoneNumber: e.target.value.replace(/\D/g, '') })}
                placeholder="(00) 90000-0000"
                maxLength={15}
              />
            </div>

            <div className="col-span-2">
              <Label>Regulamento Interno</Label>
              <textarea
                className="w-full px-4 py-2.5 border border-surfaceBorder rounded-xl text-sm bg-surface text-textPrimary placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-y"
                rows={3}
                value={form.rules || balada.rules || ''}
                onChange={(e) => setForm({ ...form, rules: e.target.value })}
                placeholder="Regras internas da balada..."
                maxLength={4000}
              />
            </div>

            <div className="col-span-2">
              <Label>Link</Label>
              <Input
                value={form.link || balada.link || ''}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder="https://instagram.com/balada"
              />
            </div>

            <div className="col-span-2">
              <div className="flex items-center gap-3 p-3 bg-surface/50 rounded-xl border border-surfaceBorder/50">
                <span className="text-sm text-textPrimary">Balada Verificada</span>
                <input
                  type="checkbox"
                  checked={form.verified !== undefined ? form.verified : balada.verified}
                  onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                  className="w-5 h-5 accent-primary cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* ── FEEDBACK ── */}
          {error && <ErrorAlert message={error} />}
          </div>

          {/* ── FOOTER ── */}
          <div className="sticky bottom-0 bg-surface border-t border-surfaceBorder px-6 py-4 flex gap-3 bg-gradient-to-t from-surface to-surface/95">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 border border-surfaceBorder text-textSecondary hover:bg-surfaceHover hover:text-textPrimary py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50"
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
    </div>
  )
}
