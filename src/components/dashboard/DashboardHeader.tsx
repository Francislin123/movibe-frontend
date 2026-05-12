import React, { useState } from 'react';
import { RefreshCw, Calendar, Filter } from 'lucide-react';
import { colors, purpleGlassmorphism, purpleGradients, purpleShadows } from '../../styles/purple-design-system';

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  onRefresh?: () => void
  onFilterChange?: (filter: string) => void
  loading?: boolean
}

export default function DashboardHeader({ 
  title = "Dashboard Analytics", 
  subtitle, 
  onRefresh, 
  onFilterChange,
  loading = false 
}: DashboardHeaderProps) {
  const [selectedFilter, setSelectedFilter] = useState('7days');
  const [showFilters, setShowFilters] = useState(false);

  const filters = [
    { value: '7days', label: 'Últimos 7 dias' },
    { value: '30days', label: 'Últimos 30 dias' },
    { value: '90days', label: 'Últimos 90 dias' },
    { value: '1year', label: 'Último ano' },
  ];

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    onFilterChange?.(filter);
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl p-6 mb-6
        ${purpleGlassmorphism.light.background}
        ${purpleGlassmorphism.light.backdropFilter}
        ${purpleGlassmorphism.light.border}
        ${purpleShadows.card}
        transition-all duration-500
      `}
    >
      {/* Background gradient overlay */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
        style={{
          background: purpleGradients.background.mesh,
        }}
      />

      {/* Header content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 
              className="text-3xl font-bold tracking-tight mb-2"
              style={{ 
                color: colors.text.primary,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {title}
            </h1>
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

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Filter button */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  relative px-4 py-2 rounded-lg
                  ${purpleGlassmorphism.medium.background}
                  ${purpleGlassmorphism.medium.backdropFilter}
                  ${purpleGlassmorphism.medium.border}
                  ${purpleShadows.button}
                  hover:${purpleShadows.buttonHover}
                  transition-all duration-300
                  flex items-center gap-2
                `}
              >
                <Filter 
                  className="w-4 h-4"
                  style={{ color: colors.text.secondary }}
                />
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.text.secondary }}
                >
                  {filters.find(f => f.value === selectedFilter)?.label || 'Filtrar'}
                </span>
                
                {/* Dropdown indicator */}
                <div 
                  className={`
                    absolute right-2 top-1/2
                    transition-transform duration-300
                    ${showFilters ? 'rotate-180' : ''}
                  `}
                >
                  <svg 
                    className="w-4 h-4" 
                    style={{ color: colors.text.secondary }}
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6" />
                  </svg>
                </div>
              </button>

              {/* Filter dropdown */}
              {showFilters && (
                <div 
                  className={`
                    absolute top-full right-0 mt-2 w-48 rounded-xl
                    ${purpleGlassmorphism.heavy.background}
                    ${purpleGlassmorphism.heavy.backdropFilter}
                    ${purpleGlassmorphism.heavy.border}
                    ${purpleShadows.modal}
                    z-50
                    animate-fade-in
                  `}
                >
                  <div className="py-2">
                    {filters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleFilterChange(filter.value)}
                        className={`
                          w-full text-left px-4 py-2 text-sm
                          transition-all duration-200
                          ${filter.value === selectedFilter 
                            ? `bg-purple-600 text-white` 
                            : `hover:bg-purple-600/20 text-white hover:bg-purple-600/10`
                          }
                        `}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Refresh button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className={`
                relative px-4 py-2 rounded-lg
                ${purpleGlassmorphism.medium.background}
                ${purpleGlassmorphism.medium.backdropFilter}
                ${purpleGlassmorphism.medium.border}
                ${purpleShadows.button}
                hover:${purpleShadows.buttonHover}
                transition-all duration-300
                disabled:opacity-50
                flex items-center gap-2
                group
              `}
            >
              <RefreshCw 
                className={`
                  w-4 h-4 transition-all duration-300
                  ${loading ? 'animate-spin' : ''}
                  group-hover:scale-110
                `}
                style={{ color: colors.text.secondary }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: colors.text.secondary }}
              >
                {loading ? 'Atualizando...' : 'Atualizar'}
              </span>
              
              {/* Glow effect on hover */}
              <div 
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: purpleGradients.primary,
                  boxShadow: purpleGlassmorphism.glow.subtle,
                }}
              />
            </button>
          </div>
        </div>

        {/* Date and time display */}
        <div className="flex items-center gap-4 text-sm">
          <div 
            className="flex items-center gap-2"
            style={{ color: colors.text.secondary }}
          >
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div 
            className="flex items-center gap-2"
            style={{ color: colors.text.secondary }}
          >
            <span>
              {new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span 
            className="text-xs font-medium"
            style={{ color: colors.text.secondary }}
          >
            Sistema Online
          </span>
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
    </div>
  );
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fade-in {
    animation: fade-in 0.3s ease-out;
  }
`;
document.head.appendChild(style);
