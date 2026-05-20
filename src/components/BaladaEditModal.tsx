import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateBalada, updateBaladaImage } from '../services/api'
import type { BaladaResponse, ApiError } from '../types'

// ─── Mask Helpers ─────────────────────────────────────────────────────────────

function formatCEP(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 8)
  if (cleaned.length <= 5) return cleaned
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`
}

function formatCNPJ(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 14)
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/I${cleaned.slice(8)}`
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
}

function formatPhone(value: string): string {
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    tradeName: '',
    cnpj: '',
    reasonSocial: '',
    email: '',
    responsibleName: '',
    cep: '',
    numb: '',
    description: '',
    cellPhoneNumber: '',
    telephoneNumber: '',
    rules: '',
    link: '',
    complemento: '',
    verified: false
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isImageDeleted, setIsImageDeleted] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // ─── Populate Form from Balada Data ──────────────────────────────────────────

  useEffect(() => {
    if (balada) {
      setForm({
        tradeName: balada.tradeName || '',
        cnpj: balada.cnpj || '',
        reasonSocial: balada.reasonSocial || '',
        email: balada.email || '',
        responsibleName: balada.responsibleName || '',
        cep: balada.addressResponse?.cep || '',
        numb: balada.addressResponse?.numero || '',
        description: balada.description || '',
        cellPhoneNumber: balada.cellPhoneNumber || '',
        telephoneNumber: balada.telephoneNumber || '',
        rules: balada.rules || '',
        link: balada.link || '',
        complemento: balada.addressResponse?.complemento || '',
        verified: balada.verified
      })
      setImagePreview(balada.image || null)
      setIsImageDeleted(false)
      setImageFile(null)
      setError(null)
    }
  }, [balada])

  // ─── Image Handlers ───────────────────────────────────────────────────────────

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }
    setError(null)
    setIsImageDeleted(false)
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setIsImageDeleted(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ─── Form Handlers ────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!balada) return

    setSaving(true)
    setError(null)

    try {
      if (!form.tradeName.trim()) throw new Error('Nome fantasia é obrigatório')

      // 1. Limpeza de todas as máscaras visuais (Apenas números)
      const cleanCnpj = form.cnpj ? form.cnpj.replace(/\D/g, '') : null
      const cleanCell = form.cellPhoneNumber ? form.cellPhoneNumber.replace(/\D/g, '') : null
      const cleanTel = form.telephoneNumber ? form.telephoneNumber.replace(/\D/g, '') : null
      const cleanCep = form.cep ? form.cep.replace(/\D/g, '') : ''

      // Determina o valor do campo imagem no payload de texto
      // Se foi excluída, envia null. Se não mudou, mantém a URL antiga da balada.
      const currentImageProp = isImageDeleted ? null : (imageFile ? imagePreview : balada.image)

      // 2. Montagem estruturada do objeto de payload
      const updatePayload = {
        tradeName: form.tradeName.trim(),
        cnpj: cleanCnpj || null,
        reasonSocial: form.reasonSocial ? form.reasonSocial.trim() : null,
        email: form.email ? form.email.trim() : null,
        responsibleName: form.responsibleName ? form.responsibleName.trim() : null,

        cep: cleanCep,
        numb: form.numb ? form.numb.trim() : '',
        complemento: form.complemento ? form.complemento.trim() : "",

        description: form.description ? form.description.trim() : null,
        cellPhoneNumber: cleanCell || null,
        telephoneNumber: cleanTel || null,
        rules: form.rules ? form.rules.trim() : null,
        link: form.link ? form.link.trim() : null,
        image: currentImageProp,
        verified: form.verified,

        address: {
          cep: cleanCep,
          numero: form.numb ? form.numb.trim() : '',
          complemento: form.complemento ? form.complemento.trim() : ""
        }
      }

      console.log('Enviando payload estruturado para a API:', updatePayload)

      // 1. Atualiza os dados de texto via PUT
      await updateBalada(balada.id, updatePayload)

      // 2. Upload condicional da nova imagem de forma isolada
      if (imageFile && !isImageDeleted) {
        try {
          await updateBaladaImage(balada.id, imageFile)
        } catch (imgError) {
          const apiError = imgError as ApiError
          const errorMessage = apiError.message || ''
          if (!errorMessage.includes('LazyInitializationException')) {
            throw imgError
          }
        }
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (e: any) {
      console.error('Erro detectado ao submeter atualização da balada:', e)
      const apiMessage = e.response?.data?.message || e.message || 'Erro ao atualizar balada'
      setError(apiMessage)
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  if (!balada) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl"
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Editar Estabelecimento</h2>
                <p className="text-sm text-[#B3B3C3] mt-0.5">Atualize as informações do estabelecimento</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="w-10 h-10 rounded-xl bg-[#15151D] hover:bg-[#1F1F2D] text-[#B3B3C3] hover:text-white transition-all duration-200 flex items-center justify-center disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)] px-8 py-6">
          <div className="space-y-8">
            {/* Imagem (Mapeada com visualização circular compacta igual à do Usuário) */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">Imagem do Estabelecimento</label>
              <AnimatePresence mode="wait">
                {imagePreview ? (
                  <motion.div key="preview" className="relative group w-fit flex items-center">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#7B2FFF]/40 shadow-inner bg-[#15151D]">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-all shadow-md"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </motion.div>
                ) : (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full h-32 rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center border-[#7B2FFF]/30 hover:border-[#7B2FFF] transition-all ${isDragging ? 'bg-[#7B2FFF]/10' : ''}`}
                  >
                    <svg className="w-8 h-8 text-[#B3B3C3] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white text-sm font-semibold">Arraste uma imagem ou clique para selecionar</p>
                    <p className="text-[#B3B3C3] text-xs mt-0.5">Até 5MB</p>
                  </div>
                )}
              </AnimatePresence>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
            </div>

            {/* Seção 1: Dados do Estabelecimento */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#7B2FFF]/20 flex items-center justify-center"><span className="text-[#7B2FFF]">1</span></div>
                Dados Jurídicos e Contato
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Nome Fantasia *</label>
                  <input type="text" required value={form.tradeName} onChange={(e) => updateField('tradeName', e.target.value)} placeholder="Ex: Club Premium" className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Razão Social</label>
                  <input type="text" value={form.reasonSocial} onChange={(e) => updateField('reasonSocial', e.target.value)} placeholder="Ex: Entretenimentos LTDA" className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">CNPJ</label>
                  <input type="text" value={formatCNPJ(form.cnpj)} onChange={(e) => updateField('cnpj', e.target.value)} placeholder="00.000.000/0000-00" maxLength={18} className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF] font-mono" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Nome do Responsável</label>
                  <input type="text" value={form.responsibleName} onChange={(e) => updateField('responsibleName', e.target.value)} placeholder="Ex: João Silva" className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Email</label>
                  <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="gerencia@balada.com" className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Instagram / Link</label>
                  <input type="text" value={form.link} onChange={(e) => updateField('link', e.target.value)} placeholder="instagram.com/balada" className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Telefone Celular</label>
                  <input type="tel" value={formatPhone(form.cellPhoneNumber)} onChange={(e) => updateField('cellPhoneNumber', e.target.value)} placeholder="(11) 99999-9999" maxLength={15} className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF] font-mono" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Telefone Fixo</label>
                  <input type="tel" value={formatPhone(form.telephoneNumber)} onChange={(e) => updateField('telephoneNumber', e.target.value)} placeholder="(11) 4004-0000" maxLength={14} className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF] font-mono" />
                </div>
              </div>
            </div>

            {/* Seção 2: Localização */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#7B2FFF]/20 flex items-center justify-center"><span className="text-[#7B2FFF]">2</span></div>
                Endereço do estabelecimento
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">CEP</label>
                  <input type="text" value={formatCEP(form.cep)} onChange={(e) => updateField('cep', e.target.value)} placeholder="00000-000" maxLength={9} className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF] font-mono" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Número</label>
                  <input type="text" value={form.numb} onChange={(e) => updateField('numb', e.target.value)} placeholder="123" className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Complemento</label>
                  <input type="text" value={form.complemento} onChange={(e) => updateField('complemento', e.target.value)} placeholder="Ex: Bloco B, Sala 10" className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF]" />
                </div>
              </div>
            </div>

            {/* Seção 3: Detalhes */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Descrição da Balada</label>
                  <textarea value={form.description} onChange={(e) => updateField('description', e.target.value)} placeholder="Descreva o ambiente, estilo musical, etc..." rows={3} maxLength={4000} className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF] resize-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#B3B3C3] mb-2">Regulamento Interno</label>
                  <textarea value={form.rules} onChange={(e) => updateField('rules', e.target.value)} placeholder="Diretrizes da casa, dress code, restrições..." rows={2} maxLength={4000} className="w-full px-4 py-3 rounded-xl bg-[#15151D] border border-[#7B2FFF]/20 text-white focus:outline-none focus:border-[#7B2FFF] resize-none" />
                </div>

                <div className="flex items-center gap-3 p-3 bg-[#15151D]/50 rounded-xl border border-[#7B2FFF]/20">
                  <input
                    type="checkbox"
                    checked={form.verified}
                    onChange={(e) => updateField('verified', e.target.checked)}
                    className="w-5 h-5 accent-[#7B2FFF] cursor-pointer"
                  />
                  <label className="text-sm text-white cursor-pointer">Balada Verificada</label>
                </div>
              </div>
            </div>

            {/* Tarjas de Feedback */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
                  <span>Balada atualizada com sucesso!</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botões de Ação dentro do form */}
            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose} disabled={saving} className="flex-1 px-6 py-3 rounded-xl border border-[#7B2FFF]/30 text-[#B3B3C3] hover:text-white transition-all font-medium disabled:opacity-50">Cancelar</button>
              <button type="submit" disabled={saving} className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7B2FFF] to-[#A855F7] text-white font-semibold shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}