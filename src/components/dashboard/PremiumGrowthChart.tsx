import React from 'react';
import { colors, purpleGlassmorphism, purpleGradients, purpleShadows } from '../../styles/purple-design-system';

interface PremiumGrowthChartProps {
  data: Array<{
    date: string
    users: number
    events: number
    rsvps: number
    checkIns: number
  }>
  metrics: ('users' | 'events' | 'rsvps' | 'checkIns')[]
  title: string
  subtitle?: string
  height?: number
}

export default function PremiumGrowthChart({ 
  data, 
  metrics, 
  title, 
  subtitle,
  height = 300 
}: PremiumGrowthChartProps) {
  
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'users': return colors.purple.DEFAULT;
      case 'events': return '#10B981';
      case 'rsvps': return '#F59E0B';
      case 'checkIns': return '#3B82F6';
      default: return colors.purple.DEFAULT;
    }
  };

  const getMetricGradient = (metric: string) => {
    switch (metric) {
      case 'users': return purpleGradients.primary;
      case 'events': return 'linear-gradient(135deg, #10B981 0%, #34D399 100%)';
      case 'rsvps': return 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)';
      case 'checkIns': return 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)';
      default: return purpleGradients.primary;
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
        transition-all duration-500
        hover:border-purple-500/20
      `}
      style={{
        height: `${height}px`,
      }}
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
        {subtitle && (
          <p 
            className="text-sm font-medium opacity-80"
            style={{ 
              color: colors.text.secondary,
              letterSpacing: '0.025em',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Chart container with glassmorphism */}
      <div 
        className={`
          relative h-full rounded-xl p-4
          ${purpleGlassmorphism.medium.background}
          ${purpleGlassmorphism.medium.backdropFilter}
          ${purpleGlassmorphism.medium.border}
          transition-all duration-300
        `}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full" style={{ opacity: 0.1 }}>
            <defs>
              <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.purple.DEFAULT} stopOpacity="0.1" />
                <stop offset="100%" stopColor={colors.purple.DEFAULT} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="url(#gridGradient)" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Data visualization */}
        <div className="relative h-full flex items-end justify-between gap-2">
          {data.map((item, index) => {
            const maxValue = Math.max(
              ...metrics.map(metric => item[metric as keyof typeof item] as number)
            );
            
            return (
              <div 
                key={index}
                className="flex-1 flex flex-col items-center gap-1 group"
                style={{
                  animation: 'slideUp 0.5s ease-out',
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {/* Bars for each metric */}
                {metrics.map((metric, metricIndex) => {
                  const value = item[metric as keyof typeof item] as number;
                  const percentage = (value / maxValue) * 100;
                  
                  return (
                    <div 
                      key={metricIndex}
                      className="relative w-full flex flex-col items-center"
                    >
                      {/* Bar */}
                      <div 
                        className={`
                          w-full rounded-t-lg transition-all duration-300
                          group-hover:scale-y-110
                        `}
                        style={{
                          height: `${(percentage / 100) * (height - 60)}px`,
                          background: getMetricGradient(metric),
                          boxShadow: `0 -4px 12px ${getMetricColor(metric)}40`,
                          transformOrigin: 'bottom',
                        }}
                      />
                      
                      {/* Glow effect on hover */}
                      <div 
                        className="absolute inset-0 rounded-t-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{
                          background: `linear-gradient(to top, ${getMetricColor(metric)}40, transparent)`,
                          boxShadow: `0 -4px 20px ${getMetricColor(metric)}60`,
                        }}
                      />
                      
                      {/* Value label */}
                      <div 
                        className="mt-2 text-xs font-semibold opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        style={{ 
                          color: colors.text.secondary,
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  );
                })}
                
                {/* Date label */}
                <div 
                  className="text-xs font-medium opacity-60"
                  style={{ 
                    color: colors.text.secondary,
                    marginTop: '4px',
                  }}
                >
                  {new Date(item.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Animated gradient overlay */}
        <div 
          className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
          style={{
            background: purpleGradients.animated.pulse,
            animation: 'pulse 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        {metrics.map((metric, index) => (
          <div 
            key={index}
            className="flex items-center gap-2 px-3 py-1 rounded-full"
            style={{
              background: purpleGlassmorphism.light.background,
              backdropFilter: purpleGlassmorphism.light.backdropFilter,
              border: `1px solid ${getMetricColor(metric)}40`,
            }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ 
                background: getMetricGradient(metric),
                boxShadow: `0 0 8px ${getMetricColor(metric)}40`,
              }}
            />
            <span 
              className="text-xs font-medium capitalize"
              style={{ 
                color: colors.text.secondary,
              }}
            >
              {metric}
            </span>
          </div>
        ))}
      </div>

      {/* Interactive tooltip placeholder */}
      <div 
        className="absolute bottom-4 right-4 px-2 py-1 rounded-lg text-xs opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: purpleGlassmorphism.heavy.background,
          backdropFilter: purpleGlassmorphism.heavy.backdropFilter,
          border: `1px solid ${colors.purple.DEFAULT}40`,
          color: colors.text.secondary,
        }}
      >
        Hover para detalhes
      </div>
    </div>

    {/* Subtle glow effect */}
    <div 
      className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
      style={{
        background: purpleGradients.background.mesh,
        boxShadow: purpleGlassmorphism.glow.subtle,
      }}
    />
  );
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.2;
    }
    50% {
      opacity: 0.4;
    }
  }
`;
document.head.appendChild(style);
