import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getRsvps, createRsvp } from '../services/api'
import { Card, EmptyState, ErrorAlert, Field, Label, Input, Select, SubmitButton } from '../components/ui'
import type { RsvpGoingResponse, CreateRsvpRequest, ApiError, RsvpIntention } from '../types'

function useIntentionLabels() {
  const { t } = useTranslation()
  return {
    ONLY_DRINKS:  '🍹 ' + t('intentionDrinks'),
    FIND_PARTNER: '💘 ' + t('intentionPartner'),
    JUST_DANCE:   '💃 ' + t('intentionDance'),
    NETWORK:      '🤝 ' + t('intentionNetwork'),
    OPEN:         '✨ ' + t('intentionOpen'),
  } as Record<RsvpIntention, string>
}

function fmtDate(value: string) {
  if (!value) return ''

  const [datePart, timePart] = value.split('T')

  const [year, month, day] = datePart.split('-')
  const [hour, minute] = timePart.split(':')

  return `${day}/${month}/${year} ${hour}:${minute}` 
}

export default function Rsvps() {
  const { t } = useTranslation()
  const INTENTION_LABEL = useIntentionLabels()
  const [rsvps, setRsvps]     = useState<RsvpGoingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm]           = useState<CreateRsvpRequest>({ userId: '', eventId: '', intention: 'OPEN' })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)

  function load() {
    setLoading(true)
    getRsvps()
      .then(setRsvps)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setFormError(null); setSuccess(null)
    try {
      const created = await createRsvp(form)
      setSuccess(`RSVP #${created.id} criado! Intenção: ${INTENTION_LABEL[created.intention]}`)
      setForm({ userId: '', eventId: '', intention: 'OPEN' })
      load()
    } catch (e) { setFormError((e as ApiError).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary">{t('rsvpTitle')}</h1>
        <p className="text-sm text-textSecondary mt-1">{t('rsvpDesc')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-sm font-bold text-textPrimary mb-4">{t('newRsvp')}</h2>
          <div className="bg-warning-20 border border-warning-30 rounded-xl px-4 py-3 mb-4 text-xs text-warning">
            ⚠ {t('rsvpWarning')}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('userId')} *</Label>
              <Input required value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} placeholder={t('placeholderUuid')} />
            </div>
            <div>
              <Label>{t('eventId')} *</Label>
              <Input required value={form.eventId} onChange={e => setForm(f => ({ ...f, eventId: e.target.value }))} placeholder={t('placeholderUuid')} />
            </div>
            <div>
              <Label>{t('intention')} *</Label>
              <Select value={form.intention} onChange={e => setForm(f => ({ ...f, intention: e.target.value as RsvpIntention }))}>
                {(Object.keys(INTENTION_LABEL) as RsvpIntention[]).map(k => (
                  <option key={k} value={k}>{INTENTION_LABEL[k]}</option>
                ))}
              </Select>
            </div>
            {formError && <ErrorAlert message={formError} />}
            {success && <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 break-all">{success}</div>}
            <SubmitButton loading={saving}>{t('rsvpConfirm')}</SubmitButton>
          </form>
        </Card>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <p className="text-sm text-textTertiary text-center py-10">{t('loadingData')}</p>}
          {error && <ErrorAlert message={error} />}
          {!loading && !error && rsvps.length === 0 && <EmptyState label={t('noEntity', { entity: 'RSVP' })} />}
          {rsvps.map(r => (
            <Card key={r.id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-textPrimary">{INTENTION_LABEL[r.intention]}</p>
                  <p className="text-xs text-textTertiary mt-0.5">RSVP #{r.id} · {fmtDate(r.decidedAt)}</p>
                </div>
                <span className="text-xs bg-error-20 text-error border border-error-30 font-semibold px-2 py-0.5 rounded-full">{t('rsvpConfirm')}</span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-y-2">
                <Field label={t('userId')} value={<span className="font-mono text-xs break-all">{r.userId}</span>} />
                <Field label={t('eventId')} value={<span className="font-mono text-xs break-all">{r.eventId}</span>} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
