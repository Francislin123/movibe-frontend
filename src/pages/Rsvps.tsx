import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getEventRsvps, getEventRsvpDetails } from '../services/api';
import { performEventCheckIn, cancelEventCheckIn } from '../services/checkin';
import { ErrorAlert } from '../components/ui';
import type { EventRsvpDetailResponse } from '../types';

function UserStatusBadge({ isCheckedIn }: { isCheckedIn?: boolean }) {
  const { t } = useTranslation();
  const getStatusStyle = (checked: boolean) => {
    if (checked) {
      return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 border-emerald-400/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20 backdrop-blur-sm';
    }
    return 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 border-purple-400/30 shadow-[0_0_15px_rgba(124,58,237,0.1)] ring-1 ring-purple-500/20 backdrop-blur-sm';
  };

  return (
    <span className={getStatusStyle(!!isCheckedIn)}>
      <div className="relative flex items-center justify-center w-2 h-2">
        <div className={`w-2 h-2 rounded-full bg-white ${isCheckedIn ? 'animate-pulse' : ''}`} />
        {isCheckedIn && <div className="absolute inset-0 w-2 h-2 rounded-full bg-white/50 animate-ping" />}
      </div>
      {isCheckedIn ? t('userStatus.present', 'Presente') : t('userStatus.confirmed', 'Confirmado')}
    </span>
  );
}

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
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;
    isCheckedIn ? onCancelCheckIn() : onCheckIn();
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        isLoading
          ? 'bg-gray-700 cursor-not-allowed opacity-50'
          : isCheckedIn
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer'
            : 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-[0_0_15px_rgba(124,58,237,0.4)] cursor-pointer'
      }`}
    >
      {isLoading ? (
        <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isCheckedIn ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
        </svg>
      )}
    </button>
  )
}

function UserCard({ user, onCheckIn, onCancelCheckIn, isCheckedIn, isLoading }: any) {
  const initials = user.displayName?.split(" ").map((n: any) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl transition-all duration-500 border ${
        isCheckedIn
          ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.05)]'
          : 'bg-purple-500/5 border-purple-500/10'
      }`}
    >
      <div className="shrink-0 w-full sm:w-auto flex items-center gap-3">
        {user.image ? (
          <img src={user.image} alt="" className="w-11 h-11 rounded-xl object-cover ring-2 ring-purple-500/20" />
        ) : (
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
            {initials}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 w-full">
        <p className="text-sm font-bold text-white truncate">{user.displayName}</p>
        <p className="text-[10px] bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent uppercase font-semibold tracking-wider">{user.email}</p>
      </div>

      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start pt-2 sm:pt-0 border-t border-white/5 sm:border-none">
        <UserStatusBadge isCheckedIn={isCheckedIn} />
        <CheckInButton
          isCheckedIn={isCheckedIn}
          isLoading={isLoading}
          onCheckIn={() => onCheckIn(user.id)}
          onCancelCheckIn={() => onCancelCheckIn(user.id)}
        />
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

  const [checkInCache, setCheckInCache] = useState<Record<string, Set<string>>>({});
  const [loadingCache, setLoadingCache] = useState<Record<string, Set<string>>>({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getEventRsvps();
      setEvents(data);
    } catch (e) { setError(t('errors.load_events', 'Erro ao carregar eventos')); }
    finally { setLoading(false); }
  };

  const handleEventClick = async (eventId: string) => {
    try {
      const details = await getEventRsvpDetails(eventId);
      setSelectedEvent(details);

      const checkedInUserIds = details.confirmedUsers
        .filter((u: any) => u.status === 'CHECKED_IN')
        .map((u: any) => u.id);

      setCheckInCache(prev => ({
        ...prev,
        [eventId]: new Set(checkedInUserIds)
      }));
    } catch (e) { setError(t('errors.load_details', 'Erro ao carregar detalhes')); }
  };

  async function handleCheckInAction(eventId: string, userId: string, isCancelling: boolean) {
    setLoadingCache(prev => ({
      ...prev,
      [eventId]: new Set(prev[eventId] || []).add(userId)
    }));

    try {
      if (isCancelling) await cancelEventCheckIn(eventId, userId);
      else await performEventCheckIn(eventId, userId);

      setCheckInCache(prev => {
        const newSet = new Set(prev[eventId] || []);
        isCancelling ? newSet.delete(userId) : newSet.add(userId);
        return { ...prev, [eventId]: newSet };
      });

      const updated = await getEventRsvpDetails(eventId);
      setSelectedEvent(updated);

      const mainData = await getEventRsvps();
      setEvents(mainData);

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCache(prev => {
        const newSet = new Set(prev[eventId] || []);
        newSet.delete(userId);
        return { ...prev, [eventId]: newSet };
      });
    }
  }

  const isUserCheckedIn = (eventId: string, userId: string) => {
    return checkInCache[eventId]?.has(userId) || false;
  };

  const isUserLoadingCheckIn = (eventId: string, userId: string) => {
    return loadingCache[eventId]?.has(userId) || false;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-black gap-4">
      <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent animate-pulse text-sm font-black tracking-widest uppercase">
        {t('loading.sync', 'Sincronizando...')}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b0764,transparent)] pointer-events-none opacity-40" />

      {/* Conteúdo Principal */}
      <div className="relative z-10 p-8 max-w-[1600px] mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-black tracking-tighter mb-3 bg-gradient-to-r from-white via-neutral-200 to-purple-400 bg-clip-text text-transparent">
            {t('rsvps.title', 'Confirmados')}
          </h1>
          <p className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold tracking-wide">
            {t('rsvps.subtitle', 'Gestão de RSVP e fluxo de entrada em tempo real.')}
          </p>
        </header>

        {error && <ErrorAlert message={error} />}

        {/* Grid de Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              className="group relative bg-[#0f0f0f] border border-white/5 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:border-purple-500/40 hover:shadow-[0_0_40px_rgba(124,58,237,0.1)] hover:-translate-y-1"
            >
              <div className="relative h-56">
                <img src={event.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/20 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 backdrop-blur-md mb-2 inline-block">
                    {event.eventType}
                  </span>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">{event.title}</h3>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-lg font-black text-white">{event.confirmedCount}</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">{t('rsvps.confirmed_short', 'Vão')}</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-lg font-black text-emerald-400">{event.checkInCount}</p>
                    <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-tighter">{t('rsvps.checkins_short', 'Entraram')}</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-lg font-black text-blue-400">{event.attendanceRate?.toFixed(1)}%</p>
                    <p className="text-[10px] text-blue-500 uppercase font-bold tracking-tighter">{t('rsvps.rate_short', 'Taxa')}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal de Detalhes do Evento Selecionado */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div
              className="max-w-4xl w-full max-h-[92vh] overflow-y-auto rounded-3xl"
              style={{
                background: 'rgba(10, 10, 10, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(124, 58, 237, 0.15)',
                boxShadow: '0 24px 50px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Header do Modal */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{selectedEvent.title}</h2>
                  <p className="text-xs text-purple-400 mt-1">{t('modal.manage_guests', 'Gerenciamento de entrada de convidados')}</p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* IMAGEM DO EVENTO RESTAURADA */}
              <div className="px-6 pt-6">
                <div className="relative h-64 rounded-2xl overflow-hidden shadow-2xl border border-white/5">
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>
              </div>

              {/* Conteúdo Interno do Modal */}
              <div className="p-6 space-y-6">

                {/* DESCRIÇÃO DO EVENTO RESTAURADA */}
                {selectedEvent.description && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-400 mb-2">
                      {t('modal.description', 'Descrição')}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                {/* Lista de Usuários */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-gray-400 mb-4">
                    {t('modal.confirmed_users', 'Lista de Presença')} ({selectedEvent.confirmedUsers?.length || 0})
                  </h3>

                  {selectedEvent.confirmedUsers && selectedEvent.confirmedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {selectedEvent.confirmedUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          onCheckIn={(userId: string) => handleCheckInAction(selectedEvent.id, userId, false)}
                          onCancelCheckIn={(userId: string) => handleCheckInAction(selectedEvent.id, userId, true)}
                          isCheckedIn={isUserCheckedIn(selectedEvent.id, user.id)}
                          isLoading={isUserLoadingCheckIn(selectedEvent.id, user.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                      <p className="text-sm text-gray-400">{t('modal.no_users', 'Nenhum usuário confirmado para este evento.')}</p>
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