import { useEffect, useState } from 'react'
import { getMovibers, createMoviber } from '../services/api'
import { Card, EmptyState, ErrorAlert, Field, SubscriptionBadge, Label, Input, Select, SubmitButton } from '../components/ui'
import type { MoviberResponse, CreateMoviberRequest, ApiError, PromoterSubscription } from '../types'

export default function Movibers() {
  const [movibers, setMovibers] = useState<MoviberResponse[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const [form, setForm]           = useState<CreateMoviberRequest>({ linkedUserId: '', followerCount: 0, subscription: 'NONE' })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)

  function load() {
    setLoading(true)
    getMovibers()
      .then(setMovibers)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setFormError(null); setSuccess(null)
    try {
      const created = await createMoviber(form)
      setSuccess(`Moviber criado! ID: ${created.id}`)
      setForm({ linkedUserId: '', followerCount: 0, subscription: 'NONE' })
      load()
    } catch (e) { setFormError((e as ApiError).message) }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Movibers</h1>
        <p className="text-sm text-gray-500 mt-1">Promoters da plataforma — ordenados por seguidores</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Novo Moviber</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>User ID vinculado *</Label>
              <Input required value={form.linkedUserId} onChange={e => setForm(f => ({ ...f, linkedUserId: e.target.value }))} placeholder="UUID do usuário" />
            </div>
            <div>
              <Label>Seguidores</Label>
              <Input type="number" min={0} value={form.followerCount} onChange={e => setForm(f => ({ ...f, followerCount: Number(e.target.value) }))} />
              <p className="text-xs text-gray-400 mt-1">Acima de 100 → criação de evento gratuita</p>
            </div>
            <div>
              <Label>Assinatura *</Label>
              <Select value={form.subscription} onChange={e => setForm(f => ({ ...f, subscription: e.target.value as PromoterSubscription }))}>
                <option value="NONE">Free</option>
                <option value="VIP_BALLADS_FOR_PROMOTERS">VIP Baladas</option>
              </Select>
            </div>
            <div>
              <Label>Nome</Label>
              <Input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value || undefined }))} placeholder="Nome do promoter" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value || undefined }))} placeholder="email@exemplo.com" />
            </div>
            {formError && <ErrorAlert message={formError} />}
            {success && <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 break-all">{success}</div>}
            <SubmitButton loading={saving}>Criar Moviber</SubmitButton>
          </form>
        </Card>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <p className="text-sm text-gray-400 text-center py-10">Carregando…</p>}
          {error && <ErrorAlert message={error} />}
          {!loading && !error && movibers.length === 0 && <EmptyState label="Nenhum Moviber cadastrado ainda." />}
          {movibers.map(m => (
            <Card key={m.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{m.name ?? 'Sem nome'}</p>
                  <p className="text-xs font-mono text-gray-400 truncate mt-0.5">{m.id}</p>
                </div>
                <SubscriptionBadge sub={m.subscription} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <Field label="Seguidores" value={m.followerCount.toLocaleString('pt-BR')} />
                <Field label="E-mail" value={m.email} />
                <Field label="User ID" value={<span className="font-mono text-xs">{m.linkedUserId.slice(0, 8)}…</span>} />
                <Field label="Celular" value={m.cellPhoneNumber} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
