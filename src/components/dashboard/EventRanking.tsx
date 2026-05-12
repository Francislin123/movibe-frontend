import type { EventRankingResponse } from '../../types'
import EntityImage from '../EntityImage'

interface EventRankingProps {
  events: EventRankingResponse[]
  loading?: boolean
}

export default function EventRanking({ events, loading = false }: EventRankingProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Eventos Mais Confirmados</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!events || events.length === 0) {
    return (
      <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Eventos Mais Confirmados</h3>
        <div className="text-center py-8 text-textTertiary">
          Nenhum evento encontrado
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-surface to-surface/80 rounded-2xl p-6 border border-surfaceBorder shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Eventos Mais Confirmados</h3>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div 
            key={event.id} 
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-surfaceBorder/50 transition-all duration-200 cursor-pointer"
          >
            <div className="relative">
              <EntityImage
                image={event.image}
                name={event.title}
                size="lg"
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                {index + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-semibold truncate">{event.title}</h4>
              <div className="flex items-center gap-4 mt-1 text-sm">
                <span className="text-textTertiary">
                  {event.confirmedCount} confirmados
                </span>
                <span className="text-emerald-400">
                  {event.checkInCount} presentes
                </span>
                <span className="text-purple-400">
                  {event.attendanceRate.toFixed(1)}% comparecimento
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-textTertiary">
                {new Date(event.eventDate).toLocaleDateString('pt-BR')}
              </div>
              <div className="text-xs text-purple-400 mt-1">
                {event.eventType}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
