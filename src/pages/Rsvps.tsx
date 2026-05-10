import { useEffect, useState } from 'react'
import { getRsvps, createRsvp } from '../services/api'
import { Card, EmptyState, ErrorAlert, Field, Label, Input, Select, SubmitButton } from '../components/ui'
import type { RsvpGoingResponse, CreateRsvpRequest, ApiError, RsvpIntention } from '../types'

const INTENTION_LABEL: Record<RsvpIntention, string> = {
  ONLY_DRINKS:  '🍹 Só beber',
  FIND_PARTNER: '💘 Encontrar alguém',
  JUST_DANCE:   '💃 Dançar',
  NETWORK:      '🤝 Networking',
  OPEN:         '✨ Aberto',
}

function fmtDate(value: string) {
  if (!value) return ''

  const [datePart, timePart] = value.split('T')

  const [year, month, day] = datePart.split('-')
  const [hour, minute] = timePart.split(':')

  return `${day}/${month}/${year} ${hour}:${minute}` 
}

export default function Rsvps() {
  const [rsvps, setRsvps]     = useState<RsvpGoingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm]           = useState<CreateRsvpRequest>({ userId: '', eventId: '', intention: 'OPEN' })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)

  function load() {
    setLoading(true)
    getRsvps()
      .then(setRsvps)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setFormError(null); setSuccess(null)
    try {
      const created = await createRsvp(form)
      setSuccess(`RSVP #${created.id} criado! Intenção: ${INTENTION_LABEL[created.intention]}`)
      setForm({ userId: '', eventId: '', intention: 'OPEN' })
      load()
    } catch (e) { setFormError((e as ApiError).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">RSVPs — EU VOU</h1>
        <p className="text-sm text-gray-500 mt-1">Confirmações de presença — ordenadas por data (DESC)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Novo RSVP</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-xs text-amber-700">
            ⚠ Usuário deve estar <strong>ACTIVE</strong>. RSVP não permitido após o fim do evento.
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>User ID *</Label>
              <Input required value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} placeholder="UUID do usuário" />
            </div>
            <div>
              <Label>Event ID *</Label>
              <Input required value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))} placeholder="UUID do evento" />
            </div>
            <div>
              <Label>Intenção *</Label>
              <Select value={form.intention} onChange={e => setForm(f => ({ ...f, intention: e.target.value as RsvpIntention }))}>
                {(Object.keys(INTENTION_LABEL) as RsvpIntention[]).map(k => (
                  <option key={k} value={k}>{INTENTION_LABEL[k]}</option>
                ))}
              </Select>
            </div>
            {formError && <ErrorAlert message={formError} />}
            {success && <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 break-all">{success}</div>}
            <SubmitButton loading={saving}>Confirmar EU VOU</SubmitButton>
          </form>
        </Card>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <p className="text-sm text-gray-400 text-center py-10">Carregando…</p>}
          {error && <ErrorAlert message={error} />}
          {!loading && !error && rsvps.length === 0 && <EmptyState label="Nenhum RSVP registrado ainda." />}
          {rsvps.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-800">{INTENTION_LABEL[r.intention]}</p>
                  <p className="text-xs text-gray-400 mt-0.5">RSVP #{r.id} · {fmtDate(r.decidedAt)}</p>
                </div>
                <span className="text-xs bg-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-full">EU VOU</span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-y-2">
                <Field label="User ID" value={<span className="font-mono text-xs break-all">{r.userId}</span>} />
                <Field label="Event ID" value={<span className="font-mono text-xs break-all">{r.eventId}</span>} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
