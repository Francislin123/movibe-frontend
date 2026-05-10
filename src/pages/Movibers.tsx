import { useEffect, useState } from "react";
import { getMovibers, searchMovibers, createMoviber, getUsers } from "../services/api";
import {
  Card,
  EmptyState,
  ErrorAlert,
  Field,
  SubscriptionBadge,
  Label,
  SubmitButton,
} from "../components/ui";
import SearchInput from "../components/SearchInput";
import EntityImage from "../components/EntityImage";
import type {
  MoviberResponse,
  CreateMoviberRequest,
  ApiError,
  PromoterSubscription,
  UserResponse,
} from "../types";

// ─── Component ───────────────────────────────────────────────────────────────

export default function Movibers() {
  const [movibers, setMovibers] = useState<MoviberResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form
  const [linkedUserId, setLinkedUserId] = useState("");
  const [subscription, setSubscription] =
    useState<PromoterSubscription>("NONE");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // usuário selecionado no picker — pré-visualização dos dados
  const selectedUser = users.find((u) => u.id === linkedUserId) ?? null;

  // IDs de usuários que já são movibers (para evitar duplicata no picker)
  const linkedIds = new Set(movibers.map((m) => m.linkedUserId));
  const availableUsers = users.filter((u) => !linkedIds.has(u.id));

  function load(query?: string) {
    setLoading(true);
    
    const movibersPromise = query && query.trim() 
      ? searchMovibers(query.trim()) 
      : getMovibers();
    
    Promise.all([movibersPromise, getUsers()])
      .then(([m, u]) => {
        setMovibers(m);
        setUsers(u);
      })
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }

  function handleSearch(query: string) {
    load(query);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!linkedUserId) {
      setFormError("Selecione um usuário.");
      return;
    }
    if (!selectedUser) {
      setFormError("Usuário não encontrado.");
      return;
    }

    setSaving(true);
    setFormError(null);
    setSuccess(null);

    try {
      const payload: CreateMoviberRequest = {
        linkedUserId,
        followerCount: 0,
        subscription,
        name: selectedUser.displayName,
        email: selectedUser.email ?? undefined,
        cpf: undefined,
        responsibleName: selectedUser.responsibleName ?? undefined,
        cep: selectedUser.cep ?? undefined,
        cellPhoneNumber: selectedUser.cellPhoneNumber ?? undefined,
        telephoneNumber: selectedUser.telephoneNumber ?? undefined,
      };

      const created = await createMoviber(payload);
      setSuccess(
        `Moviber "${created.name ?? selectedUser.displayName}" criado com sucesso!`,
      );
      setLinkedUserId("");
      setSubscription("NONE");
      load();
    } catch (e) {
      setFormError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Movibers</h1>
        <p className="text-sm text-gray-500 mt-1">
          Promoters da plataforma — ordenados por seguidores · {movibers.length}{" "}
          cadastrado{movibers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ─── Formulário de Criação ─── */}
      <Card className="p-6 bg-gradient-to-br from-violet-50/50 to-purple-50/30 border-violet-200/50">
        <h2 className="text-sm font-bold text-gray-700 mb-5 flex items-center gap-2">
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
          Novo Moviber
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* ── Picker de usuário ── */}
          <div>
            <Label>Usuário vinculado *</Label>
            <select
              required
              value={linkedUserId}
              onChange={(e) => {
                setLinkedUserId(e.target.value);
                setFormError(null);
              }}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="">Selecione um usuário...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName} ({u.email})
                </option>
              ))}
            </select>
            {availableUsers.length === 0 && !loading && (
              <p className="text-xs text-amber-600 mt-1.5">
                Todos os usuários já possuem um Moviber vinculado.
              </p>
            )}
          </div>

          {/* ── Pré-visualização ── */}
          {selectedUser && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-3">Dados herdados do usuário:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Nome:</span>
                  <p className="font-medium text-gray-800">{selectedUser.displayName}</p>
                </div>
                <div>
                  <span className="text-gray-500">E-mail:</span>
                  <p className="font-medium text-gray-800">{selectedUser.email}</p>
                </div>
                <div>
                  <span className="text-gray-500">Celular:</span>
                  <p className="font-medium text-gray-800">{selectedUser.cellPhoneNumber || "—"}</p>
                </div>
                <div>
                  <span className="text-gray-500">CEP:</span>
                  <p className="font-medium text-gray-800">{selectedUser.cep || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Assinatura ── */}
          <div>
            <Label>Assinatura *</Label>
            <select
              value={subscription}
              onChange={(e) => setSubscription(e.target.value as PromoterSubscription)}
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            >
              <option value="NONE">
                Free — sem acesso a eventos premium
              </option>
              <option value="VIP_BALLADS_FOR_PROMOTERS">
                ★ VIP Baladas — eventos premium liberados
              </option>
            </select>
            <p className="text-xs text-gray-400 mt-1.5">
              {subscription === "VIP_BALLADS_FOR_PROMOTERS"
                ? "★ Permite criar eventos do tipo PREMIUM_BALLAD."
                : "Apenas eventos do tipo STANDARD."}
            </p>
          </div>

          {formError && <ErrorAlert message={formError} />}
          {success && (
            <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 break-all">
              ✓ {success}
            </div>
          )}
          <SubmitButton loading={saving}>Criar Moviber</SubmitButton>
        </form>
      </Card>

      {/* Search input */}
      <Card className="p-4">
        <SearchInput 
          onSearch={handleSearch} 
          loading={loading} 
          placeholder="Buscar por nome, e-mail ou celular..." 
        />
      </Card>

      {/* ─── Lista de Movibers ─── */}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-14 text-violet-400 gap-3">
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            <span className="text-sm font-medium">Carregando…</span>
          </div>
        )}
        {error && <ErrorAlert message={error} />}
        {!loading && !error && movibers.length === 0 && (
          <EmptyState label="Nenhum moviber cadastrado ainda." />
        )}
        {movibers.map((moviber) => {
          const linkedUser = users.find((u) => u.id === moviber.linkedUserId);
          return (
            <Card key={moviber.id} className="p-5 hover:shadow-lg transition-shadow duration-200">
              <div className="flex gap-4">
                <EntityImage
                  image={moviber.image || linkedUser?.image}
                  name={moviber.name ?? linkedUser?.displayName ?? "M"}
                  size="md"
                  fallback={
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-white shadow">
                      {linkedUser ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 100 4v4a4 4 0 100-4 4v4a4 4 0 100-4-4-4m0 8a4 4 0 100 4v4a4 4 0 100-4-4-4" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </div>
                  }
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {/* Nome principal */}
                      <p className="font-semibold text-gray-900 truncate leading-tight">
                        {moviber.name ?? linkedUser?.displayName ?? "Sem nome"}
                      </p>
                      {/* Usuário vinculado */}
                      {linkedUser && (
                        <p className="text-xs text-violet-500 font-medium truncate mt-0.5">
                          👤 {linkedUser.displayName}
                        </p>
                      )}
                      <p className="text-xs font-mono text-gray-400 truncate mt-0.5">
                        {moviber.id}
                      </p>
                    </div>
                    <SubscriptionBadge sub={moviber.subscription} />
                  </div>

                  {/* Dados do moviber */}
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    <Field
                      label="Seguidores"
                      value={
                        <span
                          className={`font-bold ${moviber.followerCount > 100 ? "text-emerald-600" : "text-gray-700"}`}
                        >
                          {moviber.followerCount}
                          {moviber.followerCount > 100 && (
                            <span className="text-xs font-normal text-emerald-500 ml-1">
                              (evento gratuito ✓)
                            </span>
                          )}
                        </span>
                      }
                    />
                    <Field label="E-mail" value={moviber.email ?? linkedUser?.email} />
                    <Field
                      label="Celular"
                      value={moviber.cellPhoneNumber ?? linkedUser?.cellPhoneNumber}
                    />
                    <Field label="CEP" value={moviber.cep ?? linkedUser?.cep} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
