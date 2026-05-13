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
    image: string;
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
      <div className="mb-6">
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
      <div className="space-y-4">
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
                hover:scale-[1.02]
              `}
              style={{
                animation: `fadeIn 0.4s ease-out ${index * 80}ms both`,
              }}
            >
              {/* Ranking */}
              <div className="absolute top-4 left-4 z-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: badge.color,
                    color: badge.text === '1º' ? '#000' : '#fff',
                    boxShadow: `0 0 20px ${badge.color}40`,
                  }}
                >
                  {badge.text}
                </div>
              </div>

              {/* Content */}
              <div className="flex gap-4 ml-12">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-20 h-20 rounded-xl object-cover transition-transform duration-300 group-hover:scale-105"
                  style={{ boxShadow: purpleShadows.button }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3
                      className="text-lg font-semibold text-white truncate pr-2"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                    >
                      {event.title}
                    </h3>

                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: purpleGlassmorphism.medium.background,
                        border: `1px solid ${colors.purple.DEFAULT}40`,
                        color: colors.text.secondary,
                      }}
                    >
                      {event.type}
                    </span>
                  </div>

                  <div className="flex gap-4 text-sm mt-2">
                    <span style={{ color: colors.text.secondary }}>
                      {event.confirmedCount} confirmados
                    </span>
                    <span style={{ color: colors.text.secondary }}>
                      {event.checkInCount} check-ins
                    </span>
                  </div>

                  <div
                    className="text-xs mt-1 opacity-60"
                    style={{ color: colors.text.secondary }}
                  >
                    {new Date(event.eventDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
        style={{
          background: purpleGradients.background.mesh,
        }}
      />

      {/* Animations globais seguras */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}