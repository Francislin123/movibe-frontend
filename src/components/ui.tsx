import type { ReactNode } from 'react'
import type { UserStatus, PromoterSubscription } from '../types'

// ─── Spinner ──────────────────────────────────────────────────────────────────

export function Spinner({ size = 5 }: { size?: number }) {
  return (
    <svg
      className={`animate-spin w-${size} h-${size} text-current`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

// ─── Error alert ─────────────────────────────────────────────────────────────

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-error bg-opacity-10 border border-error text-error text-sm rounded-xl px-4 py-3">
      <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm0 6a1 1 0 10-2 0 1 1 0 002 0z" clipRule="evenodd" />
      </svg>
      {message}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-10 text-textTertiary text-sm">
      <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
      </svg>
      {label}
    </div>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div 
      className={`bg-surface bg-opacity-80 backdrop-blur-xl rounded-2xl border border-surfaceBorder shadow-theme transition-all duration-300 hover:bg-surfaceHover ${className}`}
      style={{
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.06)'
      }}
    >
      {children}
    </div>
  )
}

// ─── Field row ────────────────────────────────────────────────────────────────

export function Field({ label, value }: { label: string; value: ReactNode }) {
  if (!value) return null
  return (
    <div>
      <span className="text-xs text-textTertiary uppercase tracking-wide block">{label}</span>
      <span className="text-sm text-textPrimary font-medium">{value}</span>
    </div>
  )
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<UserStatus, string> = {
  ACTIVE:    'bg-success bg-opacity-10 text-success',
  INACTIVE:  'bg-textSecondary bg-opacity-10 text-textSecondary',
  SUSPENDED: 'bg-error bg-opacity-10 text-error',
}

const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE:    'Ativo',
  INACTIVE:  'Inativo',
  SUSPENDED: 'Suspenso',
}

export function UserStatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

const SUB_COLOR: Record<PromoterSubscription, string> = {
  NONE:                       'bg-textSecondary bg-opacity-10 text-textSecondary',
  VIP_BALLADS_FOR_PROMOTERS:  'bg-primary bg-opacity-10 text-primary',
}

const SUB_LABEL: Record<PromoterSubscription, string> = {
  NONE:                      'Free',
  VIP_BALLADS_FOR_PROMOTERS: 'VIP Baladas',
}

export function SubscriptionBadge({ sub }: { sub: PromoterSubscription }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SUB_COLOR[sub]}`}>
      {SUB_LABEL[sub]}
    </span>
  )
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-info bg-opacity-10 text-info">✓ Verificada</span>
  ) : (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-textSecondary bg-opacity-10 text-textSecondary">Não verificada</span>
  )
}

export function EventTypeBadge({ type }: { type: string }) {
  const typeConfig = {
    'STANDARD': { label: 'Standard', color: 'bg-info bg-opacity-10 text-info' },
    'PREMIUM_BALLAD': { label: 'Premium Ballad', color: 'bg-warning bg-opacity-10 text-warning' },
    'NETWORK': { label: 'Network', color: 'bg-primary bg-opacity-10 text-primary' },
    'OPEN': { label: 'Open', color: 'bg-success bg-opacity-10 text-success' }
  }
  
  const config = typeConfig[type as keyof typeof typeConfig] || typeConfig['STANDARD']
  
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

export function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue:    'from-info      to-info',
    violet:  'from-primary   to-primary',
    emerald: 'from-success   to-success',
    amber:   'from-warning   to-warning',
    rose:    'from-error     to-error',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color] ?? colors.violet} rounded-2xl p-5 text-textInverse shadow-theme`}>
      <p className="text-sm opacity-80 font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}

// ─── Input / Select helpers ───────────────────────────────────────────────────

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wide">{children}</label>
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm bg-surface text-textPrimary placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm bg-surface text-textPrimary placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-y min-h-[100px]"
    />
  )
}

export function ReadOnlyField({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <span className="text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wide block">{label}</span>
      <div className="w-full border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition">
        {value}
      </div>
    </div>
  )
}

export function ReadOnlyTextarea({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs font-semibold text-textSecondary mb-1.5 uppercase tracking-wide block">{label}</span>
      <div className="w-full border border-surfaceBorder rounded-xl px-4 py-2.5 text-sm bg-surface text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary transition min-h-[100px] whitespace-pre-wrap">
        {value}
      </div>
    </div>
  )
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-primary hover:bg-primaryHover disabled:bg-primaryLight text-textInverse py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
    >
      {loading ? <Spinner size={4} /> : children}
    </button>
  )
}
