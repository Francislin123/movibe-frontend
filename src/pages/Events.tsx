import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getEvents, searchEvents, getEventUsers, getUsers } from '../services/api'
import { performEventCheckIn, cancelEventCheckIn, isUserCheckedIn, getEventCheckInStats } from '../services/checkin'
import { Card, Field, EventTypeBadge, Spinner } from '../components/ui'
import SearchInput from '../components/SearchInput'
import EntityImage from '../components/EntityImage'
import EventEditModal from '../components/EventEditModal'
import EventUserCard from '../components/EventUserCard'
import type { EventResponse, EventUserResponse, ApiError } from '../types'

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-500 hover:text-violet-600 text-xs font-medium transition-all duration-150 shrink-0"
      title={label}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      {label}
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
  const { t } = useTranslation()
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null)

  // ── event users state ───────────────────────────────────────────────────────
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [eventUsersCache, setEventUsersCache] = useState<Record<string, { loading: boolean; users: EventUserResponse[]; error: string | null }>>({})
  const [eventUserSearchCache, setEventUserSearchCache] = useState<Record<string, string>>({})
  
  // ── event check-in state ─────────────────────────────────────────────────────
  const [checkInCache, setCheckInCache] = useState<Record<string, Set<string>>>({})
  const [checkInLoadingCache, setCheckInLoadingCache] = useState<Record<string, Set<string>>>({})
  const [eventStatsCache, setEventStatsCache] = useState<Record<string, { totalConfirmed: number; totalCheckedIn: number }>>({})
  
  // ── event search state ───────────────────────────────────────────────────────
  const [eventSearchQuery, setEventSearchQuery] = useState('')
  
  
  function load(query?: string) {
    setLoading(true)
    const promise = query && query.trim() ? searchEvents(query.trim()) : getEvents()
    promise
      .then(setEvents)
      .catch(() => setLoading(false))
      .finally(() => setLoading(false))
  }

  useEffect(() => { 
  load()
}, [])

  function handleEventUserSearch(eventId: string, query: string) {
    setEventUserSearchCache(prev => ({ ...prev, [eventId]: query }))
  }

  function getFilteredEventUsers(eventId: string): EventUserResponse[] {
    const cache = eventUsersCache[eventId]
    if (!cache || !cache.users) return []
    
    const searchQuery = eventUserSearchCache[eventId]
    if (!searchQuery || !searchQuery.trim()) return cache.users
    
    const searchLower = searchQuery.toLowerCase()
    return cache.users.filter(eventUser => 
      eventUser.user.displayName.toLowerCase().includes(searchLower) ||
      eventUser.user.email?.toLowerCase().includes(searchLower)
    )
  }

  
  function handleEventSearch(query: string) {
    setEventSearchQuery(query)
  }

  function getFilteredEvents(): EventResponse[] {
    if (!eventSearchQuery || !eventSearchQuery.trim()) return events
    
    const searchLower = eventSearchQuery.toLowerCase()
    return events.filter(event => 
      event.title.toLowerCase().includes(searchLower) ||
      event.desc?.toLowerCase().includes(searchLower) ||
      event.cep?.toLowerCase().includes(searchLower) ||
      event.type.toLowerCase().includes(searchLower)
    )
  }

  // ── event users functions ─────────────────────────────────────────────────────
  async function toggleEventUsers(eventId: string) {
    if (expandedEventId === eventId) {
      setExpandedEventId(null)
      return
    }
    setExpandedEventId(eventId)
    // Lê o cache atual de forma síncrona via ref para evitar stale closure
    setEventUsersCache(prev => {
      const entry = prev[eventId]
      // Se já temos dados válidos em cache, não rebusca
      if (entry && !entry.error && (entry.loading || entry.users.length > 0)) return prev
      // Caso contrário, dispara o fetch e marca como loading
      getEventUsers(eventId)
        .then(users => {
          setEventUsersCache(c => ({ ...c, [eventId]: { loading: false, users, error: null } }))
          // Load check-in status for all users
          if (users.length > 0) {
            const userIds = users.map(u => u.user.id)
            loadCheckInStatus(eventId, userIds)
          }
        })
        .catch(e => setEventUsersCache(c => ({ ...c, [eventId]: { loading: false, users: [], error: (e as ApiError).message } })))
      return { ...prev, [eventId]: { loading: true, users: [], error: null } }
    })
  }

  function refreshEventUsers(eventId: string) {
    // Uma única chamada setState atômica para evitar duplo render / race condition
    setEventUsersCache(c => ({ ...c, [eventId]: { loading: true, users: [], error: null } }))
    getEventUsers(eventId)
      .then(users => {
        setEventUsersCache(c => ({ ...c, [eventId]: { loading: false, users, error: null } }))
        // Load check-in status for all users
        if (users.length > 0) {
          const userIds = users.map(u => u.user.id)
          loadCheckInStatus(eventId, userIds)
        }
      })
      .catch(e => setEventUsersCache(c => ({ ...c, [eventId]: { loading: false, users: [], error: (e as ApiError).message } })))
  }

  // ── check-in functions ───────────────────────────────────────────────────────
  async function handleCheckIn(eventId: string, userId: string) {
    console.log('Check-in clicked:', { eventId, userId })
    
    // Set loading state
    setCheckInLoadingCache(prev => ({
      ...prev,
      [eventId]: new Set(prev[eventId] || []).add(userId)
    }))

    try {
      console.log('Calling performEventCheckIn API...')
      const result = await performEventCheckIn(eventId, userId)
      console.log('Check-in API result:', result)
      
      // Update check-in cache
      setCheckInCache(prev => ({
        ...prev,
        [eventId]: new Set(prev[eventId] || []).add(userId)
      }))
      console.log('Updated check-in cache - added user:', userId)

      // Update stats
      await loadEventStats(eventId)
    } catch (error) {
      console.error('Check-in failed:', error)
      // TODO: Show error toast/notification
    } finally {
      // Clear loading state
      setCheckInLoadingCache(prev => {
        const newSet = new Set(prev[eventId] || [])
        newSet.delete(userId)
        return { ...prev, [eventId]: newSet }
      })
    }
  }

  async function handleCancelCheckIn(eventId: string, userId: string) {
    console.log('Cancel check-in clicked:', { eventId, userId })
    
    // Set loading state
    setCheckInLoadingCache(prev => ({
      ...prev,
      [eventId]: new Set(prev[eventId] || []).add(userId)
    }))

    try {
      console.log('Calling cancelEventCheckIn API...')
      const result = await cancelEventCheckIn(eventId, userId)
      console.log('Cancel check-in API result:', result)
      
      // Update check-in cache
      setCheckInCache(prev => {
        const newSet = new Set(prev[eventId] || [])
        newSet.delete(userId)
        console.log('Updated check-in cache - removed user:', userId)
        return { ...prev, [eventId]: newSet }
      })

      // Update stats
      await loadEventStats(eventId)
    } catch (error) {
      console.error('Cancel check-in failed:', error)
      // TODO: Show error toast/notification
    } finally {
      // Clear loading state
      setCheckInLoadingCache(prev => {
        const newSet = new Set(prev[eventId] || [])
        newSet.delete(userId)
        return { ...prev, [eventId]: newSet }
      })
    }
  }

  async function loadEventStats(eventId: string) {
    try {
      const stats = await getEventCheckInStats(eventId)
      setEventStatsCache(prev => ({
        ...prev,
        [eventId]: { totalConfirmed: stats.totalConfirmed, totalCheckedIn: stats.totalCheckedIn }
      }))
    } catch (error) {
      console.error('Failed to load event stats:', error)
    }
  }

  async function loadCheckInStatus(eventId: string, userIds: string[]) {
    if (userIds.length === 0) return
    
    try {
      // Check all users in parallel for better performance
      const checkInPromises = userIds.map(async userId => {
        try {
          const isCheckedIn = await isUserCheckedIn(eventId, userId)
          return { userId, isCheckedIn, error: null }
        } catch (error) {
          console.error(`Failed to check check-in status for user ${userId}:`, error)
          return { userId, isCheckedIn: false, error }
        }
      })
      
      const results = await Promise.all(checkInPromises)
      
      // Update cache with all results at once
      setCheckInCache(prev => {
        const eventSet = new Set(prev[eventId] || [])
        results.forEach(({ userId, isCheckedIn }) => {
          if (isCheckedIn) {
            eventSet.add(userId)
          } else {
            eventSet.delete(userId)
          }
        })
        return { ...prev, [eventId]: eventSet }
      })
    } catch (error) {
      console.error('Failed to load check-in status:', error)
    }
  }

  function isUserCheckedInCached(eventId: string, userId: string): boolean {
    const isCheckedIn = checkInCache[eventId]?.has(userId) || false
    console.log(`isUserCheckedInCached(${eventId}, ${userId}):`, isCheckedIn, 'Cache:', checkInCache[eventId])
    return isCheckedIn
  }

  function isUserLoadingCheckIn(eventId: string, userId: string): boolean {
    return checkInLoadingCache[eventId]?.has(userId) || false
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-textPrimary">{t('nav.events')}</h1>
          <p className="text-sm text-textSecondary mt-1">{t('searchByEvent')}</p>
        </div>

        <div className="space-y-3">
          {/* Search input for events */}
          <Card className="p-4">
            <SearchInput 
              onSearch={handleEventSearch} 
              loading={false} 
              placeholder="Pesquisar evento por título, descrição, tipo ou CEP..." 
            />
          </Card>

          {loading && <p className="text-sm text-gray-400 text-center py-10">{t('loadingData')}</p>}
          
          {eventSearchQuery && eventSearchQuery.trim() && getFilteredEvents().length === 0 && !loading && (
            <Card className="p-6 text-center">
              <p className="text-sm text-textTertiary">
                Nenhum evento encontrado para "{eventSearchQuery}"
              </p>
            </Card>
          )}
          
          {getFilteredEvents().map(e => (
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
                      <EditButton onClick={() => setEditingEvent(e)} label={t('edit')} />
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-surface/50">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <Field label={t('eventStart')} value={
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white text-xs font-semibold shadow-sm">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {fmtDate(e.startsAt)}
                        </span>
                      } />
                      <Field label={t('eventEnd')} value={
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
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1.5">{t('description')}</p>
                      <p className="text-sm text-textSecondary leading-relaxed line-clamp-3">{e.desc}</p>
                    </div>
                  )}

                  {/* ── Botão de Usuários ── */}
                  <div className="flex items-center justify-start mt-4">
                    <button
                      onClick={() => toggleEventUsers(e.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 shrink-0 ${
                        expandedEventId === e.id
                          ? 'border-blue-400 bg-blue-50 text-blue-600'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {t('confirmedUsers')} ({e.userIds?.length ?? 0})
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${expandedEventId === e.id ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Painel de Usuários ── */}
              {expandedEventId === e.id && (
                <div className="mt-4 border-t border-surfaceBorder/60 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-textTertiary uppercase tracking-wider">
                      {t('eventConfirmedUsers')}
                    </p>
                    <button
                      onClick={() => refreshEventUsers(e.id)}
                      className="p-1 rounded-lg hover:bg-surfaceHover text-textTertiary hover:text-textSecondary transition"
                      title={t('refreshList')}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>

                  {/* Search input for event users */}
                  <div className="mb-4">
                    <SearchInput 
                      onSearch={(query) => handleEventUserSearch(e.id, query)} 
                      loading={false} 
                      placeholder="Pesquisar usuário confirmado..." 
                    />
                  </div>

                  {(() => {
                    const cache = eventUsersCache[e.id]
                    if (!cache || cache.loading) {
                      return (
                        <div className="flex items-center justify-center py-6">
                          <Spinner size={5} />
                          <span className="ml-2 text-xs text-textTertiary">{t('loadingData')}</span>
                        </div>
                      )
                    }
                    if (cache.error) {
                      return <p className="text-xs text-red-400 py-3">{cache.error}</p>
                    }
                    
                    const filteredUsers = getFilteredEventUsers(e.id)
                    const searchQuery = eventUserSearchCache[e.id]
                    
                    if (cache.users.length === 0) {
                      return (
                        <p className="text-xs text-textTertiary text-center py-6">
                          {t('noConfirmedUsers')}
                        </p>
                      )
                    }
                    
                    if (searchQuery && searchQuery.trim() && filteredUsers.length === 0) {
                      return (
                        <p className="text-xs text-textTertiary text-center py-6">
                          Nenhum usuário encontrado para "{searchQuery}"
                        </p>
                      )
                    }
                    
                    return (
                      <div className="space-y-2">
                        {filteredUsers.map(eventUser => (
                          <EventUserCard 
                            key={eventUser.id} 
                            eventUser={eventUser} 
                            eventId={e.id}
                            onCheckIn={(userId) => handleCheckIn(e.id, userId)}
                            onCancelCheckIn={(userId) => handleCancelCheckIn(e.id, userId)}
                            isCheckedIn={isUserCheckedInCached(e.id, eventUser.user.id)}
                            isLoading={isUserLoadingCheckIn(e.id, eventUser.user.id)}
                          />
                        ))}
                      </div>
                    )
                  })()}
                </div>
              )}
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
