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

// ─── Instagram link helper ──────────────────────────────────────────────────

/**
 * Recebe qualquer formato de link Instagram e retorna
 * { href: URL completa, handle: '@username' }
 *
 * Formatos aceitos:
 *   francislin.reis
 *   @francislin.reis
 *   instagram.com/francislin.reis
 *   https://www.instagram.com/francislin.reis
 */
function parseInstagram(raw: string): { href: string; handle: string } | null {
  const clean = raw.trim();

  // Já é uma URL do Instagram
  const urlMatch = clean.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([\w._]+)\/?/i,
  );
  if (urlMatch) {
    return {
      href: `https://www.instagram.com/${urlMatch[1]}/`,
      handle: `@${urlMatch[1]}`,
    };
  }

  // É um handle (@francislin.reis ou francislin.reis) — sem espaço, sem outro domínio
  const isHandle =
    /^@?[\w.]{1,30}$/.test(clean) && !clean.includes("." + "com");
  if (isHandle) {
    const username = clean.replace(/^@/, "");
    return {
      href: `https://www.instagram.com/${username}/`,
      handle: `@${username}`,
    };
  }

  return null;
}

function InstagramLink({ link }: { link: string }) {
  const ig = parseInstagram(link);

  if (!ig) {
    // Fallback genérico para links que não são Instagram
    const href = link.startsWith("http") ? link : `https://${link}`;
    return (
      <div className="col-span-2">
        <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
          Link
        </span>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-violet-600 hover:underline font-medium truncate block"
        >
          {link}
        </a>
      </div>
    );
  }

  return (
    <div className="col-span-2">
      <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
        Instagram
      </span>
      <a
        href={ig.href}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-150"
      >
        {/* Instagram icon */}
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
        {ig.handle}
      </a>
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
            {user.link && <InstagramLink link={user.link} />}
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
