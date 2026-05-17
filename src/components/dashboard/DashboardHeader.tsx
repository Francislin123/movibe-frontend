import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // 1. Adicionado para movimento
import { colors, purpleGlassmorphism, purpleGradients, purpleShadows } from '../../styles/purple-design-system';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  onFilterChange?: (filter: string) => void;
  loading?: boolean;
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filters = [
    { value: '7days', label: 'Últimos 7 dias' },
    { value: '30days', label: 'Últimos 30 dias' },
    { value: '90days', label: 'Últimos 90 dias' },
    { value: '1year', label: 'Último ano' },
  ];

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilters(false);
    onFilterChange?.(filter);
  };

  const handleRefresh = () => {
    onRefresh?.();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.div
      // 2. Configurações de Arrastar (Destravar tela)
      drag
      dragMomentum={false}
      whileDrag={{
        scale: 1.02,
        zIndex: 100,
        cursor: 'grabbing'
      }}
      className={`
        relative overflow-hidden rounded-2xl p-6 mb-6
        cursor-grab select-none
        ${purpleGlassmorphism.light.background}
        ${purpleGlassmorphism.light.backdropFilter}
        ${purpleGlassmorphism.light.border}
        ${purpleShadows.card}
        transition-shadow duration-300
      `}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
        style={{ background: purpleGradients.background.mesh }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="pointer-events-none"> {/* Evita selecionar texto ao arrastar */}
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: colors.text.primary }}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className="text-sm opacity-80"
                style={{ color: colors.text.secondary }}
              >
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Impede que o clique inicie um arrasto
                  setShowFilters(!showFilters);
                }}
                className={`
                  px-4 py-2 rounded-lg flex items-center gap-2
                  ${purpleGlassmorphism.medium.background}
                  ${purpleGlassmorphism.medium.backdropFilter}
                  ${purpleGlassmorphism.medium.border}
                  ${purpleShadows.button}
                  hover:brightness-110 transition-all duration-200
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span className="text-sm font-medium">
                  {filters.find(f => f.value === selectedFilter)?.label}
                </span>
              </button>

              {showFilters && (
                <div
                  className={`
                    absolute right-0 mt-2 w-48 rounded-xl z-[60] overflow-hidden flex flex-col
                    ${purpleGlassmorphism.heavy.background}
                    ${purpleGlassmorphism.heavy.backdropFilter}
                    ${purpleGlassmorphism.heavy.border}
                    ${purpleShadows.modal}
                  `}
                >
                  {filters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilterChange(filter.value);
                      }}
                      className={`
                        w-full text-left px-4 py-3 text-sm transition-all duration-150
                        ${filter.value === selectedFilter
                          ? 'bg-purple-600/40 text-white font-semibold'
                          : 'hover:bg-purple-600/20 text-white'
                        }
                      `}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRefresh();
              }}
              disabled={loading}
              className={`
                px-4 py-2 rounded-lg flex items-center gap-2
                ${purpleGlassmorphism.medium.background}
                ${purpleGlassmorphism.medium.backdropFilter}
                ${purpleGlassmorphism.medium.border}
                ${purpleShadows.button}
                ${loading ? 'opacity-50 cursor-wait' : 'hover:brightness-110 active:scale-95 transition-all'}
              `}
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium">
                {loading ? 'Atualizando...' : 'Atualizar'}
              </span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm opacity-70 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: colors.text.secondary }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span style={{ color: colors.text.secondary }}>
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}