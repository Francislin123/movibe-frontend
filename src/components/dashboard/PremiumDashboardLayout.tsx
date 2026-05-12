import React from 'react';
import { colors, purpleGlassmorphism, purpleGradients, purpleShadows } from '../../styles/purple-design-system';

interface PremiumDashboardLayoutProps {
  children: React.ReactNode
  title?: string
  sidebar?: React.ReactNode
}

export default function PremiumDashboardLayout({ 
  children, 
  title = "Dashboard Analytics",
  sidebar 
}: PremiumDashboardLayoutProps) {
  
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
        {/* Sidebar integration */}
        {sidebar && (
          <div className="w-64 flex-shrink-0">
            {sidebar}
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 min-h-screen">
          {/* Top spacing bar */}
          <div 
            className="h-2"
            style={{
              background: `linear-gradient(to bottom, ${colors.background.primary}, ${colors.background.secondary})`,
            }}
          />
          
          {/* Main content with premium spacing */}
          <main className="p-8">
            {/* Content header */}
            <div className="mb-8">
              <div 
                className={`
                  relative overflow-hidden rounded-2xl p-6
                  ${purpleGlassmorphism.light.background}
                  ${purpleGlassmorphism.light.backdropFilter}
                  ${purpleGlassmorphism.light.border}
                  ${purpleShadows.card}
                `}
              >
                {/* Header gradient overlay */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    background: purpleGradients.primarySubtle,
                  }}
                />
                
                <div className="relative z-10">
                  <h1 
                    className="text-3xl font-bold tracking-tight"
                    style={{ 
                      color: colors.text.primary,
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                  >
                    {title}
                  </h1>
                  
                  {/* Subtle underline */}
                  <div 
                    className="mt-3 h-px w-full opacity-30"
                    style={{
                      background: purpleGradients.primary,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Content area with enhanced spacing */}
            <div 
              className={`
                relative
                ${purpleGlassmorphism.darkMedium.background}
                ${purpleGlassmorphism.darkMedium.backdropFilter}
                ${purpleGlassmorphism.darkMedium.border}
                ${purpleShadows.lg}
                rounded-2xl p-8
                transition-all duration-500
              `}
            >
              {/* Content glow effect */}
              <div 
                className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
                style={{
                  background: purpleGradients.background.mesh,
                  boxShadow: purpleGlassmorphism.glow.subtle,
                }}
              />
              
              {/* Main content */}
              <div className="relative z-10">
                {children}
              </div>
            </div>
          </main>
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
        
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
