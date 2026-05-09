import { useEffect, useState } from 'react'
import { getUsers, createUser } from '../services/api'
import { Card, EmptyState, ErrorAlert, Field, UserStatusBadge, Label, Input, Select, SubmitButton } from '../components/ui'
import type { UserResponse, CreateUserRequest, ApiError, UserStatus } from '../types'

export default function Users() {
  const [users, setUsers]     = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // form
  const [form, setForm]         = useState<CreateUserRequest>({ displayName: '', status: 'ACTIVE' })
  const [saving, setSaving]     = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  function load() {
    setLoading(true)
    getUsers()
      .then(setUsers)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    setSuccess(null)
    try {
      const created = await createUser(form)
      setSuccess(`Usuário "${created.displayName}" criado! ID: ${created.id}`)
      setForm({ displayName: '', status: 'ACTIVE' })
      load()
    } catch (e) {
      setFormError((e as ApiError).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-sm text-gray-500 mt-1">Contas base da plataforma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Form ─── */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Novo Usuário</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nome de exibição *</Label>
              <Input required value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Ex: DJ Marquinhos" />
            </div>
            <div>
              <Label>Status *</Label>
              <Select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as UserStatus }))}>
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="SUSPENDED">Suspenso</option>
              </Select>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value || undefined }))} placeholder="email@exemplo.com" />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value || undefined }))} placeholder="Breve bio…" />
            </div>
            <div>
              <Label>Celular</Label>
              <Input value={form.cellPhoneNumber ?? ''} onChange={e => setForm(f => ({ ...f, cellPhoneNumber: e.target.value || undefined }))} placeholder="(11) 99999-9999" />
            </div>
            {formError && <ErrorAlert message={formError} />}
            {success && <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 break-all">{success}</div>}
            <SubmitButton loading={saving}>Criar usuário</SubmitButton>
          </form>
        </Card>

        {/* ─── List ─── */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <p className="text-sm text-gray-400 text-center py-10">Carregando…</p>}
          {error && <ErrorAlert message={error} />}
          {!loading && !error && users.length === 0 && <EmptyState label="Nenhum usuário cadastrado ainda." />}
          {users.map(u => (
            <Card key={u.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{u.displayName}</p>
                  <p className="text-xs font-mono text-gray-400 truncate mt-0.5">{u.id}</p>
                </div>
                <UserStatusBadge status={u.status} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                <Field label="E-mail" value={u.email} />
                <Field label="Telefone" value={u.cellPhoneNumber} />
                <Field label="CEP" value={u.cep} />
                {u.description && <Field label="Bio" value={u.description.slice(0, 60) + (u.description.length > 60 ? '…' : '')} />}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
