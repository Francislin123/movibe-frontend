import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  getDashboardMetrics, 
  getTopConfirmedEvents, 
  getGrowthData 
} from '../services/dashboard'
import { ErrorAlert } from '../components/ui'
import PremiumMetricCard from '../components/dashboard/PremiumMetricCard'
import GrowthChart from '../components/dashboard/GrowthChart'
import PremiumEventRanking from '../components/dashboard/PremiumEventRanking'

// Importamos os tipos oficiais do seu projeto para evitar conflitos de "Type Redefinition"
import type {
  DashboardMetricsResponse,
  EventRankingResponse,
  GrowthDataResponse
} from '../types'

export default function Dashboard() {
  const { t } = useTranslation()
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null)
  const [topEvents, setTopEvents] = useState<EventRankingResponse[]>([])

  // Usamos o tipo importado que contém userCount, eventCount, etc.
  const [growthData, setGrowthData] = useState<GrowthDataResponse[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [metricsData, eventsData, growthDataResult] = await Promise.all([
        getDashboardMetrics(),
        getTopConfirmedEvents(5),
        getGrowthData(30)
      ])

      setMetrics(metricsData)
      setTopEvents(eventsData)

      // O growthDataResult vindo do service deve bater com a interface global
      setGrowthData(growthDataResult as GrowthDataResponse[])

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

      {/* Metrics Grid */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <PremiumMetricCard
            title="Baladas"
            value={metrics.totalBaladas.toLocaleString()}
            icon="🏠"
            growth={metrics.baladaGrowthRate}
            trend={metrics.baladaGrowthRate >= 0 ? "up" : "down"}
            color="purple"
          />
          <PremiumMetricCard
            title="Eventos"
            value={metrics.totalEvents.toLocaleString()}
            icon="🎉"
            growth={metrics.eventGrowthRate}
            trend={metrics.eventGrowthRate >= 0 ? "up" : "down"}
            color="green"
          />
          <PremiumMetricCard
            title="Movibers"
            value={metrics.totalMovibers.toLocaleString()}
            icon="🎧"
            growth={metrics.moviberGrowthRate}
            trend={metrics.moviberGrowthRate >= 0 ? "up" : "down"}
            color="blue"
          />
          <PremiumMetricCard
            title="Usuários"
            value={metrics.totalUsers.toLocaleString()}
            icon="👥"
            growth={metrics.userGrowthRate}
            trend={metrics.userGrowthRate >= 0 ? "up" : "down"}
            color="purple"
          />
          <PremiumMetricCard
            title="RSVPs"
            value={metrics.totalRsvps.toLocaleString()}
            icon="✅"
            growth={metrics.rsvpGrowthRate}
            trend={metrics.rsvpGrowthRate >= 0 ? "up" : "down"}
            color="orange"
          />
          <PremiumMetricCard
            title="Check-ins"
            value={metrics.totalCheckIns.toLocaleString()}
            icon="📍"
            growth={metrics.checkInGrowthRate}
            trend={metrics.checkInGrowthRate >= 0 ? "up" : "down"}
            color="green"
          />
          <PremiumMetricCard
            title="Seguidores"
            value={metrics.totalFollowers.toLocaleString()}
            icon="❤️"
            growth={metrics.followerGrowthRate}
            trend={metrics.followerGrowthRate >= 0 ? "up" : "down"}
            color="pink"
          />
          <PremiumMetricCard
            title="Eventos Ativos"
            value={metrics.totalActiveEvents.toLocaleString()}
            icon="⚡"
            growth={metrics.activeEventGrowthRate}
            trend={metrics.activeEventGrowthRate >= 0 ? "up" : "down"}
            color="blue"
          />
        </div>
      )}

      {/* Charts and Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agora o growthData possui as propriedades exigidas pelo GrowthChart */}
        <GrowthChart data={growthData} loading={loading} />

        <PremiumEventRanking
          events={topEvents.map(event => ({
            id: event.id,
            title: event.title,
            image: event.image,
            type: event.eventType,
            confirmedCount: event.confirmedCount,
            checkInCount: event.checkInCount,
            eventDate: event.eventDate
          }))}
          title="Top Eventos"
          maxItems={5}
        />
      </div>
    </div>
  )
}