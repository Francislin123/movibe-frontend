import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getHealth } from '../services/api'
import { 
  getDashboardMetrics, 
  getTopConfirmedEvents, 
  getGrowthData 
} from '../services/dashboard'
import { ErrorAlert } from '../components/ui'
import MetricCard from '../components/dashboard/MetricCard'
import GrowthChart from '../components/dashboard/GrowthChart'
import EventRanking from '../components/dashboard/EventRanking'
import type { 
  HealthResponse, 
  DashboardMetricsResponse, 
  EventRankingResponse, 
  GrowthDataResponse 
} from '../types'

export default function Dashboard() {
  const { t } = useTranslation()
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null)
  const [topEvents, setTopEvents] = useState<EventRankingResponse[]>([])
  const [growthData, setGrowthData] = useState<GrowthDataResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [healthData, metricsData, eventsData, growthDataResult] = await Promise.all([
        getHealth(),
        getDashboardMetrics(),
        getTopConfirmedEvents(5),
        getGrowthData(30)
      ])
      
      setHealth(healthData)
      setMetrics(metricsData)
      setTopEvents(eventsData)
      setGrowthData(growthDataResult)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-violet-500 gap-3">
        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span className="text-sm font-medium">{t('loading')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">{t('welcome')}</h1>
        <p className="text-sm text-textSecondary mt-1">{t('overview')}</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {/* Health */}
      {health && (
        <div className="flex items-center gap-3 bg-surface border border-surfaceBorder rounded-2xl px-5 py-4 shadow-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${health.status === 'UP' ? 'bg-success' : 'bg-error'} animate-pulse`} />
          <div>
            <p className="text-sm font-semibold text-textPrimary">{health.service}</p>
            <p className="text-xs text-textTertiary">{t('healthStatus')}: <span className={health.status === 'UP' ? 'text-success font-semibold' : 'text-error font-semibold'}>{health.status}</span></p>
          </div>
          <span className="ml-auto text-xs text-textTertiary font-mono">localhost:8080</span>
        </div>
      )}

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Baladas"
            value={metrics.totalBaladas}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
            color="purple"
          />
          <MetricCard
            title="Eventos"
            value={metrics.totalEvents}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            color="green"
            growth={metrics.eventGrowthRate}
          />
          <MetricCard
            title="Movibers"
            value={metrics.totalMovibers}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
            color="blue"
          />
          <MetricCard
            title="Usuários"
            value={metrics.totalUsers}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
            color="purple"
            growth={metrics.userGrowthRate}
          />
          <MetricCard
            title="RSVPs"
            value={metrics.totalRsvps}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            color="orange"
          />
          <MetricCard
            title="Check-ins"
            value={metrics.totalCheckIns}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
            color="green"
          />
          <MetricCard
            title="Seguidores"
            value={metrics.totalFollowers}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
            color="pink"
          />
          <MetricCard
            title="Eventos Ativos"
            value={metrics.totalActiveEvents}
            icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
            color="blue"
          />
        </div>
      )}

      {/* Charts and Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GrowthChart data={growthData} loading={loading} />
        <EventRanking events={topEvents} loading={loading} />
      </div>
    </div>
  )
}
