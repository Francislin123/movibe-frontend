import { useEffect, useState } from 'react'
import { getEvents, searchEvents } from '../services/api'
import { Card, Field, EventTypeBadge } from '../components/ui'
import SearchInput from '../components/SearchInput'
import EntityImage from '../components/EntityImage'
import EventEditModal from '../components/EventEditModal'
import type { EventResponse } from '../types'

function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-500 hover:text-violet-600 text-xs font-medium transition-all duration-150 shrink-0"
      title="Editar evento"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
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

export default function Events() {
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null)

  function load(query?: string) {
    setLoading(true)
    const promise = query && query.trim() ? searchEvents(query.trim()) : getEvents()
    promise
      .then(setEvents)
      .catch(() => setLoading(false))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">Eventos</h1>
          <p className="text-sm text-textSecondary mt-1">Ordenados por data de início (ASC)</p>
        </div>

        <Card className="p-4">
          <SearchInput onSearch={load} loading={loading} placeholder="Buscar eventos..." />
        </Card>

        <div className="space-y-3">
          {loading && <p className="text-sm text-gray-400 text-center py-10">Carregando…</p>}
          {events.map(e => (
            <Card
              key={e.id}
              className="p-5 hover:shadow-xl transition-all duration-300 border border-surfaceBorder hover:border-primary/50 bg-gradient-to-br from-surface to-surface/80"
              style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(124, 58, 237, 0.1)' }}
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
                      <EditButton onClick={() => setEditingEvent(e)} />
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
          onSuccess={() => { setEditingEvent(null); load() }}
        />
      )}
    </>
  )
}
