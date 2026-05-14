import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getEventRsvps, getEventRsvpDetails } from '../services/api';
import { performEventCheckIn, cancelEventCheckIn } from '../services/checkin';
import { ErrorAlert } from '../components/ui';
import type { EventRsvpDetailResponse } from '../types';

// User status badge component
function UserStatusBadge({ isCheckedIn }: { isCheckedIn?: boolean }) {
  const getStatusStyle = (isCheckedIn?: boolean) => {
    if (isCheckedIn) {
      return 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold text-white bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 border-green-400/50 shadow-lg ring-1 ring-green-500/20 backdrop-blur-sm';
    }
    return 'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold text-white bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 border-purple-400/50 shadow-lg ring-1 ring-purple-500/20 backdrop-blur-sm';
  };

  return (
    <span className={getStatusStyle(isCheckedIn)}>
      {isCheckedIn ? (
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-white/50 animate-ping" />
        </div>
      ) : (
        <div className="relative">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-white/50 animate-ping" />
        </div>
      )}
      Confirmado
    </span>
  );
}

// Check-in button component
function CheckInButton({ 
  isCheckedIn, 
  isLoading, 
  onCheckIn, 
  onCancelCheckIn 
}: { 
  isCheckedIn: boolean
  isLoading: boolean
  onCheckIn: () => void
  onCancelCheckIn: () => void
}) {
  const handleClick = () => {
    if (isLoading) return
    
    if (isCheckedIn) {
      onCancelCheckIn()
    } else {
      onCheckIn()
    }
  }

  const title = isCheckedIn ? "Cancelar check-in" : "Realizar check-in"
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      title={title}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        isLoading 
          ? 'bg-gray-700 cursor-not-allowed shadow-inner' 
          : isCheckedIn
            ? 'bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 hover:from-emerald-700 hover:via-green-700 hover:to-teal-700 cursor-pointer shadow-lg ring-2 ring-emerald-500/30 backdrop-blur-sm'
            : 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 cursor-pointer shadow-lg ring-2 ring-purple-500/30 backdrop-blur-sm'
      }`}
    >
      {isLoading ? (
        <svg className="w-4.5 h-4.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : isCheckedIn ? (
        <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </button>
  )
}

// User Card component for RSVPs
function UserCard({ user, onCheckIn, onCancelCheckIn, isCheckedIn, isLoading }: { 
  user: any; 
  onCheckIn: (userId: string) => void;
  onCancelCheckIn: (userId: string) => void;
  isCheckedIn: boolean;
  isLoading: boolean;
}) {
  const initials = user.displayName
    .split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300"
      style={{
        background: isCheckedIn ? 'rgba(16, 185, 129, 0.08)' : 'rgba(124, 58, 237, 0.06)',
        border: isCheckedIn ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(124, 58, 237, 0.1)',
        boxShadow: isCheckedIn ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
      }}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {user.image ? (
          <img 
            src={user.image} 
            alt={user.displayName} 
            className="w-10 h-10 rounded-xl object-cover ring-1 ring-blue-500/20" 
          />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{user.displayName}</p>
        <p className="text-xs text-purple-300 truncate">{user.email}</p>
      </div>

      {/* Status Badge */}
      <div className="shrink-0">
        <UserStatusBadge isCheckedIn={isCheckedIn} />
      </div>

      {/* Check-in Button */}
      <div className="shrink-0">
        <CheckInButton
          isCheckedIn={isCheckedIn}
          isLoading={isLoading}
          onCheckIn={() => onCheckIn(user.id)}
          onCancelCheckIn={() => onCancelCheckIn(user.id)}
        />
      </div>

      {/* Confirmed Date */}
      <div className="text-right shrink-0">
        <p className="text-xs text-purple-300">Confirmado em</p>
        <p className="text-sm text-purple-200">
          {new Date(user.confirmedAt).toLocaleDateString('pt-BR')}
        </p>
      </div>
    </div>
  );
}

export default function Rsvps() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<EventRsvpDetailResponse[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventRsvpDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── check-in state ─────────────────────────────────────────────────────
  const [checkInCache, setCheckInCache] = useState<Record<string, Set<string>>>({});
  const [checkInLoadingCache, setCheckInLoadingCache] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getEventRsvps();
      setEvents(data);
    } catch (e) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = async (eventId: string) => {
    try {
      const eventDetails = await getEventRsvpDetails(eventId);
      setSelectedEvent(eventDetails);
    } catch (e) {
      setError('Failed to load event details');
    }
  };

  // ── check-in functions ─────────────────────────────────────────────────────
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

      // Update selected event to refresh check-in count
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedEvent = await getEventRsvpDetails(eventId);
        setSelectedEvent(updatedEvent);
      }
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
        return { ...prev, [eventId]: newSet }
      })
      console.log('Updated check-in cache - removed user:', userId)

      // Update selected event to refresh check-in count
      if (selectedEvent && selectedEvent.id === eventId) {
        const updatedEvent = await getEventRsvpDetails(eventId);
        setSelectedEvent(updatedEvent);
      }
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

  // Helper functions
  const isUserCheckedIn = (eventId: string, userId: string) => {
    return checkInCache[eventId]?.has(userId) || false
  }

  const isUserLoadingCheckIn = (eventId: string, userId: string) => {
    return checkInLoadingCache[eventId]?.has(userId) || false
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
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#000000' }}>
      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(124, 58, 237, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 40%)',
          opacity: 1,
        }}
      />

      {/* Purple glow effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(124, 58, 237, 0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-4xl font-bold text-white mb-2" 
            style={{ 
              textShadow: '0 0 30px rgba(124, 58, 237, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)'
            }}
          >
            Confirmados
          </h1>
          <p 
            className="text-lg text-purple-300" 
            style={{ 
              textShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
            }}
          >
            Confirmações de presença — ordenadas por data (DESC)
          </p>
        </div>

        {error && <ErrorAlert message={error} />}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'rgba(124, 58, 237, 0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(124, 58, 237, 0.12)',
                boxShadow: '0 8px 32px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.06)',
              }}
              onClick={() => handleEventClick(event.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.border = '1px solid rgba(124, 58, 237, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.border = '1px solid rgba(124, 58, 237, 0.12)';
              }}
            >
              {/* Event Image */}
              <div className="relative h-48 mb-4 rounded-xl overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-bold text-lg line-clamp-2">{event.title}</h3>
                </div>
              </div>

              {/* Event Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{
                      background: 'rgba(124, 58, 237, 0.12)',
                      border: '1px solid rgba(124, 58, 237, 0.18)',
                      color: '#A1A1AA'
                    }}
                  >
                    {event.eventType}
                  </span>
                  <span className="text-xs text-purple-300">
                    {new Date(event.startsAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div 
                    className="rounded-lg p-3"
                    style={{
                      background: 'rgba(124, 58, 237, 0.06)',
                      border: '1px solid rgba(124, 58, 237, 0.1)'
                    }}
                  >
                    <p className="text-xl font-bold text-white">{event.confirmedCount}</p>
                    <p className="text-xs text-purple-300">Confirmados</p>
                  </div>
                  <div 
                    className="rounded-lg p-3"
                    style={{
                      background: 'rgba(16, 185, 129, 0.06)',
                      border: '1px solid rgba(16, 185, 129, 0.1)'
                    }}
                  >
                    <p className="text-xl font-bold text-green-400">{event.checkInCount}</p>
                    <p className="text-xs text-green-300">Check-ins</p>
                  </div>
                  <div 
                    className="rounded-lg p-3"
                    style={{
                      background: 'rgba(59, 130, 246, 0.06)',
                      border: '1px solid rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    <p className="text-xl font-bold text-blue-400">{event.attendanceRate.toFixed(1)}%</p>
                    <p className="text-xs text-blue-300">Taxa</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Event Details Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 pl-64">
            <div 
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl"
              style={{
                background: 'rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                boxShadow: '0 24px 48px rgba(124, 58, 237, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* Modal Header */}
              <div 
                className="p-6 border-b"
                style={{ borderColor: 'rgba(124, 58, 237, 0.1)' }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">{selectedEvent.title}</h2>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-purple-300 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Event Image */}
                <div className="relative h-64 rounded-xl overflow-hidden">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Métricas</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className="rounded-xl p-4 text-center"
                      style={{
                        background: 'rgba(124, 58, 237, 0.1)',
                        border: '1px solid rgba(124, 58, 237, 0.2)'
                      }}
                    >
                      <p className="text-2xl font-bold text-purple-400">{selectedEvent.confirmedCount}</p>
                      <p className="text-sm text-purple-300">Confirmados</p>
                    </div>
                    <div 
                      className="rounded-xl p-4 text-center"
                      style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)'
                      }}
                    >
                      <p className="text-2xl font-bold text-green-400">{selectedEvent.checkInCount}</p>
                      <p className="text-sm text-green-300">Check-ins</p>
                    </div>
                    <div 
                      className="rounded-xl p-4 text-center"
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}
                    >
                      <p className="text-2xl font-bold text-blue-400">{selectedEvent.attendanceRate.toFixed(1)}%</p>
                      <p className="text-sm text-blue-300">Taxa</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Descrição</h3>
                  <p className="text-purple-200 leading-relaxed">{selectedEvent.description}</p>
                </div>

                {/* Confirmed Users */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Usuários Confirmados ({selectedEvent.confirmedUsers.length})
                  </h3>
                  {selectedEvent.confirmedUsers.length > 0 ? (
                    <div className="space-y-2">
                      {selectedEvent.confirmedUsers.map((user) => (
                        <UserCard 
                          key={user.id} 
                          user={user}
                          onCheckIn={(userId) => handleCheckIn(selectedEvent.id, userId)}
                          onCancelCheckIn={(userId) => handleCancelCheckIn(selectedEvent.id, userId)}
                          isCheckedIn={isUserCheckedIn(selectedEvent.id, user.id)}
                          isLoading={isUserLoadingCheckIn(selectedEvent.id, user.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="text-center py-12 rounded-xl"
                      style={{
                        background: 'rgba(124, 58, 237, 0.04)',
                        border: '1px solid rgba(124, 58, 237, 0.08)'
                      }}
                    >
                      <p className="text-purple-300">Nenhum usuário confirmado ainda</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
