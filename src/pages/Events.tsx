import { useEffect, useState } from 'react'
import { getEvents, createEvent } from '../services/api'
import { Card, EmptyState, ErrorAlert, Field, EventTypeBadge, Label, Input, Select, SubmitButton } from '../components/ui'
import type { EventResponse, CreateEventRequest, ApiError, EventType } from '../types'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

// local datetime-local value → ISO string
function toIso(local: string) {
  return local ? new Date(local).toISOString() : ''
}

export default function Events() {
  const [events, setEvents]   = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  const nowLocal = now.toISOString().slice(0, 16)

  const [form, setForm] = useState<{
    promoterId: string; hostBaladaId: string; type: EventType
    title: string; cep: string; desc: string; startsAt: string; endsAt: string
  }>({ promoterId: '', hostBaladaId: '', type: 'STANDARD', title: '', cep: '', desc: '', startsAt: nowLocal, endsAt: nowLocal })

  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)

  function load() {
    setLoading(true)
    getEvents()
      .then(setEvents)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setFormError(null); setSuccess(null)
    try {
      const payload: CreateEventRequest = {
        promoterId: form.promoterId,
        type: form.type,
        title: form.title,
        startsAt: toIso(form.startsAt),
        endsAt: toIso(form.endsAt),
        ...(form.hostBaladaId && { hostBaladaId: form.hostBaladaId }),
        ...(form.cep && { cep: form.cep }),
        ...(form.desc && { desc: form.desc }),
      }
      const created = await createEvent(payload)
      setSuccess(`Evento "${created.title}" criado! ID: ${created.id}`)
      load()
    } catch (e) { setFormError((e as ApiError).message) }
    finally { setSaving(false) }
  }

  const s = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: ev.target.value }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <p className="text-sm text-gray-500 mt-1">Ordenados por data de início (ASC)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Novo Evento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Promoter ID *</Label>
              <Input required value={form.promoterId} onChange={s('promoterId')} placeholder="UUID do Moviber" />
            </div>
            <div>
              <Label>Tipo *</Label>
              <Select value={form.type} onChange={s('type')}>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM_BALLAD">★ Premium Ballad (VIP)</option>
              </Select>
              {form.type === 'PREMIUM_BALLAD' && (
                <p className="text-xs text-amber-600 mt-1">⚠ Requer Moviber com assinatura VIP_BALLADS_FOR_PROMOTERS</p>
              )}
            </div>
            <div>
              <Label>Título *</Label>
              <Input required value={form.title} onChange={s('title')} placeholder="Ex: Funk Night Especial" />
            </div>
            <div>
              <Label>Host Balada ID</Label>
              <Input value={form.hostBaladaId} onChange={s('hostBaladaId')} placeholder="UUID da balada (opcional)" />
            </div>
            <div>
              <Label>Início *</Label>
              <Input required type="datetime-local" value={form.startsAt} onChange={s('startsAt')} />
            </div>
            <div>
              <Label>Fim *</Label>
              <Input required type="datetime-local" value={form.endsAt} onChange={s('endsAt')} />
            </div>
            <div>
              <Label>CEP</Label>
              <Input value={form.cep} onChange={s('cep')} placeholder="00000-000" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={form.desc} onChange={s('desc')} placeholder="Detalhes do evento…" />
            </div>
            {formError && <ErrorAlert message={formError} />}
            {success && <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 break-all">{success}</div>}
            <SubmitButton loading={saving}>Criar Evento</SubmitButton>
          </form>
        </Card>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <p className="text-sm text-gray-400 text-center py-10">Carregando…</p>}
          {error && <ErrorAlert message={error} />}
          {!loading && !error && events.length === 0 && <EmptyState label="Nenhum evento cadastrado ainda." />}
          {events.map(ev => (
            <Card key={ev.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{ev.title}</p>
                  <p className="text-xs font-mono text-gray-400 truncate mt-0.5">{ev.id}</p>
                </div>
                <EventTypeBadge type={ev.type} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <Field label="Início" value={fmtDate(ev.startsAt)} />
                <Field label="Fim" value={fmtDate(ev.endsAt)} />
                <Field label="Promoter ID" value={<span className="font-mono text-xs">{ev.promoterId.slice(0, 8)}…</span>} />
                {ev.hostBaladaId && <Field label="Balada ID" value={<span className="font-mono text-xs">{ev.hostBaladaId.slice(0, 8)}…</span>} />}
                <Field label="CEP" value={ev.cep} />
                {ev.desc && <Field label="Descrição" value={ev.desc.slice(0, 80) + (ev.desc.length > 80 ? '…' : '')} />}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
