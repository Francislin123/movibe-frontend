import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { colors, purpleGlassmorphism, purpleGradients, purpleShadows } from '../styles/purple-design-system';
import PremiumMetricCard from '../components/dashboard/PremiumMetricCard';
import PremiumGrowthChartNew from '../components/dashboard/PremiumGrowthChartNew';
import PremiumEventRanking from '../components/dashboard/PremiumEventRanking';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import PremiumInput from '../components/ui/PremiumInput';
import { FadeIn, ScaleIn } from '../components/ui/PremiumAnimations';

// Mock data for demonstration
const mockMetrics = {
  users: { total: 15420, growth: 12.5, trend: 'up' as const },
  events: { total: 3420, growth: 8.3, trend: 'up' as const },
  rsvps: { total: 28940, growth: 15.7, trend: 'up' as const },
  checkIns: { total: 18760, growth: -2.3, trend: 'down' as const },
};

const mockGrowthData = [
  { date: '2026-05-08', users: 120, events: 85, rsvps: 210, checkIns: 140 },
  { date: '2026-05-09', users: 135, events: 92, rsvps: 245, checkIns: 155 },
  { date: '2026-05-10', users: 142, events: 78, rsvps: 268, checkIns: 162 },
  { date: '2026-05-11', users: 158, events: 95, rsvps: 289, checkIns: 148 },
  { date: '2026-05-12', users: 165, events: 102, rsvps: 312, checkIns: 171 },
];

const mockEvents = [
  {
    id: '1',
    title: 'Summer Music Festival 2026',
    image: 'https://picsum.photos/seed/event1/400/300.jpg',
    type: 'FESTIVAL',
    confirmedCount: 2847,
    checkInCount: 1923,
    eventDate: '2026-05-15T20:00:00Z',
  },
  {
    id: '2',
    title: 'Electronic Night Experience',
    image: 'https://picsum.photos/seed/event2/400/300.jpg',
    type: 'SHOW',
    confirmedCount: 2156,
    checkInCount: 1892,
    eventDate: '2026-05-18T22:00:00Z',
  },
  {
    id: '3',
    title: 'Beach Party Weekend',
    image: 'https://picsum.photos/seed/event3/400/300.jpg',
    type: 'PARTY',
    confirmedCount: 1923,
    checkInCount: 1654,
    eventDate: '2026-05-20T19:00:00Z',
  },
  {
    id: '4',
    title: 'Tech Conference 2026',
    image: 'https://picsum.photos/seed/event4/400/300.jpg',
    type: 'CONFERENCE',
    confirmedCount: 3421,
    checkInCount: 2876,
    eventDate: '2026-05-22T09:00:00Z',
  },
  {
    id: '5',
    title: 'Jazz & Blues Night',
    image: 'https://picsum.photos/seed/event5/400/300.jpg',
    type: 'CONCERT',
    confirmedCount: 1567,
    checkInCount: 1234,
    eventDate: '2026-05-25T21:00:00Z',
  },
];

export default function PremiumDashboard() {
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('7days');
  const [searchTerm, setSearchTerm] = useState('');

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: colors.background.primary,
      }}
    >
      {/* Background gradient mesh */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: purpleGradients.background.mesh,
          opacity: 0.5,
        }}
      />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${colors.purple.DEFAULT}20 0%, transparent 70%)`,
            animation: 'float 6s ease-in-out infinite',
            top: '10%',
            left: '5%',
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${colors.purple.DEFAULT}15 0%, transparent 70%)`,
            animation: 'float 8s ease-in-out infinite',
            top: '60%',
            right: '10%',
            animationDelay: '2s',
          }}
        />
        <div 
          className="absolute w-48 h-48 rounded-full opacity-10"
          style={{
            background: `radial-gradient(circle, ${colors.purple.DEFAULT}10 0%, transparent 70%)`,
            animation: 'float 7s ease-in-out infinite',
            bottom: '20%',
            left: '15%',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Main content container */}
      <div className="relative z-10 flex">
        {/* Premium Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div 
            className={`
              h-screen p-6 overflow-y-auto
              ${purpleGlassmorphism.dark.background}
              ${purpleGlassmorphism.dark.backdropFilter}
              ${purpleGlassmorphism.dark.border}
            `}
          >
            {/* Logo area */}
            <div className="mb-8">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{
                  background: purpleGradients.primary,
                  boxShadow: purpleShadows.buttonGlow,
                }}
              >
                <span 
                  className="text-white font-bold text-xl"
                  style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                >
                  M
                </span>
              </div>
            </div>

            {/* Navigation items */}
            <nav className="space-y-2">
              {[
                { icon: '📊', label: 'Dashboard', active: true },
                { icon: '🎉', label: 'Eventos', active: false },
                { icon: '👥', label: 'Usuários', active: false },
                { icon: '📈', label: 'Analytics', active: false },
                { icon: '⚙️', label: 'Configurações', active: false },
              ].map((item, index) => (
                <button
                  key={index}
                  className={`
                    w-full px-4 py-3 rounded-xl text-left
                    transition-all duration-300
                    ${item.active 
                      ? `bg-purple-600 text-white ${purpleShadows.button}` 
                      : `hover:bg-purple-600/20 text-white hover:bg-purple-600/10`
                    }
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Search input */}
            <div className="mt-6">
              <PremiumInput
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={setSearchTerm}
                icon="🔍"
              />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 min-h-screen overflow-y-auto">
          {/* Dashboard Header */}
          <ScaleIn delay={200}>
            <DashboardHeader
              title="Analytics Dashboard"
              subtitle="Visão geral da plataforma"
              onRefresh={handleRefresh}
              onFilterChange={handleFilterChange}
              loading={loading}
            />
          </ScaleIn>

          {/* Metrics Cards Grid */}
          <FadeIn delay={300}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <PremiumMetricCard
                title="Usuários Totais"
                value={mockMetrics.users.total.toLocaleString()}
                icon="👥"
                growth={mockMetrics.users.growth}
                trend={mockMetrics.users.trend}
                color="purple"
              />
              <PremiumMetricCard
                title="Eventos Ativos"
                value={mockMetrics.events.total.toLocaleString()}
                icon="🎉"
                growth={mockMetrics.events.growth}
                trend={mockMetrics.events.trend}
                color="green"
              />
              <PremiumMetricCard
                title="RSVPs Confirmados"
                value={mockMetrics.rsvps.total.toLocaleString()}
                icon="✅"
                growth={mockMetrics.rsvps.growth}
                trend={mockMetrics.rsvps.trend}
                color="blue"
              />
              <PremiumMetricCard
                title="Check-ins Realizados"
                value={mockMetrics.checkIns.total.toLocaleString()}
                icon="📍"
                growth={mockMetrics.checkIns.growth}
                trend={mockMetrics.checkIns.trend}
                color="orange"
              />
            </div>
          </FadeIn>

          {/* Charts Section */}
          <FadeIn delay={400}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PremiumGrowthChartNew
                title="Crescimento de Usuários"
                subtitle="Novos usuários nos últimos 7 dias"
                data={mockGrowthData}
                metrics={['users']}
                height={300}
              />
              <PremiumGrowthChartNew
                title="Crescimento de Eventos"
                subtitle="Novos eventos nos últimos 7 dias"
                data={mockGrowthData}
                metrics={['events']}
                height={300}
              />
            </div>
          </FadeIn>

          {/* Additional Charts */}
          <FadeIn delay={500}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PremiumGrowthChartNew
                title="RSVPs e Check-ins"
                subtitle="Engajamento dos usuários"
                data={mockGrowthData}
                metrics={['rsvps', 'checkIns']}
                height={300}
              />
              <PremiumGrowthChartNew
                title="Visão Geral"
                subtitle="Todas as métricas juntas"
                data={mockGrowthData}
                metrics={['users', 'events', 'rsvps', 'checkIns']}
                height={300}
              />
            </div>
          </FadeIn>

          {/* Top Events Ranking */}
          <FadeIn delay={600}>
            <PremiumEventRanking
              events={mockEvents}
              title="Top Eventos da Semana"
              maxItems={5}
            />
          </FadeIn>

          {/* Footer spacing */}
          <div className="h-8" />
        </div>
      </div>

      {/* Global animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-30px) translateX(30px);
          }
          66% {
            transform: translateY(30px) translateX(-20px);
          }
        }
      `}</style>
    </div>
  );
}
