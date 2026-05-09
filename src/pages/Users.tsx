import { useEffect, useState } from "react";
import { getUsers, createUser } from "../services/api";
import {
  Card,
  EmptyState,
  ErrorAlert,
  Field,
  UserStatusBadge,
  Label,
  Input,
  Select,
  SubmitButton,
} from "../components/ui";
import UserEditModal from "../components/UserEditModal";
import type {
  UserResponse,
  CreateUserRequest,
  ApiError,
  UserStatus,
} from "../types";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  user,
  size = "md",
}: {
  user: UserResponse;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg"
      ? "w-16 h-16 text-xl"
      : size === "sm"
        ? "w-9 h-9 text-xs"
        : "w-12 h-12 text-sm";
  const initials = user.displayName
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.displayName}
        className={`${dim} rounded-xl object-cover shrink-0 ring-2 ring-white shadow-sm`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}
    >
      {initials}
    </div>
  );
}

// ─── User Card ────────────────────────────────────────────────────────────────

function UserCard({
  user,
  onEdit,
}: {
  user: UserResponse;
  onEdit: (u: UserResponse) => void;
}) {
  return (
    <Card className="p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar user={user} size="md" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 truncate leading-tight">
                {user.displayName}
              </p>
              <p className="text-xs font-mono text-gray-400 truncate mt-0.5">
                {user.id}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <UserStatusBadge status={user.status} />
              {/* Edit button */}
              <button
                onClick={() => onEdit(user)}
                className="p-1.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-all duration-150"
                title="Editar usuário"
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
              </button>
            </div>
          </div>

          {/* Fields row */}
          <div className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1.5">
            <Field label="E-mail" value={user.email} />
            <Field label="Celular" value={user.cellPhoneNumber} />
            <Field label="Telefone" value={user.telephoneNumber} />
            <Field label="CEP" value={user.cep} />
            {user.link && (
              <div className="col-span-2">
                <span className="text-xs text-gray-400 uppercase tracking-wide block">
                  Link
                </span>
                <a
                  href={
                    user.link.startsWith("http")
                      ? user.link
                      : `https://${user.link}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-violet-600 hover:underline font-medium truncate block"
                >
                  {user.link}
                </a>
              </div>
            )}
            {user.description && (
              <div className="col-span-2">
                <span className="text-xs text-gray-400 uppercase tracking-wide block">
                  Bio
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {user.description.length > 120
                    ? user.description.slice(0, 120) + "…"
                    : user.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Users() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // create form
  const [form, setForm] = useState<CreateUserRequest>({
    displayName: "",
    status: "ACTIVE",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // edit modal
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  function load() {
    setLoading(true);
    getUsers()
      .then(setUsers)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setSuccess(null);
    try {
      const created = await createUser(form);
      setSuccess(`Usuário "${created.displayName}" criado!`);
      setForm({ displayName: "", status: "ACTIVE" });
      load();
    } catch (e) {
      setFormError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  // Atualiza o usuário na lista local sem re-fetch completo
  function handleSaved(updated: UserResponse) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setEditingUser(null);
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-sm text-gray-500 mt-1">
          Contas base da plataforma · {users.length} cadastrado
          {users.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Create form ─── */}
        <Card className="p-6 lg:col-span-1 h-fit">
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
            Novo Usuário
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Nome de exibição *</Label>
              <Input
                required
                value={form.displayName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, displayName: e.target.value }))
                }
                placeholder="Ex: DJ Marquinhos"
              />
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    status: e.target.value as UserStatus,
                  }))
                }
              >
                <option value="ACTIVE">✅ Ativo</option>
                <option value="SUSPENDED">🚫 Suspenso</option>
              </Select>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value || undefined }))
                }
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label>Celular</Label>
              <Input
                value={form.cellPhoneNumber ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    cellPhoneNumber: e.target.value || undefined,
                  }))
                }
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value || undefined,
                  }))
                }
                placeholder="Breve bio…"
              />
            </div>

            {formError && <ErrorAlert message={formError} />}
            {success && (
              <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3">
                ✓ {success}
              </div>
            )}
            <SubmitButton loading={saving}>Criar usuário</SubmitButton>
          </form>
        </Card>

        {/* ─── Users list ─── */}
        <div className="lg:col-span-2 space-y-3">
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
              <span className="text-sm font-medium">Carregando usuários…</span>
            </div>
          )}
          {!loading && error && <ErrorAlert message={error} />}
          {!loading && !error && users.length === 0 && (
            <EmptyState label="Nenhum usuário cadastrado ainda." />
          )}
          {users.map((u) => (
            <UserCard key={u.id} user={u} onEdit={setEditingUser} />
          ))}
        </div>
      </div>

      {/* ─── Edit modal ─── */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
