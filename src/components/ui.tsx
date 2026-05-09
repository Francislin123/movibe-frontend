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
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
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
    <div className="text-center py-10 text-gray-400 text-sm">
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
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </div>
  )
}

// ─── Field row ────────────────────────────────────────────────────────────────

export function Field({ label, value }: { label: string; value: ReactNode }) {
  if (!value) return null
  return (
    <div>
      <span className="text-xs text-gray-400 uppercase tracking-wide block">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value}</span>
    </div>
  )
}

// ─── Badges ───────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<UserStatus, string> = {
  ACTIVE:    'bg-emerald-100 text-emerald-700',
  INACTIVE:  'bg-gray-100    text-gray-600',
  SUSPENDED: 'bg-red-100     text-red-700',
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
  NONE:                       'bg-gray-100  text-gray-600',
  VIP_BALLADS_FOR_PROMOTERS:  'bg-violet-100 text-violet-700',
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
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">✓ Verificada</span>
  ) : (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Não verificada</span>
  )
}

export function EventTypeBadge({ type }: { type: string }) {
  const isPremium = type === 'PREMIUM_BALLAD'
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isPremium ? 'bg-amber-100 text-amber-700' : 'bg-sky-100 text-sky-700'}`}>
      {isPremium ? '★ Premium' : 'Standard'}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

export function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue:    'from-blue-500   to-blue-600',
    violet:  'from-violet-500 to-violet-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber:   'from-amber-500  to-amber-600',
    rose:    'from-rose-500   to-rose-600',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color] ?? colors.blue} rounded-2xl p-5 text-white shadow-md`}>
      <p className="text-sm opacity-80 font-medium">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
  )
}

// ─── Input / Select helpers ───────────────────────────────────────────────────

export function Label({ children }: { children: ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{children}</label>
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
    />
  )
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
    />
  )
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
    >
      {loading ? <Spinner size={4} /> : children}
    </button>
  )
}
