import { useEffect, useState } from 'react'
import { getBaladas, createBalada } from '../services/api'
import { Card, EmptyState, ErrorAlert, Field, VerifiedBadge, Label, Input, SubmitButton } from '../components/ui'
import type { BaladaResponse, CreateBaladaRequest, ApiError } from '../types'

export default function Baladas() {
  const [baladas, setBaladas] = useState<BaladaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm]           = useState<CreateBaladaRequest>({ ownerUserId: '', tradeName: '' })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)

  function load() {
    setLoading(true)
    getBaladas()
      .then(setBaladas)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setFormError(null); setSuccess(null)
    try {
      const created = await createBalada(form)
      setSuccess(`Balada "${created.tradeName}" criada! ID: ${created.id}`)
      setForm({ ownerUserId: '', tradeName: '' })
      load()
    } catch (e) { setFormError((e as ApiError).message) }
    finally { setSaving(false) }
  }

  const set = (k: keyof CreateBaladaRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value || undefined }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Baladas</h1>
        <p className="text-sm text-gray-500 mt-1">Estabelecimentos cadastrados — ordenados por nome</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Nova Balada</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Owner User ID *</Label>
              <Input required value={form.ownerUserId} onChange={e => setForm(f => ({ ...f, ownerUserId: e.target.value }))} placeholder="UUID do dono" />
            </div>
            <div>
              <Label>Nome fantasia *</Label>
              <Input required value={form.tradeName} onChange={e => setForm(f => ({ ...f, tradeName: e.target.value }))} placeholder="Ex: Club Infinity" />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email ?? ''} onChange={set('email')} placeholder="contato@balada.com" />
            </div>
            <div>
              <Label>CNPJ</Label>
              <Input value={form.cnpj ?? ''} onChange={set('cnpj')} placeholder="00.000.000/0001-00" />
            </div>
            <div>
              <Label>Logradouro</Label>
              <Input value={form.local ?? ''} onChange={set('local')} placeholder="Rua, bairro, cidade" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={form.description ?? ''} onChange={set('description')} placeholder="Breve descrição…" />
            </div>
            <div>
              <Label>Site / Link</Label>
              <Input value={form.link ?? ''} onChange={set('link')} placeholder="https://…" />
            </div>
            {formError && <ErrorAlert message={formError} />}
            {success && <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 break-all">{success}</div>}
            <SubmitButton loading={saving}>Criar Balada</SubmitButton>
          </form>
        </Card>

        {/* List */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <p className="text-sm text-gray-400 text-center py-10">Carregando…</p>}
          {error && <ErrorAlert message={error} />}
          {!loading && !error && baladas.length === 0 && <EmptyState label="Nenhuma balada cadastrada ainda." />}
          {baladas.map(b => (
            <Card key={b.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{b.tradeName}</p>
                  <p className="text-xs font-mono text-gray-400 truncate mt-0.5">{b.id}</p>
                </div>
                <VerifiedBadge verified={b.verified} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <Field label="E-mail" value={b.email} />
                <Field label="CNPJ" value={b.cnpj} />
                <Field label="Endereço" value={b.local} />
                <Field label="Telefone" value={b.cellPhoneNumber} />
                <Field label="Eventos hospedados" value={b.hostedEventIds.length > 0 ? `${b.hostedEventIds.length} evento(s)` : null} />
                <Field label="Usuários vinculados" value={b.userIds.length > 0 ? `${b.userIds.length} usuário(s)` : null} />
              </div>
              {b.link && (
                <a href={b.link} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs text-violet-600 hover:underline">
                  🔗 {b.link}
                </a>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
