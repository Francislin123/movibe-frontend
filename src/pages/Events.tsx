import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getEvents, searchEvents, getEventUsers } from '../services/api'
import { performEventCheckIn, cancelEventCheckIn, isUserCheckedIn, getEventCheckInStats } from '../services/checkin'
import { Card, EventTypeBadge, Spinner } from '../components/ui'
import SearchInput from '../components/SearchInput'
import EntityImage from '../components/EntityImage'
import EventEditModal from '../components/EventEditModal'
import EventUserCard from '../components/EventUserCard'
import type { EventResponse, EventUserResponse, ApiError } from '../types'

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-surfaceBorder hover:border-violet-500/30 text-textSecondary hover:text-violet-500 text-xs font-medium transition-all duration-150 w-full md:w-auto active:scale-95"
      title={label}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span>{label}</span>
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

function getGoogleMapsUrl(balada: any): string {
  if (!balada) return '#'
  
  // Try to use structured address fields first
  const logradouro = balada.logradouro || balada.local || ''
  const numero = balada.numero || balada.numb || ''
  const bairro = balada.bairro || ''
  const localidade = balada.localidade || balada.city || ''
  const uf = balada.uf || balada.state || ''
  
  // Build address string
  const addressParts = []
  if (logradouro) addressParts.push(logradouro)
  if (numero) addressParts.push(numero)
  if (bairro) addressParts.push(bairro)
  if (localidade) addressParts.push(localidade)
  if (uf) addressParts.push(uf)
  
  const address = addressParts.join(', ')
  
  if (!address) return '#'
  
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

function formatBaladaLocation(balada: any): string {
  if (!balada) return ''
  
  // Try to use structured address fields first
  const localidade = balada.localidade || balada.city || ''
  const uf = balada.uf || balada.state || ''
  
  if (localidade && uf) {
    return `${localidade} - ${uf}`
  }
  
  // Fallback to old local field
  if (balada.local) {
    return balada.local
  }
  
  return ''
}

export default function Events() {
  const { t } = useTranslation()
  const [events, setEvents] = useState<EventResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null)

  const [expandedEventId, setExpandedEventId] = useState<string | null>(null)
  const [eventUsersCache, setEventUsersCache] = useState<Record<string, { loading: boolean; users: EventUserResponse[]; error: string | null }>>({})
  const [eventUserSearchCache, setEventUserSearchCache] = useState<Record<string, string>>({})
  const [checkInStatusCache, setCheckInStatusCache] = useState<Record<string, Record<string, { isCheckedIn: boolean; loading: boolean }>>>({})
  const [statsCache, setStatsCache] = useState<Record<string, { totalCheckIns: number; loading: boolean }>>({})

  // Calcula o total de usuários ÚNICOS combinando todos os eventos sem repetições
  const totalGlobalUsers = Object.values(eventUsersCache).reduce((uniqueIds, curr) => {
    if (curr?.users) {
      curr.users.forEach(eu => {
        if (eu.user?.id) {
          uniqueIds.add(eu.user.id)
        }
      })
    }
    return uniqueIds;
  }, new Set<string>()).size

  function load(query?: string) {
    setLoading(true)
    const promise = query && query.trim() ? searchEvents(query.trim()) : getEvents()
    promise
      .then(setEvents)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  // useEffect para buscar a contagem total de usuários em segundo plano assim que a lista de eventos carregar
  useEffect(() => {
    if (events.length === 0) return

    events.forEach(e => {
      if (eventUsersCache[e.id]?.users && eventUsersCache[e.id].users.length > 0) return

      getEventUsers(e.id)
        .then(users => {
          setEventUsersCache(prev => ({
            ...prev,
            [e.id]: { loading: false, users, error: null }
          }))
        })
        .catch(() => {
          setEventUsersCache(prev => ({
            ...prev,
            [e.id]: { loading: false, users: [], error: null }
          }))
        })
    })
  }, [events])

  function handleSearch(query: string) {
    load(query)
  }

  async function loadStats(eventId: string) {
    setStatsCache(prev => ({
      ...prev,
      [eventId]: { ...prev[eventId], loading: true }
    }))
    try {
      const stats = await getEventCheckInStats(eventId)
      setStatsCache(prev => ({
        ...prev,
        [eventId]: { totalCheckIns: stats.totalCheckedIn, loading: false }
      }))
    } catch {
      setStatsCache(prev => ({
        ...prev,
        [eventId]: { totalCheckIns: 0, loading: false }
      }))
    }
  }

  async function toggleEventUsers(eventId: string) {
    if (expandedEventId === eventId) {
      setExpandedEventId(null)
      return
    }
    setExpandedEventId(eventId)
    loadStats(eventId)

    setEventUsersCache(prev => {
      const entry = prev[eventId]

      if (entry && entry.users.length > 0) {
        const statusMap: Record<string, { isCheckedIn: boolean; loading: boolean }> = {}
        Promise.all(entry.users.map(async (u) => {
          try {
            const checked = await isUserCheckedIn(eventId, u.user.id)
            statusMap[u.user.id] = { isCheckedIn: checked, loading: false }
          } catch {
            statusMap[u.user.id] = { isCheckedIn: false, loading: false }
          }
        })).then(() => {
          setCheckInStatusCache(prevStatus => ({ ...prevStatus, [eventId]: statusMap }))
        })
        return prev
      }

      getEventUsers(eventId)
        .then(async (users) => {
          setEventUsersCache(c => ({ ...c, [eventId]: { loading: false, users, error: null } }))

          const statusMap: Record<string, { isCheckedIn: boolean; loading: boolean }> = {}
          for (const u of users) {
            try {
              const checked = await isUserCheckedIn(eventId, u.user.id)
              statusMap[u.user.id] = { isCheckedIn: checked, loading: false }
            } catch {
              statusMap[u.user.id] = { isCheckedIn: false, loading: false }
            }
          }
          setCheckInStatusCache(prevStatus => ({ ...prevStatus, [eventId]: statusMap }))
        })
        .catch(e => setEventUsersCache(c => ({ ...c, [eventId]: { loading: false, users: [], error: (e as ApiError).message } })))

      return { ...prev, [eventId]: { loading: true, users: [], error: null } }
    })
  }

  function refreshEventUsers(eventId: string) {
    setEventUsersCache(c => ({ ...c, [eventId]: { loading: true, users: [], error: null } }))
    loadStats(eventId)
    getEventUsers(eventId)
      .then(async (users) => {
        setEventUsersCache(c => ({ ...c, [eventId]: { loading: false, users, error: null } }))
        const statusMap: Record<string, { isCheckedIn: boolean; loading: boolean }> = {}
        for (const u of users) {
          try {
            const checked = await isUserCheckedIn(eventId, u.user.id)
            statusMap[u.user.id] = { isCheckedIn: checked, loading: false }
          } catch {
            statusMap[u.user.id] = { isCheckedIn: false, loading: false }
          }
        }
        setCheckInStatusCache(prevStatus => ({
          ...prevStatus,
          [eventId]: statusMap
        }))
      })
      .catch(e => setEventUsersCache(c => ({ ...c, [eventId]: { loading: false, users: [], error: (e as ApiError).message } })))
  }

  function handleEventUserSearch(eventId: string, query: string) {
    setEventUserSearchCache(prev => ({ ...prev, [eventId]: query }))
  }

  function getFilteredEventUsers(eventId: string): EventUserResponse[] {
    const cache = eventUsersCache[eventId]
    if (!cache || !cache.users) return []
    const searchQuery = eventUserSearchCache[eventId]
    if (!searchQuery || !searchQuery.trim()) return cache.users
    const searchLower = searchQuery.toLowerCase()
    return cache.users.filter(eu => {
      const user = eu.user as any
      const nameMatch = user.name?.toLowerCase().includes(searchLower) || user.fullName?.toLowerCase().includes(searchLower)
      const emailMatch = user.email?.toLowerCase().includes(searchLower)
      return nameMatch || emailMatch
    })
  }

  async function handleCheckIn(eventId: string, userId: string) {
    setCheckInStatusCache(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [userId]: { ...prev[eventId]?.[userId], loading: true }
      }
    }))
    try {
      await performEventCheckIn(eventId, userId)
      setCheckInStatusCache(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          [userId]: { isCheckedIn: true, loading: false }
        }
      }))
      loadStats(eventId)
    } catch (err) {
      alert((err as ApiError).message || 'Erro ao realizar check-in')
      setCheckInStatusCache(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          [userId]: { ...prev[eventId]?.[userId], loading: false }
        }
      }))
    }
  }

  async function handleCancelCheckIn(eventId: string, userId: string) {
    setCheckInStatusCache(prev => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        [userId]: { ...prev[eventId]?.[userId], loading: true }
      }
    }))
    try {
      await cancelEventCheckIn(eventId, userId)
      setCheckInStatusCache(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          [userId]: { isCheckedIn: false, loading: false }
        }
      }))
      loadStats(eventId)
    } catch (err) {
      alert((err as ApiError).message || t('checkIn.cancelError'))
      setCheckInStatusCache(prev => ({
        ...prev,
        [eventId]: {
          ...prev[eventId],
          [userId]: { ...prev[eventId]?.[userId], loading: false }
        }
      }))
    }
  }

  function isUserCheckedInCached(eventId: string, userId: string): boolean {
    return checkInStatusCache[eventId]?.[userId]?.isCheckedIn ?? false
  }

  function isUserLoadingCheckIn(eventId: string, userId: string): boolean {
    return checkInStatusCache[eventId]?.[userId]?.loading ?? false
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto space-y-6 px-2 sm:px-4 lg:px-6">
        {/* Header com os Indicadores de Contagem */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-textPrimary tracking-tight">{t('nav.events')}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col sm:items-end">
              <span className="text-xs text-textTertiary font-medium uppercase tracking-wider">Eventos</span>
              <span className="text-lg font-bold text-textPrimary">
                {events.length} <span className="text-xs font-normal text-textSecondary">ativos</span>
              </span>
            </div>
            <div className="h-8 w-px bg-surfaceBorder/60 hidden sm:block" />
            <div className="flex flex-col sm:items-end">
              <span className="text-xs text-textTertiary font-medium uppercase tracking-wider">{t('nav.users')}</span>
              <span className="text-lg font-bold text-amber-500">
                {totalGlobalUsers} <span className="text-xs font-normal text-textSecondary">{t('confirmedUsers')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Caixa de Pesquisa */}
        <Card className="p-4 shadow-sm border border-surfaceBorder">
          <SearchInput
            onSearch={handleSearch}
            loading={loading}
            placeholder={t('search')}
          />
        </Card>

        {/* Grid de Eventos */}
        <div className="space-y-4">
          {loading && (
            <div className="flex justify-center py-12">
              <p className="text-sm text-gray-400 font-medium">{t('loadingData')}</p>
            </div>
          )}
          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">{error}</div>}
          {!loading && !error && events.length === 0 && (
            <div className="text-center py-12 text-sm text-textTertiary">{t('noEntity', { entity: t('nav.events') })}</div>
          )}

          {!loading && !error && events.map(e => {
            const eventAny = e as any;
            const cachedUsersCount = eventUsersCache[e.id]?.users?.length;
            const usersCountString = cachedUsersCount !== undefined ? `${cachedUsersCount}` : '0';

            return (
              <Card
                key={e.id}
                className="flex flex-col p-4 sm:p-5 transition-all duration-300 border border-surfaceBorder hover:border-primary/40 bg-gradient-to-br from-surface to-surface/90"
                style={{
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(254, 254, 254, 0.02)'
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  {/* Bloco de Identificação */}
                  <div className="md:col-span-4 flex flex-row items-start gap-3 sm:gap-4 min-w-0">
                    <EntityImage
                      image={e.image}
                      name={e.title}
                      size="md"
                      fallback={
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shrink-0">
                          <span className="text-lg sm:text-xl font-bold">{e.title.charAt(0).toUpperCase()}</span>
                        </div>
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-textPrimary text-base sm:text-lg truncate">{e.title}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <EventTypeBadge type={e.type} />
                      </div>
                    </div>
                  </div>

                  {/* Bloco das Informações Gerais */}
                  <div className="md:col-span-8 p-3 rounded-xl border border-surfaceBorder/60 bg-surface/40 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
                      <div className="flex flex-col gap-0.5 md:border-r border-surfaceBorder/30 md:pr-2">
                        <span className="text-[11px] font-medium text-textTertiary uppercase tracking-wider">{t('startsAt')}</span>
                        <span className="text-xs font-semibold text-textPrimary truncate">{fmtDate(e.startsAt)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 md:border-r border-surfaceBorder/30 md:pr-2">
                        <span className="text-[11px] font-medium text-textTertiary uppercase tracking-wider">{t('endsAt')}</span>
                        <span className="text-xs font-semibold text-textPrimary truncate">{fmtDate(e.endsAt)}</span>
                      </div>
                      <div className="flex flex-col gap-0.5 md:border-r border-surfaceBorder/30 md:pr-2">
                        <span className="text-[11px] font-medium text-textTertiary uppercase tracking-wider">{t('cep')}</span>
                        <span className="text-xs font-mono text-textSecondary truncate">{eventAny.cep || '—'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-medium text-textTertiary uppercase tracking-wider">{t('balada')}</span>
                        {eventAny.hostBalada ? (
                          <>
                            <a
                              href={getGoogleMapsUrl(eventAny.hostBalada)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-primary truncate hover:text-purple-300 transition-all duration-300 cursor-pointer flex items-center gap-1"
                              title={`${eventAny.hostBalada.tradeName} • ${formatBaladaLocation(eventAny.hostBalada)} - ${t('event.view_on_map')}`}
                            >
                              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{eventAny.hostBalada.tradeName}</span>
                            </a>
                            {formatBaladaLocation(eventAny.hostBalada) && (
                              <a
                                href={getGoogleMapsUrl(eventAny.hostBalada)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-purple-400 hover:text-purple-300 transition-all duration-300 cursor-pointer truncate flex items-center gap-1"
                                title={`${formatBaladaLocation(eventAny.hostBalada)} - ${t('event.view_on_map')}`}
                              >
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">{formatBaladaLocation(eventAny.hostBalada)}</span>
                              </a>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-primary truncate">
                            {eventAny.hostBaladaName || '—'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                {eventAny.desc && (
                  <div className="mt-4 p-3 rounded-xl bg-primary/5 border-l-2 border-primary w-full">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{t('description')}</p>
                    <p className="text-xs text-textSecondary leading-relaxed">{eventAny.desc}</p>
                  </div>
                )}

                {/* Endereço */}
                {(eventAny.local || eventAny.formattedAddress) && (
                  <div className="mt-2 p-3 rounded-xl bg-surfaceHover/40 border-l-2 border-textTertiary w-full">
                    <p className="text-xs font-semibold text-textTertiary uppercase tracking-wider mb-1">{t('address')}</p>
                    <p className="text-xs text-textSecondary leading-relaxed">{eventAny.local || eventAny.formattedAddress}</p>
                  </div>
                )}

                {/* Rodapé de Ações do Card */}
                <div className="flex flex-wrap md:flex-row items-center justify-end mt-4 gap-2 pt-2 border-t border-surfaceBorder/40 w-full">

                  {/* Botão atualizado para exibir "Lista" */}
                  <button
                    type="button"
                    onClick={() => toggleEventUsers(e.id)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 flex-1 md:flex-initial ${
                      expandedEventId === e.id
                        ? 'border-amber-400 bg-amber-50/10 text-amber-500'
                        : 'border-surfaceBorder hover:border-amber-500/30 text-textSecondary hover:text-amber-500'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
                    </svg>
                    <span className="truncate">
                      Lista ({usersCountString})
                    </span>
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 shrink-0 ${expandedEventId === e.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <div className="w-full md:w-auto flex-1 md:flex-none">
                    <EditButton onClick={() => setEditingEvent(e)} label={t('edit')} />
                  </div>
                </div>

                {/* Sub-painel Expandível de Presenças / Usuários */}
                {expandedEventId === e.id && (
                  <div className="mt-4 border-t border-surfaceBorder/60 pt-3 space-y-3 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-semibold text-textTertiary uppercase tracking-wider">
                          {t('eventConfirmedUsers')}
                        </p>
                        {statsCache[e.id]?.loading ? (
                          <Spinner size={3} />
                        ) : (
                          <span className="text-[11px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded-md">
                            {statsCache[e.id]?.totalCheckIns ?? 0} {t('checkIns')}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => refreshEventUsers(e.id)}
                        className="p-1 rounded-lg hover:bg-surfaceHover text-textTertiary transition self-end sm:self-auto"
                        title={t('refreshList')}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>

                    <div className="p-1">
                      <SearchInput
                        onSearch={(query) => handleEventUserSearch(e.id, query)}
                        loading={false}
                        placeholder={t('searchBy')}
                      />
                    </div>

                    {(() => {
                      const cache = eventUsersCache[e.id]
                      if (!cache || cache.loading) {
                        return (
                          <div className="flex items-center justify-center py-6 gap-2">
                            <Spinner size={4} />
                            <span className="text-xs text-textTertiary">{t('loadingData')}</span>
                          </div>
                        )
                      }
                      if (cache.error) {
                        return <p className="text-xs text-red-400 py-3">{cache.error}</p>
                      }

                      const searchQuery = eventUserSearchCache[e.id]
                      const filteredUsers = getFilteredEventUsers(e.id)

                      if (searchQuery && searchQuery.trim() && filteredUsers.length === 0) {
                        return (
                          <p className="text-xs text-textTertiary text-center py-6">
                            {t('noEntity', { entity: t('nav.users') })}
                          </p>
                        )
                      }

                      return (
                        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 subtle-scrollbar">
                          {filteredUsers.map(eventUser => (
                            <EventUserCard
                              key={eventUser.id}
                              eventUser={eventUser}
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
            );
          })}
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