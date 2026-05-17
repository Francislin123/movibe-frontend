import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getDashboardMetrics,
  getTopConfirmedEvents,
  getGrowthData,
  getCategoryDistribution
} from '../services/dashboard'
import { ErrorAlert } from '../components/ui'
import PremiumMetricCard from '../components/dashboard/PremiumMetricCard'
import GrowthChart from '../components/dashboard/GrowthChart'
import PremiumEventRanking from '../components/dashboard/PremiumEventRanking'
import CategoryChart from '../components/dashboard/CategoryChart'
import EngagementFunnel from '../components/dashboard/EngagementFunnel'
// 1. Importação do novo componente
import PerformanceRanking from '../components/dashboard/PerformanceRanking'

import type {
  DashboardMetricsResponse,
  EventRankingResponse,
  GrowthDataResponse,
  CategoryDistributionResponse
} from '../types'

export default function Dashboard() {
  const { t } = useTranslation()
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null)
  const [topEvents, setTopEvents] = useState<EventRankingResponse[]>([])
  const [growthData, setGrowthData] = useState<GrowthDataResponse[]>([])
  const [categoryData, setCategoryData] = useState<CategoryDistributionResponse[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [metricsData, eventsData, growthDataResult, categories] = await Promise.all([
        getDashboardMetrics(),
        getTopConfirmedEvents(5),
        getGrowthData(30),
        getCategoryDistribution()
      ])

      setMetrics(metricsData)
      setTopEvents(eventsData)
      setGrowthData(growthDataResult as GrowthDataResponse[])
      setCategoryData(categories)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Lógica para o Funil
  const funnelData = metrics ? [
    { step: 'Eventos Ativos', count: metrics.totalActiveEvents },
    { step: 'RSVPs', count: metrics.totalRsvps },
    { step: 'Check-ins', count: metrics.totalCheckIns },
  ] : [];

  // 2. Lógica para o Ranking de Performance (Mapeia o Top 5 eventos)
  const performanceData = topEvents.map(event => ({
    name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
    rsvps: event.confirmedCount,
    checkins: event.checkInCount
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-violet-500 gap-3">
        <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <span>{t('loading')}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">{t('welcome')}</h1>
        <p className="text-sm text-textSecondary mt-1">{t('overview')}</p>
      </div>

      {error && <ErrorAlert message={error} />}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            color="yellow"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthChart data={growthData} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <CategoryChart data={categoryData} loading={loading} />
        </div>

        <div className="lg:col-span-3">
          <EngagementFunnel data={funnelData} loading={loading} />
        </div>

        {/* 3. Inclusão do Ranking de Performance ocupando toda a largura */}
        <div className="lg:col-span-3">
          <PerformanceRanking data={performanceData} loading={loading} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
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
          title="Top Eventos por Engajamento"
          maxItems={5}
        />
      </div>
    </div>
  )
}