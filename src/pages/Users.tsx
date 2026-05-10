import { useEffect, useState, useCallback, useRef } from "react";
import { getUsers, searchUsers, createUser, updateAvatar } from "../services/api";
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
      ? "w-20 h-20 text-2xl"
      : size === "sm"
        ? "w-9  h-9  text-xs"
        : "w-11 h-11 text-sm";

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
        className={`${dim} rounded-xl object-cover shrink-0 ring-2 ring-surface shadow-theme`}
      />
    );
  }
  return (
    <div
      className={`${dim} rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-textInverse font-bold shrink-0 shadow-theme`}
    >
      {initials}
    </div>
  );
}

// ─── Birth date helper ────────────────────────────────────────────────────────

function fmtBirthDate(value: string) {
  if (!value) return ''

  // Se está no formato ISO completo, pega apenas a data
  const datePart = value.includes('T') ? value.split('T')[0] : value
  
  const [year, month, day] = datePart.split('-')
  
  return `${day}/${month}/${year}`
}

// ─── Instagram link helper ────────────────────────────────────────────────────

function parseInstagram(raw: string): { href: string; handle: string } | null {
  const clean = raw.trim();
  const urlMatch = clean.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([\w._]+)\/?/i,
  );
  if (urlMatch)
    return {
      href: `https://www.instagram.com/${urlMatch[1]}/`,
      handle: `@${urlMatch[1]}`,
    };
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
    const href = link.startsWith("http") ? link : `https://${link}`;
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-violet-600 hover:underline font-medium truncate block"
      >
        {link}
      </a>
    );
  }
  return (
    <a
      href={ig.href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-150"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
      {ig.handle}
    </a>
  );
}

// ─── User row (lista compacta) ────────────────────────────────────────────────

function UserRow({
  user,
  selected,
  onSelect,
}: {
  user: UserResponse;
  selected: boolean;
  onSelect: (u: UserResponse) => void;
}) {
  return (
    <button
      onClick={() => onSelect(user)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-150 border ${
        selected
          ? "bg-violet-50 border-violet-200 shadow-sm"
          : "bg-white border-gray-100 hover:border-violet-100 hover:bg-violet-50/40 hover:shadow-sm"
      }`}
    >
      <Avatar user={user} size="sm" />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate leading-tight ${selected ? "text-violet-800" : "text-gray-800"}`}
        >
          {user.displayName}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {user.email ?? user.cellPhoneNumber ?? user.id.slice(0, 16) + "…"}
        </p>
      </div>
      <UserStatusBadge status={user.status} />
      {selected && (
        <svg
          className="w-4 h-4 text-violet-500 shrink-0"
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

// ─── User detail panel ────────────────────────────────────────────────────────

function UserDetail({
  user,
  onEdit,
}: {
  user: UserResponse;
  onEdit: (u: UserResponse) => void;
}) {
  return (
    <Card className="p-6 h-full flex flex-col gap-5">
      {/* Header: avatar grande + nome + badge + botão editar */}
      <div className="flex items-start gap-4">
        <Avatar user={user} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">
                {user.displayName}
              </h2>
              <p className="text-xs font-mono text-gray-400 mt-0.5 break-all">
                {user.id}
              </p>
            </div>
            <button
              onClick={() => onEdit(user)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-violet-300 hover:bg-violet-50 text-gray-500 hover:text-violet-600 text-xs font-medium transition-all duration-150 shrink-0"
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
          </div>
          <div className="mt-2">
            <UserStatusBadge status={user.status} />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Campos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
        <Field label="E-mail" value={user.email} />
        <Field label="Celular" value={user.cellPhoneNumber} />
        <Field label="Telefone" value={user.telephoneNumber} />
        <Field label="CEP" value={user.cep} />

        {user.birthDate && (
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1.5">
              Data de Nascimento
            </span>
            <p className="text-sm text-gray-700 font-medium">
              {fmtBirthDate(user.birthDate)}
            </p>
          </div>
        )}

        {user.link && (
          <div className="sm:col-span-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1.5">
              Instagram
            </span>
            <InstagramLink link={user.link} />
          </div>
        )}

        {user.description && (
          <div className="sm:col-span-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1.5">
              Bio
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">
              {user.description}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Empty detail placeholder ─────────────────────────────────────────────────

function DetailPlaceholder() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 py-16">
      <svg
        className="w-14 h-14"
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
        Selecione um usuário para ver os detalhes
      </p>
    </div>
  );
}

// ─── Create form (colapsável no topo) ────────────────────────────────────────

function CreateForm({ onCreated }: { onCreated: (u: UserResponse) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserRequest>({
    displayName: "",
    status: "ACTIVE",
    link: "",
    birthDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // ── image upload state ───────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── image file handler ────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica
    if (!file.type.startsWith('image/')) {
      setFormError('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setFormError('A imagem deve ter no máximo 5MB');
      return;
    }

    setFormError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    setSuccess(null);
    try {
      // 1. Cria o usuário
      let created = await createUser(form);
      
      // 2. Se escolheu imagem, faz o upload e captura o usuário atualizado
      if (imageFile) {
        created = await updateAvatar(created.id, imageFile);
      }
      
      setSuccess(`Usuário "${created.displayName}" criado!`);
      setForm({ displayName: "", status: "ACTIVE", link: "", birthDate: "" });
      setImageFile(null);
      setImagePreview(null);
      onCreated(created);
      setTimeout(() => {
        setSuccess(null);
        setOpen(false);
      }, 2000);
    } catch (e) {
      setFormError((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-violet-100 rounded-lg flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-violet-600"
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
          <span className="text-sm font-semibold text-gray-700">
            Novo Usuário
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Collapsible form */}
      {open && (
        <div className="border-t border-gray-100 px-5 py-5">
          <form onSubmit={handleSubmit}>
            {/* Upload de imagem */}
            <div className="mb-6">
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-200 shadow"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow">
                      +
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-md transition"
                    title="Adicionar foto"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Foto de perfil</p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-2 text-xs text-violet-600 hover:text-violet-800 font-medium transition"
                  >
                    {imageFile ? `✓ ${imageFile.name}` : 'Clique para adicionar foto de perfil'}
                  </button>
                  {imageFile && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-end">
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
                    setForm((f) => ({
                      ...f,
                      email: e.target.value || undefined,
                    }))
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
                <Label>Instagram</Label>
                <Input
                  value={form.link ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      link: e.target.value || undefined,
                    }))
                  }
                  placeholder="@username ou https://instagram.com/user"
                />
              </div>
              <div>
                <Label>Data de Nascimento</Label>
                <Input
                  type="date"
                  value={form.birthDate ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      birthDate: e.target.value || undefined,
                    }))
                  }
                />
              </div>
              <div>
                <SubmitButton loading={saving}>Criar usuário</SubmitButton>
              </div>
            </div>

            {formError && (
              <div className="mt-3">
                <ErrorAlert message={formError} />
              </div>
            )}
            {success && (
              <div className="mt-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-2.5">
                ✓ {success}
              </div>
            )}
          </form>
        </div>
      )}
    </Card>
  );
}

// ─── Search Input Component ───────────────────────────────────────────────────

function SearchInput({ 
  onSearch, 
  loading 
}: { 
  onSearch: (query: string) => void; 
  loading: boolean; 
}) {
  const [query, setQuery] = useState("");

  // Debounce de 500ms para evitar múltiplas requisições
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: number;
      return (searchQuery: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          onSearch(searchQuery);
        }, 500);
      };
    })(),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Buscar por nome, e-mail ou celular..."
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-150"
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg
            className="animate-spin w-4 h-4 text-violet-400"
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
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Users() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserResponse | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  function load(query?: string) {
    setLoading(true);
    
    const promise = query && query.trim() 
      ? searchUsers(query.trim()) 
      : getUsers();
    
    promise
      .then((list) => {
        setUsers(list);
        // Mantém o usuário selecionado atualizado após reload
        setSelected(
          (prev) =>
            prev
              ? (list.find((u) => u.id === prev.id) ?? null) // mantém selecionado após reload
              : (list[0] ?? null), // seleciona o primeiro na carga inicial
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

  function handleCreated(created: UserResponse) {
    setUsers((prev) =>
      [...prev, created].sort((a, b) =>
        a.displayName.localeCompare(b.displayName),
      ),
    );
    setSelected(created);
  }

  function handleSaved(updated: UserResponse) {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    setSelected(updated);
    setEditingUser(null);
  }

  return (
    <div className="space-y-4">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Contas base da plataforma · {users.length} cadastrado
            {users.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* ── Create form (top, colapsável) ── */}
      <CreateForm onCreated={handleCreated} />

      {/* ── Search input ── */}
      <Card className="p-4">
        <SearchInput onSearch={handleSearch} loading={loading} />
      </Card>

      {/* ── List + Detail ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Lista compacta — 1/3 */}
        <div className="lg:col-span-1 space-y-2">
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
          {!loading && error && <ErrorAlert message={error} />}
          {!loading && !error && users.length === 0 && (
            <EmptyState label="Nenhum usuário cadastrado ainda." />
          )}
          {users.map((u) => (
            <UserRow
              key={u.id}
              user={u}
              selected={selected?.id === u.id}
              onSelect={setSelected}
            />
          ))}
        </div>

        {/* Painel de detalhes — 2/3 */}
        <div className="lg:col-span-2 sticky top-4">
          {selected ? (
            <UserDetail user={selected} onEdit={setEditingUser} />
          ) : (
            <DetailPlaceholder />
          )}
        </div>
      </div>

      {/* ── Edit modal ── */}
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
