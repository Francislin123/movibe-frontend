import { useState } from 'react'
import { createEvent } from '../services/api'
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
  const [form, setForm] = useState<{
    type: EventType; title: string; cep: string; desc: string; startsAt: string; endsAt: string
  }>({ type: 'STANDARD', title: '', cep: '', desc: '', startsAt: '', endsAt: '' })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const s = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.startsAt || !form.endsAt) {
      setError('Datas de início e fim são obrigatórias')
      return
    }
    if (!isValidDateTimeLocal(form.startsAt) || !isValidDateTimeLocal(form.endsAt)) {
      setError('Formato de data/hora inválido')
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
      setSuccess(`Evento "${created.title}" criado com sucesso!`)
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err) {
      setError((err as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg bg-backgroundSecondary border border-surfaceBorder rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,58,237,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surfaceBorder bg-surface/40">
          <div>
            <p className="text-base font-bold text-textPrimary">Criar Evento</p>
            <p className="text-xs text-textTertiary mt-0.5 truncate max-w-xs">
              Balada: <span className="text-primary font-medium">{hostBaladaName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-surfaceHover flex items-center justify-center text-textTertiary hover:text-textPrimary transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Título *</Label>
                <Input required value={form.title} onChange={s('title')} placeholder="Ex: Pool Party SP" />
              </div>

              <div className="col-span-2">
                <Label>Tipo *</Label>
                <select
                  value={form.type}
                  onChange={s('type')}
                  className="w-full px-4 py-2.5 bg-surface border border-surfaceBorder rounded-xl text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                >
                  <option value="STANDARD">Standard</option>
                  <option value="PREMIUM_BALLAD">Premium Ballad</option>
                  <option value="NETWORK">Network</option>
                  <option value="OPEN">Open</option>
                </select>
              </div>

              <div>
                <Label>Início *</Label>
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
                <Label>Fim *</Label>
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
                <Label>CEP</Label>
                <Input value={form.cep} onChange={s('cep')} placeholder="00000-000" maxLength={9} />
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <textarea
                value={form.desc}
                onChange={s('desc')}
                placeholder="Descrição do evento..."
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

            <div className="flex gap-3 pt-1">
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
                className="flex-1 bg-primary hover:bg-primaryHover disabled:bg-primaryLight text-white py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Spinner size={4} />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Criar Evento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
