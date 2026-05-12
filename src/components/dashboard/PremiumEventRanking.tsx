import React from 'react';
import { colors, purpleGlassmorphism, purpleGradients, purpleShadows } from '../../styles/purple-design-system';

interface PremiumEventRankingProps {
  events: Array<{
    id: string
    title: string
    image: string
    type: string
    confirmedCount: number
    checkInCount: number
    eventDate: string
  }>
  title?: string
  maxItems?: number
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
        transition-all duration-500
      `}
    >
      {/* Header with enhanced typography */}
      <div className="mb-6">
        <h2 
          className="text-2xl font-bold tracking-tight mb-2"
          style={{ 
            color: colors.text.primary,
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          {title}
        </h2>
        
        {/* Subtle underline effect */}
        <div 
          className="relative h-px w-full opacity-30"
          style={{ 
            background: purpleGradients.primary,
          }}
        />
      </div>

      {/* Event list with premium design */}
      <div className="space-y-4">
        {events.slice(0, maxItems).map((event, index) => {
          const badge = getRankingBadge(index);
          const rankingNumber = index + 1;
          
          return (
            <div 
              key={event.id}
              className={`
                relative group overflow-hidden rounded-xl p-4
                ${purpleGlassmorphism.medium.background}
                ${purpleGlassmorphism.medium.backdropFilter}
                ${purpleGlassmorphism.medium.border}
                ${purpleShadows.card}
                hover:${purpleShadows.cardHover}
                transition-all duration-300
                hover:scale-[1.02]
                hover:border-purple-500/20
                before:absolute before:inset-0 before:rounded-xl
                before:bg-gradient-to-br before:from-purple-600/5 before:to-violet-600/10
                before:opacity-0 before:transition-opacity before:duration-300
                hover:before:opacity-100
              `}
              style={{
                animation: 'fadeIn 0.5s ease-out',
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Ranking badge with glow */}
              <div className="absolute top-4 left-4 z-20">
                <div 
                  className={`
                    relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
                    transition-all duration-300
                    group-hover:scale-110
                  `}
                  style={{
                    background: badge.color,
                    color: badge.text === '1º' ? '#000' : '#FFF',
                    boxShadow: `0 0 20px ${badge.color}40`,
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                >
                  {badge.text}
                </div>
                
                {/* Glow effect on badge */}
                <div 
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: `0 0 30px ${badge.color}60`,
                  }}
                />
              </div>

              {/* Event image with enhanced hover */}
              <div className="flex gap-4">
                <div className="relative flex-shrink-0">
                  <img 
                    src={event.image} 
                    alt={event.title}
                    className={`
                      w-20 h-20 rounded-xl object-cover
                      transition-all duration-300
                      group-hover:scale-110
                      group-hover:shadow-2xl
                    `}
                    style={{
                      boxShadow: purpleShadows.button,
                    }}
                  />
                  
                  {/* Image overlay on hover */}
                  <div 
                    className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                    style={{
                      background: purpleGradients.primary,
                    }}
                  />
                </div>

                {/* Event information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 
                      className="text-lg font-semibold text-white truncate pr-2"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                      }}
                    >
                      {event.title}
                    </h3>
                    
                    {/* Event type badge */}
                    <div 
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: purpleGlassmorphism.medium.background,
                        backdropFilter: purpleGlassmorphism.medium.backdropFilter,
                        border: `1px solid ${colors.purple.DEFAULT}40`,
                        color: colors.text.secondary,
                      }}
                    >
                      {event.type}
                    </div>
                  </div>

                  {/* Metrics row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: '#10B981',
                          boxShadow: '0 0 8px #10B98140',
                        }}
                      />
                      <span style={{ color: colors.text.secondary }}>
                        {event.confirmedCount} confirmados
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: '#3B82F6',
                          boxShadow: '0 0 8px #3B82F640',
                        }}
                      />
                      <span style={{ color: colors.text.secondary }}>
                        {event.checkInCount} check-ins
                      </span>
                    </div>
                  </div>

                  {/* Event date */}
                  <div 
                    className="text-xs font-medium opacity-60"
                    style={{ 
                      color: colors.text.secondary,
                    }}
                  >
                    {new Date(event.eventDate).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Interactive hover overlay */}
              <div 
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
        style={{
          background: purpleGradients.background.mesh,
          boxShadow: purpleGlassmorphism.glow.subtle,
        }}
      />
    </div>
  );
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
