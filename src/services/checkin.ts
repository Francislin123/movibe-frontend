import axios from 'axios'

// Create separate client for check-in endpoints (they use /api instead of /api/v1)
const checkinClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export interface EventCheckInResponse {
  id: string
  eventId: string
  userId: string
  checkedIn: boolean
  checkedInAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EventCheckInStatsResponse {
  totalConfirmed: number
  totalCheckedIn: number
  notCheckedIn: number
}

// Perform check-in for a user in an event
export const performEventCheckIn = async (eventId: string, userId: string): Promise<EventCheckInResponse> => {
  const response = await checkinClient.post(`/events/${eventId}/checkins/users/${userId}`)
  return response.data
}

// Cancel check-in for a user in an event
export const cancelEventCheckIn = async (eventId: string, userId: string): Promise<EventCheckInResponse> => {
  const response = await checkinClient.delete(`/events/${eventId}/checkins/users/${userId}`)
  return response.data
}

// Get all check-ins for an event
export const getEventCheckIns = async (eventId: string): Promise<EventCheckInResponse[]> => {
  const response = await checkinClient.get(`/events/${eventId}/checkins`)
  return response.data
}

// Get only checked-in users for an event
export const getCheckedInUsers = async (eventId: string): Promise<EventCheckInResponse[]> => {
  const response = await checkinClient.get(`/events/${eventId}/checkins/checked-in`)
  return response.data
}

// Get event check-in statistics
export const getEventCheckInStats = async (eventId: string): Promise<EventCheckInStatsResponse> => {
  const response = await checkinClient.get(`/events/${eventId}/checkins/stats`)
  return response.data
}

// Check if a specific user is checked in
export const isUserCheckedIn = async (eventId: string, userId: string): Promise<boolean> => {
  const response = await checkinClient.get(`/events/${eventId}/checkins/users/${userId}/status`)
  return response.data
}

// Get specific user check-in details
export const getUserCheckIn = async (eventId: string, userId: string): Promise<EventCheckInResponse | null> => {
  try {
    const response = await checkinClient.get(`/events/${eventId}/checkins/users/${userId}`)
    return response.data
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}
