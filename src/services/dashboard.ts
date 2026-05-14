import axios from 'axios'
import type {
  DashboardMetricsResponse,
  EventRankingResponse,
  GrowthDataResponse,
  EventTypeDistributionResponse,
  CategoryDistributionResponse // Importe o novo tipo aqui
} from '../types'

// Create separate client for dashboard endpoints (they use /api instead of /api/v1)
const dashboardClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
})

// Get dashboard metrics
export const getDashboardMetrics = async (): Promise<DashboardMetricsResponse> => {
  const response = await dashboardClient.get('/dashboard/metrics')
  return response.data
}

// Get top confirmed events
export const getTopConfirmedEvents = async (limit: number = 10): Promise<EventRankingResponse[]> => {
  const response = await dashboardClient.get('/dashboard/events/top-confirmed', {
    params: { limit }
  })
  return response.data
}

// Get growth data
export const getGrowthData = async (days: number = 30): Promise<GrowthDataResponse[]> => {
  const response = await dashboardClient.get('/dashboard/growth', {
    params: { days }
  })
  return response.data
}

// Get event type distribution
export const getEventTypeDistribution = async (): Promise<EventTypeDistributionResponse[]> => {
  const response = await dashboardClient.get('/dashboard/events/distribution')
  return response.data
}

/**
 * ADICIONADO: Busca a distribuição por categorias para o gráfico de rosca
 */
export const getCategoryDistribution = async (): Promise<CategoryDistributionResponse[]> => {
  const response = await dashboardClient.get('/dashboard/categories')
  return response.data
}

// Note: RSVP endpoints are not implemented in the backend yet