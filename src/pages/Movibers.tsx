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
import type {
  MoviberResponse,
  CreateMoviberRequest,
  ApiError,
  PromoterSubscription,
  UserResponse,
} from "../types";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function MoviberAvatar({
  moviber,
  linkedUser,
  size = "md",
}: {
  moviber: MoviberResponse;
  linkedUser?: UserResponse;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "w-20 h-20 text-2xl"
      : size === "sm"
        ? "w-11 h-11 text-sm"
        : "w-14 h-14 text-base";

  const image = moviber.image || linkedUser?.image;
  const name = moviber.name ?? linkedUser?.displayName ?? "Moviber";

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${dim} rounded-xl object-cover shrink-0 ring-2 ring-surface shadow-theme`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold shrink-0 shadow-theme`}
    >
      {initials || "M"}
    </div>
  );
}

// ─── Lista row ────────────────────────────────────────────────────────────────

function MoviberRow({
  moviber,
  linkedUser,
  selected,
  onSelect,
}: {
  moviber: MoviberResponse;
  linkedUser?: UserResponse;
  selected: boolean;
  onSelect: (m: MoviberResponse) => void;
}) {
  const name = moviber.name ?? linkedUser?.displayName ?? "Sem nome";
  const subtitle =
    linkedUser?.email ?? moviber.email ?? moviber.id.slice(0, 16) + "…";

  return (
    <button
      onClick={() => onSelect(moviber)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 border ${
        selected
          ? "bg-primary border-primary shadow-lg"
          : "bg-surface border-surfaceBorder hover:border-primary hover:bg-surfaceHover hover:shadow-md"
      }`}
      style={{
        boxShadow: selected ? `0 0 0 1px rgba(124, 58, 237, 0.5)` : "none",
      }}
    >
      <MoviberAvatar moviber={moviber} linkedUser={linkedUser} size="sm" />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate leading-tight ${
            selected ? "text-white" : "text-textPrimary"
          }`}
        >
          {name}
        </p>
        <p
          className={`text-xs truncate mt-0.5 ${
            selected ? "text-white font-medium" : "text-textTertiary"
          }`}
        >
          {subtitle}
        </p>
      </div>
      <span
        className={`text-xs font-bold shrink-0 ${
          selected ? "text-white" : "text-textPrimary"
        }`}
        title={`${moviber.followerCount} seguidores`}
      >
        {moviber.followerCount}
        <span
          className={`block text-[10px] font-normal uppercase tracking-wide ${
            selected ? "text-white" : "text-textTertiary"
          }`}
        >
          seg.
        </span>
      </span>
      {selected && (
        <svg
          className="w-4 h-4 text-white shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      )}
    </button>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function MoviberDetail({
  moviber,
  linkedUser,
}: {
  moviber: MoviberResponse;
  linkedUser?: UserResponse;
}) {
  return (
    <Card className="p-6 h-full flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <MoviberAvatar moviber={moviber} linkedUser={linkedUser} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-textPrimary leading-tight truncate">
                {moviber.name ?? linkedUser?.displayName ?? "Sem nome"}
              </h2>
              {linkedUser && (
                <p className="text-xs text-primary font-medium truncate mt-0.5">
                  👤 {linkedUser.displayName}
                </p>
              )}
              <p className="text-xs font-mono text-textTertiary mt-0.5 break-all">
                {moviber.id}
              </p>
            </div>
            <SubscriptionBadge sub={moviber.subscription} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-surfaceBorder" />

      {/* Dados do moviber */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <Field
          label="Seguidores"
          value={
            <span
              className={`font-bold ${
                moviber.followerCount > 100 ? "text-success" : "text-textPrimary"
              }`}
            >
              {moviber.followerCount}
              {moviber.followerCount > 100 && (
                <span className="text-xs font-normal text-success ml-1">
                  (evento gratuito ✓)
                </span>
              )}
            </span>
          }
        />
        <Field
          label="E-mail"
          value={moviber.email ?? linkedUser?.email}
        />
        <Field
          label="Celular"
          value={moviber.cellPhoneNumber ?? linkedUser?.cellPhoneNumber}
        />
        <Field label="CEP" value={moviber.cep ?? linkedUser?.cep} />
      </div>
    </Card>
  );
}

// ─── Empty detail placeholder ─────────────────────────────────────────────────

function DetailPlaceholder() {
  return (
    <Card className="h-full">
      <div className="h-full flex flex-col items-center justify-center text-textTertiary gap-3 py-16">
        <svg
          className="w-14 h-14 opacity-40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <p className="text-sm font-medium">
          Selecione um moviber para ver os detalhes
        </p>
      </div>
    </Card>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Movibers() {
  const [movibers, setMovibers] = useState<MoviberResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MoviberResponse | null>(null);

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

  // resolve linkedUser do moviber selecionado para o painel de detalhes
  const selectedLinkedUser = selected
    ? users.find((u) => u.id === selected.linkedUserId)
    : undefined;

  function load(query?: string) {
    setLoading(true);

    const movibersPromise = query && query.trim()
      ? searchMovibers(query.trim())
      : getMovibers();

    Promise.all([movibersPromise, getUsers()])
      .then(([m, u]) => {
        setMovibers(m);
        setUsers(u);
        // mantém o moviber selecionado atualizado após reload
        setSelected(
          (prev) =>
            prev
              ? (m.find((x) => x.id === prev.id) ?? null)
              : (m[0] ?? null),
        );
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
        <h1 className="text-2xl font-bold text-textPrimary">Movibers</h1>
        <p className="text-sm text-textTertiary mt-1">
          Promoters da plataforma — ordenados por seguidores · {movibers.length}{" "}
          cadastrado{movibers.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ─── Formulário de Criação ─── */}
      <Card className="p-6">
        <h2 className="text-sm font-bold text-textSecondary mb-5 flex items-center gap-2">
          <span className="w-5 h-5 bg-primary bg-opacity-20 rounded-md flex items-center justify-center">
            <svg
              className="w-3 h-3 text-primary"
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
              className="w-full mt-1 px-3 py-2 border border-surfaceBorder rounded-xl bg-surface text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Selecione um usuário...</option>
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.displayName} ({u.email})
                </option>
              ))}
            </select>
            {availableUsers.length === 0 && !loading && (
              <p className="text-xs text-warning mt-1.5">
                Todos os usuários já possuem um Moviber vinculado.
              </p>
            )}
          </div>

          {/* ── Pré-visualização ── */}
          {selectedUser && (
            <div className="p-4 bg-surface rounded-xl border border-surfaceBorder">
              <p className="text-xs font-semibold text-textSecondary mb-3">
                Dados herdados do usuário:
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <span className="text-textTertiary">Nome:</span>
                  <p className="font-medium text-textPrimary">
                    {selectedUser.displayName}
                  </p>
                </div>
                <div>
                  <span className="text-textTertiary">E-mail:</span>
                  <p className="font-medium text-textPrimary">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <span className="text-textTertiary">Celular:</span>
                  <p className="font-medium text-textPrimary">
                    {selectedUser.cellPhoneNumber || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-textTertiary">CEP:</span>
                  <p className="font-medium text-textPrimary">
                    {selectedUser.cep || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Assinatura ── */}
          <div>
            <Label>Assinatura *</Label>
            <select
              value={subscription}
              onChange={(e) =>
                setSubscription(e.target.value as PromoterSubscription)
              }
              className="w-full mt-1 px-3 py-2 border border-surfaceBorder rounded-xl bg-surface text-textPrimary text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="NONE">
                Free — sem acesso a eventos premium
              </option>
              <option value="VIP_BALLADS_FOR_PROMOTERS">
                ★ VIP Baladas — eventos premium liberados
              </option>
            </select>
            <p className="text-xs text-textTertiary mt-1.5">
              {subscription === "VIP_BALLADS_FOR_PROMOTERS"
                ? "★ Permite criar eventos do tipo PREMIUM_BALLAD."
                : "Apenas eventos do tipo STANDARD."}
            </p>
          </div>

          {formError && <ErrorAlert message={formError} />}
          {success && (
            <div className="text-xs bg-success bg-opacity-10 border border-success text-success rounded-xl px-4 py-3 break-all">
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

      {/* ── Lista (1/3) + Detalhe (2/3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Lista compacta — 1/3 */}
        <div className="lg:col-span-1 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-14 text-primary gap-3">
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
          {!loading && error && <ErrorAlert message={error} />}
          {!loading && !error && movibers.length === 0 && (
            <EmptyState label="Nenhum moviber cadastrado ainda." />
          )}
          {movibers.map((m) => {
            const linkedUser = users.find((u) => u.id === m.linkedUserId);
            return (
              <MoviberRow
                key={m.id}
                moviber={m}
                linkedUser={linkedUser}
                selected={selected?.id === m.id}
                onSelect={setSelected}
              />
            );
          })}
        </div>

        {/* Painel de detalhes — 2/3 */}
        <div className="lg:col-span-2 sticky top-4">
          {selected ? (
            <MoviberDetail
              moviber={selected}
              linkedUser={selectedLinkedUser}
            />
          ) : (
            <DetailPlaceholder />
          )}
        </div>
      </div>
    </div>
  );
}
