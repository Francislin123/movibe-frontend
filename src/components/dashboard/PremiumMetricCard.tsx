import React from 'react';
import { colors, purpleGlassmorphism, purpleGradients, purpleShadows } from '../../styles/purple-design-system';

interface PremiumMetricCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  growth?: number
  loading?: boolean
  // ADICIONADO: 'yellow' à lista de cores permitidas
  color?: 'purple' | 'green' | 'blue' | 'orange' | 'pink' | 'yellow'
  trend?: 'up' | 'down' | 'stable'
}

export default function PremiumMetricCard({
  title,
  value,
  icon,
  growth,
  trend,
  loading = false,
  color = 'purple'
}: PremiumMetricCardProps) {

  const getGradientColor = () => {
    switch (color) {
      case 'green': return 'from-emerald-600 via-green-600 to-teal-600';
      case 'blue': return 'from-blue-600 via-cyan-600 to-sky-600';
      case 'orange': return 'from-orange-600 via-amber-600 to-yellow-600';
      case 'pink': return 'from-pink-600 via-rose-600 to-red-600';
      // ADICIONADO: Estilo para a cor yellow
      case 'yellow': return 'from-yellow-500 via-amber-500 to-orange-500';
      default: return 'from-purple-600 via-violet-600 to-indigo-600';
    }
  };

  const getGrowthIcon = () => {
    if (growth === undefined) return null;
    if (growth > 0) return '↑';
    if (growth < 0) return '↓';
    return '→';
  };

  const getGrowthColor = () => {
    if (growth === undefined) return colors.text.secondary;
    if (growth > 0) return '#10B981';
    if (growth < 0) return '#EF4444';
    return colors.text.secondary;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#10B981';
      case 'down': return '#EF4444';
      default: return colors.text.secondary;
    }
  };

  if (loading) {
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
        <div className="absolute inset-0">
          <div
            className={`
              absolute inset-0
              ${purpleGradients.animated.shimmer}
              bg-cover
              animate-pulse
              opacity-20
            `}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-700/50 rounded-xl animate-pulse" />
            <div className="w-16 h-4 bg-gray-700/50 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700/50 rounded-lg w-3/4 animate-pulse" />
            <div className="h-8 bg-gray-700/50 rounded-lg w-1/2 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl p-6
        ${purpleGlassmorphism.light.background}
        ${purpleGlassmorphism.light.backdropFilter}
        ${purpleGlassmorphism.light.border}
        ${purpleShadows.card}
        hover:${purpleShadows.cardHover}
        transition-all duration-300
        hover:scale-[1.02]
        hover:border-purple-500/30
        before:absolute before:inset-0 before:rounded-2xl
        before:bg-gradient-to-br before:from-purple-600/5 before:to-violet-600/10
        before:opacity-0 before:transition-opacity before:duration-300
        hover:before:opacity-100
      `}
      style={{
        animation: 'fadeIn 0.5s ease-out',
      }}
    >
      <div className="flex items-start justify-between mb-6">
        <div
          className={`
            relative p-4 rounded-2xl
            bg-gradient-to-br ${getGradientColor()}
            ${purpleShadows.button}
            transition-all duration-300
            transform group-hover:scale-110
          `}
        >
          <div className="relative z-10 text-white">
            {icon}
          </div>

          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ boxShadow: purpleGlassmorphism.glow.subtle }}
          />
        </div>

        {(growth !== undefined || trend) && (
          <div className="flex items-center gap-2">
            {growth !== undefined && (
              <div className={`
                flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold
                ${purpleGlassmorphism.medium.background}
                ${purpleGlassmorphism.medium.border}
              `}
              >
                <span style={{ color: getGrowthColor() }}>{getGrowthIcon()}</span>
                <span style={{ color: getGrowthColor() }}>{Math.abs(growth).toFixed(1)}%</span>
              </div>
            )}

            {trend && (
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold" style={{ color: getTrendColor() }}>
                  {getTrendIcon()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <p
            className="text-sm font-medium uppercase tracking-wide"
            style={{ color: colors.text.secondary, letterSpacing: '0.05em' }}
          >
            {title}
          </p>
        </div>

        <div className="relative">
          <p
            className="text-3xl font-bold tracking-tight group-hover:text-4xl transition-all duration-300"
            style={{ color: colors.text.primary, textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
          >
            {value}
          </p>
          <div
            className="absolute inset-0 -z-10 opacity-20 blur-xl"
            style={{ background: purpleGradients.primarySubtle }}
          />
        </div>
      </div>
    </div>
  );
}

// Injeção de estilos de animação (Global)
if (typeof document !== 'undefined') {
  const styleId = 'metric-card-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(style);
  }
}