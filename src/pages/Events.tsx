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
    hostBaladaId: string; type: EventType
    title: string; cep: string; desc: string; startsAt: string; endsAt: string
  }>({ hostBaladaId: '', type: 'STANDARD', title: '', cep: '', desc: '', startsAt: nowLocal, endsAt: nowLocal })

  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  const [open, setOpen]           = useState(false)

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
      if (!form.hostBaladaId) {
        throw new Error('Balada dona (Host Balada ID) é obrigatória')
      }

      // Validação final antes do envio
      if (!form.startsAt || !form.endsAt) {
        throw new Error('Datas de início e fim são obrigatórias')
      }
      
      if (!isValidDateTimeLocal(form.startsAt) || !isValidDateTimeLocal(form.endsAt)) {
        throw new Error('Formato de data/hora inválido')
      }
      
      const payload: CreateEventRequest = {
        hostBaladaId: form.hostBaladaId,
        type: form.type,
        title: form.title,
        startsAt: toIso(form.startsAt),
        endsAt: toIso(form.endsAt),
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
      setOpen(false)
    } catch (e) { 
      setFormError((e as ApiError).message) 
    }
    finally { 
      setSaving(false) 
    }
  }

  const s = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: ev.target.value }))

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Eventos</h1>
          <p className="text-sm text-textSecondary mt-1">Ordenados por data de início (ASC)</p>
        </div>

        {/* Collapsible Form Card */}
        <Card className="overflow-hidden border border-surfaceBorder">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-surfaceHover transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </span>
              <span className="text-sm font-semibold text-textPrimary">
                Novo Evento
              </span>
            </div>
            <svg
              className={`w-4 h-4 text-textTertiary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Collapsible form */}
          {open && (
            <div className="border-t border-surfaceBorder px-5 py-5">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Host Balada ID *</Label>
                    <Input required value={form.hostBaladaId} onChange={s('hostBaladaId')} placeholder="ID da balada" />
                  </div>
                  <div>
                    <Label>Tipo *</Label>
                    <select
                      value={form.type}
                      onChange={s('type')}
                      className="w-full mt-1 px-4 py-2.5 bg-surface border border-surfaceBorder rounded-xl text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                    >
                      <option value="STANDARD">Standard</option>
                      <option value="PREMIUM_BALLAD">Premium Ballad</option>
                      <option value="NETWORK">Network</option>
                      <option value="OPEN">Open</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Título *</Label>
                  <Input required value={form.title} onChange={s('title')} placeholder="Ex: Pool Party SP" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full mt-1 px-4 py-2.5 bg-surface border border-surfaceBorder rounded-xl text-textPrimary text-sm placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Início *</Label>
                    <Input
                      type="datetime-local"
                      required
                      step="60"
                      value={form.startsAt || ''}
                      onChange={s('startsAt')}
                      className={form.startsAt && !isValidDateTimeLocal(form.startsAt) ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                  </div>
                  <div>
                    <Label>Fim *</Label>
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
                {success && (
                  <div className="text-xs text-center bg-success/10 border border-success/20 text-success rounded-xl px-4 py-3">
                    {success}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={saving}
                    className="flex-1 border border-surfaceBorder text-textSecondary hover:bg-surfaceHover py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <SubmitButton loading={saving}>Criar Evento</SubmitButton>
                </div>
              </form>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <SearchInput onSearch={load} loading={loading} placeholder="Buscar eventos..." />
        </Card>

        {/* Lista */}
        <div className="space-y-3">
          {loading && <p className="text-sm text-gray-400 text-center py-10">Carregando…</p>}
          {events.map(e => (
            <Card
              key={e.id}
              className="p-5 hover:shadow-xl transition-all duration-300 border border-surfaceBorder hover:border-primary/50 bg-gradient-to-br from-surface to-surface/80"
              style={{
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(124, 58, 237, 0.1)'
              }}
            >
              <div className="flex gap-4">
                <EntityImage
                  image={e.image}
                  name={e.title}
                  size="md"
                  fallback={
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg ring-2 ring-amber-500/30">
                      <span className="text-xl font-bold">{e.title.charAt(0).toUpperCase()}</span>
                    </div>
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-textPrimary text-lg truncate">{e.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <EventTypeBadge type={e.type} />
                      <EditButton onClick={() => handleEdit(e)} />
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-surface/50">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <Field label="Início" value={
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-semibold shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fmtDate(e.startsAt)}
                        </span>
                      } />
                      <Field label="Fim" value={
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 text-white text-xs font-semibold shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fmtDate(e.endsAt)}
                        </span>
                      } />
                    </div>
                  </div>

                  {e.desc && (
                    <div className="mt-4 p-3 rounded-xl bg-primary/5 border-l-4 border-primary">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">Descrição</p>
                      <p className="text-sm text-textSecondary leading-relaxed line-clamp-3">{e.desc}</p>
                    </div>
                  )}
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