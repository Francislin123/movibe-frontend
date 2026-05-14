import {
  colors,
  purpleGlassmorphism,
  purpleGradients,
  purpleShadows
} from '../../styles/purple-design-system';

interface PremiumEventRankingProps {
  events: Array<{
    id: string;
    title: string;
    image?: string; // Alterado para opcional
    type: string;
    confirmedCount: number;
    checkInCount: number;
    eventDate: string;
  }>;
  title?: string;
  maxItems?: number;
}

export default function PremiumEventRanking({
  events,
  title = "Top Eventos",
  maxItems = 10
}: PremiumEventRankingProps) {

  const getRankingBadge = (index: number) => {
    if (index === 0) return { color: '#FFD700', text: '1º' };
    if (index === 1) return { color: '#C0C0C0', text: '2º' };
    if (index === 2) return { color: '#CD7F32', text: '3º' };
    return { color: colors.text.secondary, text: `${index + 1}º` };
  };

  // Função para formatar data com segurança
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-6
        ${purpleGlassmorphism.light.background}
        ${purpleGlassmorphism.light.backdropFilter}
        ${purpleGlassmorphism.light.border}
        ${purpleShadows.card}
      `}
    >
      {/* Header */}
      <div className="relative z-10 mb-6">
        <h2
          className="text-2xl font-bold tracking-tight mb-2"
          style={{ color: colors.text.primary }}
        >
          {title}
        </h2>

        <div
          className="h-px w-full opacity-30"
          style={{ background: purpleGradients.primary }}
        />
      </div>

      {/* List */}
      <div className="relative z-10 space-y-4">
        {events.slice(0, maxItems).map((event, index) => {
          const badge = getRankingBadge(index);

          return (
            <div
              key={event.id}
              className={`
                relative group overflow-hidden rounded-xl p-4
                ${purpleGlassmorphism.medium.background}
                ${purpleGlassmorphism.medium.backdropFilter}
                ${purpleGlassmorphism.medium.border}
                ${purpleShadows.card}
                transition-all duration-300
                hover:scale-[1.01]
              `}
              style={{
                animation: `fadeIn 0.4s ease-out ${index * 80}ms both`,
              }}
            >
              {/* Ranking Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
                  style={{
                    background: badge.color,
                    color: index < 3 ? '#000' : '#fff',
                    boxShadow: `0 0 15px ${badge.color}30`,
                  }}
                >
                  {badge.text}
                </div>
              </div>

              {/* Content */}
              <div className="flex gap-4 ml-12">
                <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-surface/50 border border-surfaceBorder/30">
                  {event.image ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🎉
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-lg font-bold text-white truncate group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>

                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0"
                      style={{
                        background: `${colors.purple.DEFAULT}20`,
                        border: `1px solid ${colors.purple.DEFAULT}40`,
                        color: colors.purple.light || '#A78BFA',
                      }}
                    >
                      {event.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1.5 font-medium">
                    <div className="flex items-center gap-1.5" style={{ color: colors.text.secondary }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {event.confirmedCount} confirmados
                    </div>
                    <div className="flex items-center gap-1.5" style={{ color: colors.text.secondary }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {event.checkInCount} check-ins
                    </div>
                  </div>

                  <div className="text-xs mt-2 font-medium opacity-50 flex items-center gap-1 text-textTertiary">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(event.eventDate)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Decorative Glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-10 pointer-events-none"
        style={{ background: purpleGradients.background.mesh }}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}