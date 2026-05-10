import { useState, useEffect, useRef } from 'react'
import { updateBalada, updateBaladaImage } from '../services/api'
import { Label, Input, SubmitButton, ErrorAlert } from '../components/ui'
import type { BaladaResponse, ApiError } from '../types'

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Editar Balada</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* ── Avatar ── */}
            <div className="flex items-center gap-5 mb-6">
              {/* Photo preview */}
              <div className="relative shrink-0">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={balada.tradeName}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-200 shadow"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow">
                    {balada.tradeName?.charAt(0)?.toUpperCase() || 'B'}
                  </div>
                )}
                {/* Upload trigger badge */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-md transition"
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
                <p className="text-sm font-semibold text-gray-800">{balada.tradeName}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5 break-all">{balada.id}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-violet-600 hover:text-violet-800 font-medium transition"
                >
                  {imageFile ? `✓ ${imageFile.name}` : 'Clique para trocar a foto da balada'}
                </button>
                {imageFile && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                  </p>
                )}
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-gray-100 mb-6" />

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
                value={form.cnpj || balada.cnpj || ''}
                onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
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
                value={form.telephoneNumber || balada.telephoneNumber || ''}
                onChange={(e) => setForm({ ...form, telephoneNumber: e.target.value })}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <Label>Celular</Label>
              <Input
                value={form.cellPhoneNumber || balada.cellPhoneNumber || ''}
                onChange={(e) => setForm({ ...form, cellPhoneNumber: e.target.value })}
                placeholder="(00) 90000-0000"
              />
            </div>

            <div className="col-span-2">
              <Label>Regulamento Interno</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
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
              <div className="flex items-center gap-2">
                <Label>Balada Verificada</Label>
                <input
                  type="checkbox"
                  checked={form.verified !== undefined ? form.verified : balada.verified}
                  onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                  className="w-4 h-4 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                />
              </div>
            </div>
          </div>

          {error && <ErrorAlert message={error} />}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <SubmitButton loading={saving}>Salvar Alterações</SubmitButton>
          </div>
        </form>
      </div>
    </div>
  )
}
