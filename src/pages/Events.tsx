import { useEffect, useState } from 'react'
import { getEvents, searchEvents, createEvent } from '../services/api'
import { Card, ErrorAlert, Field, EventTypeBadge, Label, Input, SubmitButton } from '../components/ui'
import SearchInput from '../components/SearchInput'
import EntityImage from '../components/EntityImage'
import EventEditModal from '../components/EventEditModal'
import type { EventResponse, CreateEventRequest, ApiError, EventType } from '../types'

// Botão de edição (padronizado com Users.tsx e Baladas.tsx)
function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-500 hover:text-violet-600 text-xs font-medium transition-all duration-150 shrink-0"
      title="Editar evento"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Editar
    </button>
  )
}

function fmtDate(value: string) {
  if (!value) return ''

  const [datePart, timePart] = value.split('T')

  const [year, month, day] = datePart.split('-')
  const [hour, minute] = timePart.split(':')

  return `${day}/${month}/${year} ${hour}:${minute}` 
}

// Helper para validação de datas
function isValidDateTimeLocal(value: string): boolean {
  if (!value) return false
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/
  return regex.test(value)
}

function toIso(local: string) {
  if (!local) return ''

  return local.length === 16
    ? `${local}:00` 
    : local
}

export default function Events() {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)

  const nowLocal = ''

  const [form, setForm] = useState<{
    promoterId: string; hostBaladaId: string; type: EventType
    title: string; cep: string; desc: string; startsAt: string; endsAt: string
  }>({ promoterId: '', hostBaladaId: '', type: 'STANDARD', title: '', cep: '', desc: '', startsAt: nowLocal, endsAt: nowLocal })

  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)

  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null)

  const handleEdit = (event: EventResponse) => {
    setEditingEvent(event)
  }

  function load(query?: string) {
    setLoading(true)
    const promise = query && query.trim() ? searchEvents(query.trim()) : getEvents();
    promise
      .then(setEvents)
      .catch(() => setLoading(false))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setFormError(null); setSuccess(null)
    
    try {
      // Validação final antes do envio
      if (!form.startsAt || !form.endsAt) {
        throw new Error('Datas de início e fim são obrigatórias')
      }
      
      if (!isValidDateTimeLocal(form.startsAt) || !isValidDateTimeLocal(form.endsAt)) {
        throw new Error('Formato de data/hora inválido')
      }
      
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
      
      // Log para debug do payload final - deve ser exatamente como usuário escolheu
      console.log('Payload enviado (sem UTC):', payload)
      console.log('startsAt tipo:', typeof payload.startsAt, 'valor:', payload.startsAt)
      console.log('endsAt tipo:', typeof payload.endsAt, 'valor:', payload.endsAt)
      
      const created = await createEvent(payload)
      setSuccess(`Evento "${created.title}" criado!`)
      load()
    } catch (e) { 
      setFormError((e as ApiError).message) 
    }
    finally { 
      setSaving(false) 
    }
  }

  const s = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: ev.target.value }))

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm text-gray-500 mt-1">Ordenados por data de início (ASC)</p>
        </div>

        {/* Formulário */}
        <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/30 border-violet-200/50">
          <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">Novo Evento</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><Label>Promoter ID *</Label><Input required value={form.promoterId} onChange={s('promoterId')} /></div>
               <div>
                  <Label>Tipo *</Label>
                  <select value={form.type} onChange={s('type')} className="w-full mt-1 px-3 py-2 border rounded-lg text-sm">
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM_BALLAD">Premium Ballad</option>
                    <option value="NETWORK">Network</option>
                    <option value="OPEN">Open</option>
                  </select>
               </div>
            </div>
            <div><Label>Título *</Label><Input required value={form.title} onChange={s('title')} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div><Label>Início *</Label>
                  <Input 
                    type="datetime-local" 
                    required 
                    step="60" 
                    value={form.startsAt || ''} 
                    onChange={s('startsAt')}
                    className={form.startsAt && !isValidDateTimeLocal(form.startsAt) ? 'border-red-500 focus:ring-red-500' : ''}
                  />
               </div>
               <div><Label>Fim *</Label>
                  <Input 
                    type="datetime-local" 
                    required 
                    step="60" 
                    value={form.endsAt || ''} 
                    onChange={s('endsAt')}
                    className={form.endsAt && !isValidDateTimeLocal(form.endsAt) ? 'border-red-500 focus:ring-red-500' : ''}
                  />
               </div>
            </div>
            {formError && <ErrorAlert message={formError} />}
            {success && <div className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-lg">{success}</div>}
            <SubmitButton loading={saving}>Criar Evento</SubmitButton>
          </form>
        </Card>

        <Card className="p-4">
          <SearchInput onSearch={load} loading={loading} placeholder="Buscar eventos..." />
        </Card>

        {/* Lista */}
        <div className="space-y-3">
          {loading && <p className="text-center py-10">Carregando…</p>}
          {events.map(e => (
            <Card key={e.id} className="p-4">
              <div className="flex gap-4">
                <EntityImage image={e.image} name={e.title} size="md" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="font-semibold">{e.title}</p>
                    <div className="flex gap-2">
                      <EventTypeBadge type={e.type} />
                      <EditButton onClick={() => handleEdit(e)} />
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 text-xs gap-2">
                    <Field label="Início" value={fmtDate(e.startsAt)} />
                    <Field label="Fim" value={fmtDate(e.endsAt)} />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => { setEditingEvent(null); load(); }}
        />
      )}
    </>
  )
}