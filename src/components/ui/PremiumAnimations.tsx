// Premium Animation Components for Dashboard

import { useEffect } from 'react';

export const FadeIn = ({ 
  children, 
  delay = 0, 
  duration = 500 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  duration?: number; 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        transition-opacity duration-300
        ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
};

export const SlideUp = ({ 
  children, 
  delay = 0, 
  distance = 20 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  distance?: number; 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        transition-all duration-500
        ${isVisible 
          ? 'opacity-100 transform translate-y-0' 
          : 'opacity-0 transform translate-y-4'
        }
      `}
    >
      {children}
    </div>
  );
};

export const ScaleIn = ({ 
  children, 
  delay = 0, 
  scale = 0.95 
}: { 
  children: React.ReactNode; 
  delay?: number; 
  scale?: number; 
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={`
        transition-transform duration-300
        ${isVisible 
          ? 'opacity-100 scale-100' 
          : 'opacity-0 scale-95'
        }
      `}
      style={{
        transform: isVisible ? 'scale(1)' : `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
};

export const Pulse = ({ 
  children, 
  pulse = true 
}: { 
  children: React.ReactNode; 
  pulse?: boolean; 
}) => {
  return (
    <div className={pulse ? 'animate-pulse' : ''}>
      {children}
    </div>
  );
};

export const Shimmer = ({ 
  height = '1rem', 
  width = '100%' 
}: { 
  height?: string; 
  width?: string; 
}) => {
  return (
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{ height, width }}
    >
      <div 
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-20 animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          animation: 'shimmer 2s infinite',
        }}
      />
    </div>
  );
};

// Add CSS animations to document
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .animate-shimmer {
    animation: shimmer 2s infinite;
  }
`;
document.head.appendChild(style);
