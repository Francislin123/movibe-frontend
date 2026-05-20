import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence } from 'framer-motion'
import {
  getBaladas,
  searchBaladas,
  getEventsByBalada,
  getBaladaById
} from '../services/api'
import {
  Card,
  EmptyState,
  ErrorAlert,
  VerifiedBadge,
  Spinner,
  EventTypeBadge
} from '../components/ui'
import SearchInput from '../components/SearchInput'
import EntityImage from '../components/EntityImage'
import BaladaEditModal from '../components/BaladaEditModal'
import CreateEventModal from '../components/CreateEventModal'
import EventEditModal from '../components/EventEditModal'
import PremiumBaladaForm from '../components/PremiumBaladaForm'
import type { BaladaResponse, ApiError, EventResponse } from '../types'

// ─── Mask & Formatter Helpers ─────────────────────────────────────────────────

function formatCNPJ(value: string | undefined): string {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '').slice(0, 14)
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`
  if (cleaned.length <= 12) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`
  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`
}


function formatCellPhone(value: string | undefined): string {
  if (!value) return ''
  const cleaned = value.replace(/\D/g, '').slice(0, 11)
  if (cleaned.length === 0) return ''
  if (cleaned.length <= 2) return `(${cleaned}`
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

function formatPremiumDate(dateString: string): { date: string; time: string } {
  if (!dateString) return { date: '', time: '' }
  const [datePart, timePart] = dateString.split('T')
  const [year, month, day] = datePart.split('-')
  const [hour, minute] = timePart.split(':')
  return {
    date: `${day}/${month}/${year}`,
    time: `${hour}:${minute}`
  }
}


// ─── Sub-componentes de Comunicação Responsivos ─────────────────────────────────

function WhatsAppLink({ phone }: { phone: string | null }) {
  if (!phone) return <span className="text-sm text-textTertiary">—</span>

  const cleaned = phone.replace(/\D/g, "")
  const formatted = formatCellPhone(phone)

  return (
    <a
      href={`https://wa.me/55${cleaned}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
    >
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      <span className="truncate">{formatted}</span>
    </a>
  )
}

function InstagramLink({ link }: { link: string | null }) {
  if (!link) return <span className="text-sm text-textTertiary">—</span>

  const clean = link.trim()
  const urlMatch = clean.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([\w._]+)\/?/i)
  let handle = clean
  let href = clean.startsWith("http") ? clean : `https://${clean}`

  if (urlMatch) {
    handle = `@${urlMatch[1]}`
    href = `https://www.instagram.com/${urlMatch[1]}/`
  } else if (/^@?[\w.]{1,30}$/.test(clean) && !clean.includes(".com")) {
    const username = clean.replace(/^@/, "")
    handle = `@${username}`
    href = `https://www.instagram.com/${username}/`
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
    >
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0 3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
      <span className="truncate">{handle}</span>
    </a>
  )
}

function CNPJBadge({ cnpj }: { cnpj: string | null }) {
  if (!cnpj) return <span className="text-sm text-textTertiary">—</span>
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surfaceHover text-textPrimary text-xs font-medium w-fit max-w-full">
      <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="font-mono truncate">{formatCNPJ(cnpj)}</span>
    </span>
  )
}

function EmailBadge({ email }: { email: string | null }) {
  if (!email) return <span className="text-sm text-textTertiary">—</span>
  return (
    <a
      href={`mailto:${email}`}
      className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
    >
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
      <span className="truncate">{email}</span>
    </a>
  )
}

function EditButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-surfaceBorder hover:border-violet-500/30 text-textSecondary hover:text-violet-500 text-xs font-medium transition-all duration-150 w-full md:w-auto active:scale shadow-sm"
      title={label}
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
      <span>{label}</span>
    </button>
  )
}

export default function Baladas() {
  const { t } = useTranslation()

  const [baladas, setBaladas] = useState<BaladaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showPremiumForm, setShowPremiumForm] = useState(false)

  const [editingBalada, setEditingBalada] = useState<BaladaResponse | null>(null)
  const [creatingEventFor, setCreatingEventFor] = useState<BaladaResponse | null>(null)
  const [editingEvent, setEditingEvent] = useState<EventResponse | null>(null)

  const [expandedBaladaId, setExpandedBaladaId] = useState<string | null>(null)
  const [baladaEventsCache, setBaladaEventsCache] = useState<Record<string, { loading: boolean; events: EventResponse[]; error: string | null }>>({})
  const [baladaEventSearchCache, setBaladaEventSearchCache] = useState<Record<string, string>>({})

  const handleEdit = (balada: BaladaResponse) => {
    setEditingBalada(balada)
  }

  const handlePremiumFormSuccess = () => {
    setShowPremiumForm(false)
    load()
  }

  async function toggleBaladaEvents(baladaId: string) {
    if (expandedBaladaId === baladaId) {
      setExpandedBaladaId(null)
      return
    }
    setExpandedBaladaId(baladaId)

    setBaladaEventsCache(prev => {
      const entry = prev[baladaId]
      if (entry && !entry.error && (entry.loading || entry.events.length > 0)) return prev

      getEventsByBalada(baladaId)
        .then(events => setBaladaEventsCache(c => ({ ...c, [baladaId]: { loading: false, events, error: null } })))
        .catch(e => setBaladaEventsCache(c => ({ ...c, [baladaId]: { loading: false, events: [], error: (e as ApiError).message } })))
      return { ...prev, [baladaId]: { loading: true, events: [], error: null } }
    })
  }

  function refreshBaladaEvents(baladaId: string) {
    setBaladaEventsCache(c => ({ ...c, [baladaId]: { loading: true, events: [], error: null } }))
    getEventsByBalada(baladaId)
      .then(events => setBaladaEventsCache(c => ({ ...c, [baladaId]: { loading: false, events, error: null } })))
      .catch(e => setBaladaEventsCache(c => ({ ...c, [baladaId]: { loading: false, events: [], error: (e as ApiError).message } })))
  }

  function handleBaladaEventSearch(baladaId: string, query: string) {
    setBaladaEventSearchCache(prev => ({ ...prev, [baladaId]: query }))
  }

  function getFilteredBaladaEvents(baladaId: string): EventResponse[] {
    const cache = baladaEventsCache[baladaId]
    if (!cache || !cache.events) return []

    const searchQuery = baladaEventSearchCache[baladaId]
    if (!searchQuery || !searchQuery.trim()) return cache.events

    const searchLower = searchQuery.toLowerCase()
    return cache.events.filter(event =>
      event.title.toLowerCase().includes(searchLower) ||
      event.desc?.toLowerCase().includes(searchLower) ||
      event.cep?.toLowerCase().includes(searchLower) ||
      event.type.toLowerCase().includes(searchLower)
    )
  }

  async function refreshBaladaInList(baladaId: string) {
    try {
      const updated = await getBaladaById(baladaId)
      setBaladas(prev => prev.map(b => b.id === baladaId ? updated : b))
    } catch {
      // Falha silenciosa
    }
  }

  function load(query?: string) {
    setLoading(true)
    const promise = query && query.trim() ? searchBaladas(query.trim()) : getBaladas()

    promise
      .then(setBaladas)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  // Surgical event count update via Custom Events
  useEffect(() => {
    const handleEventCreated = (e: Event) => {
      const customEvent = e as CustomEvent<{ baladaId: string; eventId: string }>
      const { baladaId, eventId } = customEvent.detail

      setBaladas(prev =>
        prev.map(b =>
          b.id === baladaId
            ? { ...b, hostedEventIds: [...(b.hostedEventIds || []), eventId] }
            : b
        )
      )
    }

    window.addEventListener('event-created', handleEventCreated)
    return () => window.removeEventListener('event-created', handleEventCreated)
  }, [])

  function handleSearch(query: string) {
    load(query)
  }

  const totalBaladas = baladas.length
  const verifiedBaladas = baladas.filter(b => b.verified).length
  const totalEvents = baladas.reduce((acc, b) => acc + (b.hostedEventIds?.length || 0), 0)

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-textPrimary tracking-tight">{t('nav.baladas')}</h1>
        </div>
      </div>

      {/* Count Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-white/40 p-5">
          <div className="relative z-10">
            <p className="text-xs font-bold text-textTertiary uppercase tracking-wider mb-1">{t('baladas.total', 'Total de Baladas')}</p>
            <p className="text-3xl font-black text-primary">{totalBaladas}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-8 -mt-8" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-5">
          <div className="relative z-10">
            <p className="text-xs font-bold text-textTertiary uppercase tracking-wider mb-1">{t('baladas.verified', 'Baladas Verificadas')}</p>
            <p className="text-3xl font-black text-emerald-500">{verifiedBaladas}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-5">
          <div className="relative z-10">
            <p className="text-xs font-bold text-textTertiary uppercase tracking-wider mb-1">{t('baladas.events', 'Eventos Vinculados')}</p>
            <p className="text-3xl font-black text-amber-500">{totalEvents}</p>
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-8 -mt-8" />
        </div>
      </div>

      {/* Botão para abrir formulário premium */}
      <Card className="overflow-hidden shadow-sm border border-surfaceBorder hover:border-primary/40 transition-all duration-300">
        <button
          type="button"
          onClick={() => setShowPremiumForm(true)}
          className="w-full flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5 hover:bg-surfaceHover transition-colors group"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <span className="text-base font-bold text-textPrimary block">
                Novo estabelecimento
              </span>
              <span className="text-xs text-textTertiary mt-0.5 block">
                Cadastre um novo estabelecimento com formulário premium
              </span>
            </div>
          </div>
          <svg
            className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform duration-300 shrink-0"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </Card>

      {/* Caixa de Pesquisa */}
      <Card className="p-4 shadow-sm border border-surfaceBorder">
        <SearchInput
          onSearch={handleSearch}
          loading={loading}
          placeholder={t('search')}
        />
      </Card>

      {/* Grid de Baladas */}
      <div className="space-y-4">
        {loading && (
          <div className="flex justify-center py-12">
            <p className="text-sm text-gray-400 font-medium">{t('loadingData')}</p>
          </div>
        )}
        {error && <ErrorAlert message={error} />}
        {!loading && !error && baladas.length === 0 && (
          <EmptyState label={t('noEntity', { entity: t('nav.baladas') })} />
        )}

        {!loading && !error && baladas.map(b => (
          <Card
            key={b.id}
            className="flex flex-col p-4 sm:p-5 transition-all duration-300 border border-surfaceBorder hover:border-primary/40 bg-gradient-to-br from-surface to-surface/90"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(254, 254, 254, 0.02)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Bloco de Identificação */}
              <div className="md:col-span-4 flex flex-row items-start gap-3 sm:gap-4 min-w-0">
                <EntityImage
                  image={b.image}
                  name={b.tradeName}
                  size="md"
                  fallback={
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-md shrink-0">
                      <span className="text-lg sm:text-xl font-bold">{b.tradeName.charAt(0).toUpperCase()}</span>
                    </div>
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-row items-center justify-between gap-1">
                    <p className="font-bold text-textPrimary text-base sm:text-lg truncate">{b.tradeName}</p>
                    <div className="flex items-center gap-1.5 shrink-0 md:hidden">
                      <VerifiedBadge verified={b.verified} />
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 mt-1">
                    <VerifiedBadge verified={b.verified} />
                  </div>
                </div>
              </div>

              {/* Bloco das Informações Gerais Dinâmicas */}
              <div className="md:col-span-8 p-3 rounded-xl border border-surfaceBorder/60 bg-surface/40 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-center">
                  <div className="flex flex-col gap-1 md:border-r border-surfaceBorder/30 md:pr-2">
                    <span className="text-[11px] font-medium text-textTertiary uppercase tracking-wider">{t('cnpj')}</span>
                    <CNPJBadge cnpj={b.cnpj || null} />
                  </div>
                  <div className="flex flex-col gap-1 md:border-r border-surfaceBorder/30 md:pr-2">
                    <span className="text-[11px] font-medium text-textTertiary uppercase tracking-wider">{t('email')}</span>
                    <EmailBadge email={b.email || null} />
                  </div>
                  <div className="flex flex-col gap-1 md:border-r border-surfaceBorder/30 md:pr-2">
                    <span className="text-[11px] font-medium text-textTertiary uppercase tracking-wider">{t('instagram')}</span>
                    <InstagramLink link={b.link || null} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[11px] font-medium text-textTertiary uppercase tracking-wider">{t('cellPhone')}</span>
                    <WhatsAppLink phone={b.cellPhoneNumber || null} />
                  </div>
                </div>
              </div>
            </div>

            {b.description && (
              <div className="mt-4 p-3 rounded-xl bg-primary/5 border-l-2 border-primary w-full">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{t('description')}</p>
                <p className="text-xs text-textSecondary leading-relaxed">{b.description}</p>
              </div>
            )}

            {/* Rodapé de Ações */}
            <div className="flex flex-wrap md:flex-row items-center justify-end mt-4 gap-2 pt-2 border-t border-surfaceBorder/40 w-full">
              <button
                type="button"
                onClick={() => toggleBaladaEvents(b.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150 flex-1 md:flex-initial ${
                  expandedBaladaId === b.id
                    ? 'border-amber-400 bg-amber-50/10 text-amber-500'
                    : 'border-surfaceBorder hover:border-amber-500/30 text-textSecondary hover:text-amber-500'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="truncate">({b.hostedEventIds?.length ?? 0}) {t('events')}</span>
                <svg
                  className={`w-3 h-3 transition-transform duration-200 shrink-0 ${expandedBaladaId === b.id ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setCreatingEventFor(b)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-surfaceBorder hover:border-violet-500/30 text-textSecondary hover:text-violet-500 text-xs font-medium transition-all duration-150 flex-1 md:flex-initial"
                title={t('createEvent')}
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="truncate">{t('createEvent')}</span>
              </button>

              <div className="w-full md:w-auto flex-1 md:flex-none">
                <EditButton onClick={() => handleEdit(b)} label={t('edit')} />
              </div>
            </div>

            {/* Sub-painel Expandível de Eventos */}
            {expandedBaladaId === b.id && (
              <div className="mt-4 border-t border-surfaceBorder/60 pt-3 space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-textTertiary uppercase tracking-wider">
                    {t('baladaEvents', 'Eventos da localizacao')}
                  </p>
                  <button
                    type="button"
                    onClick={() => refreshBaladaEvents(b.id)}
                    className="p-1 rounded-lg hover:bg-surfaceHover text-textTertiary transition"
                    title={t('refreshList', 'Atualizar Lista')}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>

                <div className="p-1">
                  <SearchInput
                    onSearch={(query) => handleBaladaEventSearch(b.id, query)}
                    loading={false}
                    placeholder={t('filterEvents', 'Filtrar eventos...')}
                  />
                </div>

                {(() => {
                  const cache = baladaEventsCache[b.id]
                  if (!cache || cache.loading) {
                    return (
                      <div className="flex items-center justify-center py-4 gap-2">
                        <Spinner size={4} />
                        <span className="text-xs text-textTertiary">{t('loadingData')}</span>
                      </div>
                    )
                  }
                  if (cache.error) return <p className="text-xs text-red-400 py-2">{cache.error}</p>

                  const searchQuery = baladaEventSearchCache[b.id]
                  const filteredEvents = getFilteredBaladaEvents(b.id)

                  if (searchQuery && searchQuery.trim() && filteredEvents.length === 0) {
                    return (
                      <p className="text-xs text-textTertiary text-center py-4">
                        {t('noResultsFor', 'Nenhum resultado para')} "{searchQuery}"
                      </p>
                    )
                  }

                  if (filteredEvents.length === 0) {
                    return <p className="text-xs text-textTertiary text-center py-4">{t('noEntity', { entity: t('nav.events') })}</p>
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1 subtle-scrollbar">
                      {filteredEvents.map(ev => {
                        const startDate = formatPremiumDate(ev.startsAt)
                        const endDate = formatPremiumDate(ev.endsAt)
                        
                        return (
                          <div
                            key={ev.id}
                            className="relative overflow-hidden rounded-2xl bg-[#0B0B0F]/60 backdrop-blur-md border border-[#7B2FFF]/20 hover:border-[#A855F7]/40 transition-all duration-300"
                          >
                            {/* Header with image and title */}
                            <div className="flex items-start gap-3 p-4 border-b border-[#7B2FFF]/10">
                              <div className="shrink-0">
                                {ev.image ? (
                                  <img src={ev.image} alt={ev.title} className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#7B2FFF]/30" />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7B2FFF] to-[#A855F7] flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                    {ev.title.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-white truncate">{ev.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <EventTypeBadge type={ev.type} />
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setEditingEvent(ev)}
                                className="p-1.5 rounded-lg border border-[#7B2FFF]/20 text-[#A855F7] hover:bg-[#7B2FFF]/10 hover:text-white transition-all duration-200"
                                title={t('editEvent')}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                            </div>

                            {/* Premium Details Section */}
                            <div className="p-4 space-y-3">
                              {/* Timeline: Starts At / Ends At */}
                              <div className="grid grid-cols-2 gap-3">
                                {/* Starts At */}
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#7B2FFF]/10 to-[#A855F7]/5 border border-[#7B2FFF]/20 p-3">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#7B2FFF]/5 rounded-full blur-xl -mr-4 -mt-4" />
                                  <div className="relative z-10 flex items-center gap-2 mb-1">
                                    <svg className="w-4 h-4 text-[#7B2FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-[10px] font-semibold text-[#B3B3C3] uppercase tracking-wider">Início</span>
                                  </div>
                                  <div className="relative z-10">
                                    <p className="text-lg font-bold text-white">{startDate.time}</p>
                                    <p className="text-xs text-[#B3B3C3]">{startDate.date}</p>
                                  </div>
                                </div>

                                {/* Ends At */}
                                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#A855F7]/10 to-[#7B2FFF]/5 border border-[#A855F7]/20 p-3">
                                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#A855F7]/5 rounded-full blur-xl -mr-4 -mt-4" />
                                  <div className="relative z-10 flex items-center gap-2 mb-1">
                                    <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-[10px] font-semibold text-[#B3B3C3] uppercase tracking-wider">Fim</span>
                                  </div>
                                  <div className="relative z-10">
                                    <p className="text-lg font-bold text-white">{endDate.time}</p>
                                    <p className="text-xs text-[#B3B3C3]">{endDate.date}</p>
                                  </div>
                                </div>
                              </div>

                              {/* CEP with Location */}
                              {ev.location && (
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0B0B0F]/40 border border-[#7B2FFF]/10">
                                  <svg className="w-4 h-4 text-[#7B2FFF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <div className="flex-1">
                                    <p className="text-[10px] font-semibold text-[#7B2FFF] uppercase tracking-wider mb-0.5">LOCALIZAÇÃO</p>
                                    <p className="text-sm font-bold text-[#B3B3C3] hover:text-white transition-colors duration-200">
                                      {ev.location || 'Localização não informada'}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Balada Badge */}
                              {ev.hostBaladaName && (
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-r from-[#7B2FFF] to-[#A855F7] rounded-xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                                  <div className="relative flex items-center gap-2 p-2.5 rounded-xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/20 hover:border-[#A855F7]/40 transition-all duration-300 cursor-pointer group-hover:bg-[#7B2FFF]/15">
                                    <svg className="w-4 h-4 text-[#A855F7] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-[10px] font-semibold text-[#7B2FFF] uppercase tracking-wider mb-0.5">LOCALIZAÇÃO</p>
                                      <p className="text-sm font-bold text-[#A855F7] truncate group-hover:text-white transition-colors duration-300">{ev.hostBaladaName}</p>
                                    </div>
                                    <svg className="w-3.5 h-3.5 text-[#A855F7] shrink-0 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Premium Form Modal */}
      <AnimatePresence>
        {showPremiumForm && (
          <PremiumBaladaForm
            onSuccess={handlePremiumFormSuccess}
            onCancel={() => setShowPremiumForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Seção Modais */}
      {editingBalada && (
        <BaladaEditModal
          balada={editingBalada}
          onClose={() => setEditingBalada(null)}
          onSuccess={() => {
            setEditingBalada(null)
            load()
          }}
        />
      )}

      {creatingEventFor && (
        <CreateEventModal
          hostBaladaId={creatingEventFor.id}
          hostBaladaName={creatingEventFor.tradeName}
          onClose={() => setCreatingEventFor(null)}
          onSuccess={() => {
            const baladaId = creatingEventFor.id
            setCreatingEventFor(null)
            refreshBaladaInList(baladaId)
            refreshBaladaEvents(baladaId)
          }}
        />
      )}

      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={() => {
            const baladaId = editingEvent.hostBaladaId
            setEditingEvent(null)
            if (baladaId) {
              refreshBaladaEvents(baladaId)
              refreshBaladaInList(baladaId)
            }
          }}
        />
      )}
    </div>
  )
}