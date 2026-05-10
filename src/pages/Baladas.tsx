import { useEffect, useState } from 'react'
import { getBaladas, searchBaladas, createBalada } from '../services/api'
import { Card, EmptyState, ErrorAlert, Field, VerifiedBadge, Label, Input, SubmitButton } from '../components/ui'
import SearchInput from '../components/SearchInput'
import EntityImage from '../components/EntityImage'
import BaladaEditModal from '../components/BaladaEditModal'
import type { BaladaResponse, CreateBaladaRequest, ApiError } from '../types'

// Botão de edição (padronizado com Users.tsx)
function EditButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-500 hover:text-violet-600 text-xs font-medium transition-all duration-150 shrink-0"
      title="Editar balada"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
      Editar
    </button>
  )
}

export default function Baladas() {
  const [baladas, setBaladas] = useState<BaladaResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [form, setForm]           = useState<CreateBaladaRequest>({ ownerUserId: '', tradeName: '' })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess]     = useState<string | null>(null)
  
  // Estado para modal de edição
  const [editingBalada, setEditingBalada] = useState<BaladaResponse | null>(null)

  const handleEdit = (balada: BaladaResponse) => {
    setEditingBalada(balada)
  }

  function load(query?: string) {
    setLoading(true)
    
    const promise = query && query.trim() 
      ? searchBaladas(query.trim()) 
      : getBaladas();
    
    promise
      .then(setBaladas)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false))
  }

  function handleSearch(query: string) {
    load(query);
  }

  useEffect(() => {
    load();
  }, [])

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

      {/* ─── Formulário de Criação ─── */}
      <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/30 border-violet-200/50">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <span className="w-5 h-5 bg-violet-100 rounded-md flex items-center justify-center">
            <svg
              className="w-3 h-3 text-violet-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </span>
          Nova Balada
        </h2>
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

      {/* Search input */}
      <Card className="p-4">
        <SearchInput 
          onSearch={handleSearch} 
          loading={loading} 
          placeholder="Buscar por CNPJ, e-mail ou nome fantasia..." 
        />
      </Card>

      {/* ─── Lista de Baladas ─── */}
      <div className="space-y-3">
        {loading && <p className="text-sm text-gray-400 text-center py-10">Carregando…</p>}
        {error && <ErrorAlert message={error} />}
        {!loading && !error && baladas.length === 0 && <EmptyState label="Nenhuma balada cadastrada ainda." />}
        {baladas.map(b => (
          <Card key={b.id} className="p-4 hover:shadow-lg transition-shadow duration-200">
            <div className="flex gap-4">
              <EntityImage 
                image={b.image} 
                name={b.tradeName} 
                size="md" 
                fallback={
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7-7-5m0 0l-7 7-5m7 7H5" />
                    </svg>
                  </div>
                }
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{b.tradeName}</p>
                    <p className="text-xs font-mono text-gray-400 truncate mt-0.5">{b.id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <VerifiedBadge verified={b.verified} />
                    <EditButton onClick={() => handleEdit(b)} />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                  <Field label="CNPJ" value={b.cnpj || "—"} />
                  <Field label="E-mail" value={b.email || "—"} />
                  <Field label="Telefone" value={b.telephoneNumber || "—"} />
                  <Field label="Celular" value={b.cellPhoneNumber || "—"} />
                </div>
                {b.description && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 line-clamp-2">{b.description}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de Edição */}
      {editingBalada && (
        <BaladaEditModal
          balada={editingBalada}
          onClose={() => setEditingBalada(null)}
          onSuccess={() => {
            setEditingBalada(null)
            load() // Recarregar lista após edição
          }}
        />
      )}
    </div>
  );
}
