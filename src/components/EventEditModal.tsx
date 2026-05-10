import { useState, useEffect, useRef } from 'react'
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
  
  // Se já está no formato datetime-local, retorna como está
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // Se está no formato ISO com timezone, remove o timezone manualmente
  if (dateString.includes('Z') || dateString.includes('+')) {
    // Remove tudo após 'T' e adiciona ':00'
    return dateString.split('T')[0] + 'T00:00'
  }
  
  return dateString
}

export default function EventEditModal({ event, onClose, onSuccess }: EventEditModalProps) {
  const [form, setForm] = useState<Partial<EventResponse>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── image state ─────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(event?.image || null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Sincronizar form quando o evento mudar
  useEffect(() => {
    if (event) {
      setForm(event)
      setError(null)
      setImagePreview(event.image)
    }
  }, [event])

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
    if (!event) return

    setSaving(true)
    setError(null)

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

      // 2. Se escolheu nova imagem, faz o upload e atualiza o campo image
      if (imageFile) {
        await updateEventImage(event.id, imageFile)
      }

      onSuccess()
    } catch (e) {
      setError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  if (!event) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Editar Evento</h2>
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
                    alt={event.title}
                    className="w-20 h-20 rounded-2xl object-cover ring-2 ring-blue-200 shadow"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow">
                    {event.title?.charAt(0)?.toUpperCase() || 'E'}
                  </div>
                )}
                {/* Upload trigger badge */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition"
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
                <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                <p className="text-xs font-mono text-gray-400 mt-0.5 break-all">{event.id}</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                >
                  {imageFile ? `✓ ${imageFile.name}` : 'Clique para trocar a foto do evento'}
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
              <Label>Tipo *</Label>
              <select
                required
                value={form.type || event.type || 'STANDARD'}
                onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM_BALLAD">Premium Ballad</option>
                <option value="NETWORK">Network</option>
                <option value="OPEN">Open</option>
              </select>
            </div>
            <div>
              <Label>Título *</Label>
              <Input
                required
                value={form.title || event.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: Festa de Aniversário"
              />
            </div>

            <div>
              <Label>CEP</Label>
              <Input
                value={form.cep || event.cep || ''}
                onChange={(e) => setForm({ ...form, cep: e.target.value })}
                placeholder="00000-000"
                maxLength={9}
              />
            </div>

            <div>
              <Label>Número</Label>
              <Input
                value={form.numb || event.numb || ''}
                onChange={(e) => setForm({ ...form, numb: e.target.value })}
                placeholder="123"
              />
            </div>

            <div className="col-span-2">
              <Label>Descrição</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                rows={3}
                value={form.desc || event.desc || ''}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
                placeholder="Descrição detalhada do evento..."
                maxLength={4000}
              />
            </div>

            <div>
              <Label>Data de Início *</Label>
              <Input
                type="datetime-local"
                required
                step="60"
                value={form.startsAt ? formatDateTimeLocal(form.startsAt) : formatDateTimeLocal(event.startsAt)}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>

            <div>
              <Label>Data de Fim *</Label>
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
