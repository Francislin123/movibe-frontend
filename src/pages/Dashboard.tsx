import { useEffect, useState } from 'react'
import { getHealth, getBaladas, getEvents, getMovibers, getUsers, getRsvps } from '../services/api'
import { StatCard, ErrorAlert } from '../components/ui'
import type { HealthResponse } from '../types'

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [counts, setCounts] = useState({ baladas: 0, events: 0, movibers: 0, users: 0, rsvps: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      getHealth(),
      getBaladas(),
      getEvents(),
      getMovibers(),
      getUsers(),
      getRsvps(),
    ])
      .then(([h, baladas, events, movibers, users, rsvps]) => {
        setHealth(h)
        setCounts({
          baladas: baladas.length,
          events: events.length,
          movibers: movibers.length,
          users: users.length,
          rsvps: rsvps.length,
        })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-violet-500 gap-3">
        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm font-medium">Carregando dados…</span>
      </div>
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">Bem-vindo ao Movibe 👋</h1>
        <p className="text-sm text-textSecondary mt-1">Visão geral da plataforma</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Health */}
      {health && (
        <div className="flex items-center gap-3 bg-surface border border-surfaceBorder rounded-2xl px-5 py-4 shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${health.status === 'UP' ? 'bg-success' : 'bg-error'} animate-pulse`} />
          <div>
            <p className="text-sm font-semibold text-textPrimary">{health.service}</p>
            <p className="text-xs text-textTertiary">Status: <span className={health.status === 'UP' ? 'text-success font-semibold' : 'text-error font-semibold'}>{health.status}</span></p>
          </div>
          <span className="ml-auto text-xs text-textTertiary font-mono">localhost:8080</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Baladas" value={counts.baladas} color="blue" />
        <StatCard label="Eventos" value={counts.events} color="amber" />
        <StatCard label="Movibers" value={counts.movibers} color="violet" />
        <StatCard label="Usuários" value={counts.users} color="emerald" />
        <StatCard label="RSVPs" value={counts.rsvps} color="rose" />
      </div>
    </div>
  )
}
