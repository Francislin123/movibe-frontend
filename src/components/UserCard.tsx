import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { UserStatusBadge } from './ui';
import type { UserResponse } from '../types';

// ─── Premium User Card Component ─────────────────────────────────────────────────

interface UserCardProps {
  user: UserResponse;
  onClick?: () => void;
  className?: string;
}

export function UserCard({ user, onClick, className = '' }: UserCardProps) {
  const { currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const initials = user.displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`
        group relative bg-surface bg-opacity-60 backdrop-blur-xl rounded-2xl 
        border border-surfaceBorder transition-all duration-300 cursor-pointer
        hover:bg-surfaceHover hover:scale-[1.02] hover:shadow-2xl
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? `0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 20px ${currentTheme.colors.shadowGlow}`
          : '0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.shadowGlow} 0%, transparent 50%)`,
          filter: 'blur(20px)'
        }}
      />

      {/* Card Content */}
      <div className="relative p-6">
        {/* User Header */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            {user.image ? (
              <img
                src={user.image}
                alt={user.displayName}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-surfaceBorder shadow-lg"
                style={{
                  boxShadow: `0 4px 16px rgba(0, 0, 0, 0.3), 0 0 0 1px ${currentTheme.colors.surfaceBorder}`
                }}
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-textInverse font-bold text-xl shadow-lg"
                style={{
                  boxShadow: `0 4px 16px rgba(0, 0, 0, 0.3), 0 0 20px ${currentTheme.colors.shadowGlow}`
                }}
              >
                {initials}
              </div>
            )}
            
            {/* Status Indicator */}
            <div className="absolute -bottom-1 -right-1">
              <div 
                className="w-4 h-4 rounded-full border-2 border-surface"
                style={{
                  backgroundColor: user.status === 'ACTIVE' ? currentTheme.colors.success : 
                                   user.status === 'INACTIVE' ? currentTheme.colors.textSecondary : 
                                   currentTheme.colors.error,
                  boxShadow: `0 0 8px ${user.status === 'ACTIVE' ? currentTheme.colors.success : 
                                   user.status === 'INACTIVE' ? currentTheme.colors.textSecondary : 
                                   currentTheme.colors.error}`
                }}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-textPrimary truncate mb-1 group-hover:text-primary transition-colors">
              {user.displayName}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <UserStatusBadge status={user.status} />
              {user.email && (
                <span className="text-xs text-textTertiary truncate">
                  {user.email}
                </span>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-4 text-xs text-textTertiary">
              {user.cellPhoneNumber && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {user.cellPhoneNumber}
                </div>
              )}
              
              {user.link && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                  Instagram
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 pt-4 border-t border-surfaceBorder">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-textTertiary">
              {user.birthDate && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(user.birthDate).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit' 
                  })}
                </div>
              )}
              
              {user.cep && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user.cep}
                </div>
              )}
            </div>

            {/* Hover Action */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <svg 
                className="w-4 h-4 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Compact User Card for Grid View ───────────────────────────────────────────────

interface CompactUserCardProps {
  user: UserResponse;
  onClick?: () => void;
  className?: string;
}

export function CompactUserCard({ user, onClick, className = '' }: CompactUserCardProps) {
  const { currentTheme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const initials = user.displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`
        group relative bg-surface bg-opacity-60 backdrop-blur-xl rounded-xl 
        border border-surfaceBorder transition-all duration-300 cursor-pointer p-4
        hover:bg-surfaceHover hover:scale-[1.02] hover:shadow-xl
        ${className}
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered 
          ? `0 12px 24px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 12px ${currentTheme.colors.shadowGlow}`
          : '0 4px 16px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.06)'
      }}
    >
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.colors.shadowGlow} 0%, transparent 50%)`,
          filter: 'blur(12px)'
        }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-3">
        {/* Avatar */}
        {user.image ? (
          <img
            src={user.image}
            alt={user.displayName}
            className="w-12 h-12 rounded-xl object-cover ring-2 ring-surfaceBorder"
            style={{
              boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2), 0 0 0 1px ${currentTheme.colors.surfaceBorder}`
            }}
          />
        ) : (
          <div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-textInverse font-bold text-sm"
            style={{
              boxShadow: `0 2px 8px rgba(0, 0, 0, 0.2), 0 0 12px ${currentTheme.colors.shadowGlow}`
            }}
          >
            {initials}
          </div>
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-textPrimary truncate group-hover:text-primary transition-colors mb-1">
            {user.displayName}
          </h4>
          <div className="flex items-center gap-2">
            <UserStatusBadge status={user.status} />
            {user.email && (
              <span className="text-xs text-textTertiary truncate">
                {user.email}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg 
            className="w-4 h-4 text-primary" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
