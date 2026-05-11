import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { UserStatusBadge } from './ui';
import { PremiumButton, PremiumIconButton } from './PremiumButton';
import type { UserResponse } from '../types';

// ─── Premium User Detail Panel Component ───────────────────────────────────────────

interface UserDetailPanelProps {
  user: UserResponse;
  onClose?: () => void;
  onEdit?: () => void;
  className?: string;
}

export function UserDetailPanel({ user, onClose, onEdit, className = '' }: UserDetailPanelProps) {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'info' | 'contact' | 'social'>('info');

  const initials = user.displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatInstagram = (link: string) => {
    if (!link) return '-';
    if (link.includes('instagram.com/')) {
      return '@' + link.split('instagram.com/')[1];
    }
    if (link.startsWith('@')) {
      return link;
    }
    return '@' + link;
  };

  return (
    <div 
      className={`
        bg-surface bg-opacity-60 backdrop-blur-xl rounded-3xl 
        border border-surfaceBorder shadow-premium-xl
        animate-scaleIn ${className}
      `}
      style={{
        boxShadow: `0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)`
      }}
    >
      {/* Header */}
      <div className="relative p-8 border-b border-surfaceBorder bg-gradient-to-br from-primary to-accent bg-opacity-5">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-textTertiary hover:text-textPrimary hover:bg-surface hover:bg-opacity-50 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* User Profile */}
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative">
            {user.image ? (
              <img
                src={user.image}
                alt={user.displayName}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-surfaceBorder shadow-2xl"
                style={{
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px ${currentTheme.colors.surfaceBorder}, 0 0 24px ${currentTheme.colors.shadowGlow}`
                }}
              />
            ) : (
              <div
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-textInverse font-bold text-3xl shadow-2xl"
                style={{
                  boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 24px ${currentTheme.colors.shadowGlow}`
                }}
              >
                {initials}
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute -bottom-2 -right-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-surface shadow-lg"
                style={{
                  backgroundColor: user.status === 'ACTIVE' ? currentTheme.colors.success : 
                                   user.status === 'INACTIVE' ? currentTheme.colors.textSecondary : 
                                   currentTheme.colors.error,
                  boxShadow: `0 0 12px ${user.status === 'ACTIVE' ? currentTheme.colors.success : 
                                   user.status === 'INACTIVE' ? currentTheme.colors.textSecondary : 
                                   currentTheme.colors.error}`
                }}
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-textPrimary mb-2">
              {user.displayName}
            </h2>
            
            <div className="flex items-center gap-3 mb-4">
              <UserStatusBadge status={user.status} />
              {user.email && (
                <span className="text-sm text-textTertiary">
                  {user.email}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {onEdit && (
                <PremiumButton
                  onClick={onEdit}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  }
                >
                  Editar
                </PremiumButton>
              )}
              
              <PremiumIconButton
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                }
                variant="ghost"
                tooltip="Favoritar"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surfaceBorder">
        {[
          { id: 'info', label: 'Informações', icon: '👤' },
          { id: 'contact', label: 'Contato', icon: '📞' },
          { id: 'social', label: 'Social', icon: '🌐' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200
              border-b-2 relative
              ${activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-textTertiary border-transparent hover:text-textSecondary'
              }
            `}
            style={{
              boxShadow: activeTab === tab.id ? `inset 0 -2px 0 ${currentTheme.colors.primary}` : 'none'
            }}
          >
            <span className="text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  Informações Básicas
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-surfaceBorder">
                    <span className="text-sm text-textTertiary">Status</span>
                    <UserStatusBadge status={user.status} />
                  </div>
                  
                  {user.birthDate && (
                    <div className="flex justify-between items-center py-2 border-b border-surfaceBorder">
                      <span className="text-sm text-textTertiary">Data de Nascimento</span>
                      <span className="text-sm text-textSecondary font-medium">
                        {formatDate(user.birthDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Info */}
            <div className="space-y-4">
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                  <span className="text-xl">💼</span>
                  Informações Profissionais
                </h3>
                
                <div className="space-y-3">
                  {user.cnpj && (
                    <div className="flex justify-between items-center py-2 border-b border-surfaceBorder">
                      <span className="text-sm text-textTertiary">CNPJ</span>
                      <span className="text-sm text-textSecondary font-mono">{user.cnpj}</span>
                    </div>
                  )}
                  
                  {user.reasonSocial && (
                    <div className="flex justify-between items-center py-2 border-b border-surfaceBorder">
                      <span className="text-sm text-textTertiary">Razão Social</span>
                      <span className="text-sm text-textSecondary text-right max-w-[200px] truncate">
                        {user.reasonSocial}
                      </span>
                    </div>
                  )}
                  
                  {user.responsibleName && (
                    <div className="flex justify-between items-center py-2 border-b border-surfaceBorder">
                      <span className="text-sm text-textTertiary">Responsável</span>
                      <span className="text-sm text-textSecondary">{user.responsibleName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  Localização
                </h3>
                
                <div className="space-y-3">
                  {user.cep && (
                    <div className="flex justify-between items-center py-2 border-b border-surfaceBorder">
                      <span className="text-sm text-textTertiary">CEP</span>
                      <span className="text-sm text-textSecondary font-mono">{user.cep}</span>
                    </div>
                  )}
                  
                  <div className="text-sm text-textTertiary">
                    Endereço não informado
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {user.description && (
              <div className="space-y-4">
                <div className="glass-dark rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    Descrição
                  </h3>
                  
                  <p className="text-sm text-textSecondary leading-relaxed">
                    {user.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp">
            {/* Phone Numbers */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                <span className="text-xl">📱</span>
                Telefones
              </h3>
              
              <div className="space-y-3">
                {user.cellPhoneNumber && (
                  <div className="flex items-center gap-3 p-3 bg-surface bg-opacity-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-textTertiary">Celular</div>
                      <div className="text-sm font-medium text-textPrimary">{user.cellPhoneNumber}</div>
                    </div>
                  </div>
                )}
                
                {user.telephoneNumber && (
                  <div className="flex items-center gap-3 p-3 bg-surface bg-opacity-50 rounded-xl">
                    <div className="w-10 h-10 bg-accent bg-opacity-20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21a5.5 5.5 0 015.5-5.5H17a5.5 5.5 0 015.5 5.5M3 21h18M8.5 12.5v-3a2.5 2.5 0 115 0v3M8.5 12.5h7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm text-textTertiary">Telefone</div>
                      <div className="text-sm font-medium text-textPrimary">{user.telephoneNumber}</div>
                    </div>
                  </div>
                )}
                
                {!user.cellPhoneNumber && !user.telephoneNumber && (
                  <div className="text-sm text-textTertiary text-center py-8">
                    Nenhum telefone informado
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                <span className="text-xl">✉️</span>
                E-mail
              </h3>
              
              {user.email ? (
                <div className="flex items-center gap-3 p-3 bg-surface bg-opacity-50 rounded-xl">
                  <div className="w-10 h-10 bg-info bg-opacity-20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-textTertiary">E-mail principal</div>
                    <div className="text-sm font-medium text-textPrimary">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-textTertiary text-center py-8">
                  Nenhum e-mail informado
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp">
            {/* Instagram */}
            <div className="glass-dark rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                <span className="text-xl">📸</span>
                Instagram
              </h3>
              
              {user.link ? (
                <div className="flex items-center gap-3 p-3 bg-surface bg-opacity-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.849.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.281-.073-1.689-.073-4.849 0-3.259.014-3.668.072-4.948.2-4.358 2.618-6.78 6.98-6.98 1.281-.059 1.689-.072 4.948-.072 3.259 0 3.668.014 4.948.072 4.354.2 6.782 2.618 6.979 6.98.059 1.28.073 1.689.073 4.948 0 3.259-.014 3.667-.072 4.947-.196 4.354-2.617 6.78-6.979 6.98-1.281.059-1.69.073-4.949.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-textTertiary">Instagram</div>
                    <div className="text-sm font-medium text-textPrimary">{formatInstagram(user.link)}</div>
                    <div className="text-xs text-textTertiary mt-1">{user.link}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-textTertiary text-center py-8">
                  Instagram não informado
                </div>
              )}
            </div>

            {/* Rules */}
            {user.rules && (
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-textPrimary mb-4 flex items-center gap-2">
                  <span className="text-xl">📜</span>
                  Regulamento
                </h3>
                
                <div className="text-sm text-textSecondary leading-relaxed max-h-32 overflow-y-auto">
                  {user.rules}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
