import axios from 'axios'
import type {
  DashboardMetricsResponse,
  EventRankingResponse,
  GrowthDataResponse,
  EventTypeDistributionResponse
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

// Note: RSVP endpoints are not implemented in the backend yet
// These functions are kept for future implementation
