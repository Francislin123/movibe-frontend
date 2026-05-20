import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from 'react-i18next';
import { getUsers, searchUsers, createUser, updateAvatar, getEvents } from "../services/api";
import {
  Card,
  EmptyState,
  ErrorAlert,
  Label,
  Input,
  Select,
  SubmitButton,
  Textarea,
  ReadOnlyField,
  ReadOnlyTextarea,
} from "../components/ui";
import UserEditModal from "../components/UserEditModal";
import type {
  UserResponse,
  CreateUserRequest,
  ApiError,
  UserStatus,
} from "../types";

// ─── Phone mask function ───────────────────────────────────────────────────────

function formatPhone(value: string | undefined): string {
  if (!value) return "";
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return value;
}

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

  const initials = (user.displayName || "U")
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.displayName || ""}
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

// ─── Age calculation helper ────────────────────────────────────────────────────

function calculateAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  
  const datePart = birthDate.includes('T') ? birthDate.split('T')[0] : birthDate;
  const [year, month, day] = datePart.split('-').map(Number);
  
  const today = new Date();
  const birth = new Date(year, month - 1, day);
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
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

// ─── Email link component ───────────────────────────────────────────────────────

function EmailLink({ email }: { email: string | null }) {
  if (!email) {
    return <span className="text-sm text-textTertiary">—</span>;
  }

  return (
    <a
      href={`mailto:${email}`}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-150"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
      {email}
    </a>
  );
}

// ─── WhatsApp link component ────────────────────────────────────────────────────

function WhatsAppLink({ phone }: { phone: string | null }) {
  if (!phone) {
    return <span className="text-sm text-textTertiary">—</span>;
  }

  const cleaned = phone.replace(/\D/g, "");
  const formatted = formatPhone(phone);

  return (
    <a
      href={`https://wa.me/55${cleaned}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:scale-105 transition-all duration-150"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {formatted}
    </a>
  );
}

// ─── User row (lista compacta) ────────────────────────────────────────────────

function UserRowStatusBadge({
  status,
  selected = false,
}: {
  status?: UserStatus | string | null;
  selected?: boolean;
}) {
  const { t } = useTranslation();
  const statusConfig: Record<string, { label: string; classes: string }> = {
    ACTIVE: { label: t('active'), classes: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]' },
    INACTIVE: { label: t('inactive'), classes: 'bg-zinc-800/80 border-zinc-700 text-zinc-400' },
    SUSPENDED: { label: t('suspended'), classes: 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]' },
  };

  // fallback seguro
  const config = status
    ? statusConfig[status]
    : null;

  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${selected ? "text-white" : config?.classes ?? "text-textSecondary"}`}
    >
      {config?.label ?? t('unknown')}
    </span>
  );
}

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
          ? "bg-primary border-primary shadow-lg"
          : "bg-surface border-surfaceBorder hover:border-primary hover:bg-surfaceHover hover:shadow-md"
      }`}
      style={{
        boxShadow: selected ? `0 0 0 1px rgba(124, 58, 237, 0.5)` : 'none'
      }}
    >
      <Avatar user={user} size="sm" />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate leading-tight ${selected ? "text-white" : "text-textPrimary hover:text-primary"}`}
        >
          {user.displayName || "Cliente sem nome"}
        </p>
        <p className={`text-xs truncate mt-0.5 ${selected ? "text-white font-medium" : "text-textTertiary hover:text-textPrimary"}`}>
          {user.email ?? user.cellPhoneNumber ?? "—"}
        </p>
      </div>
      <UserRowStatusBadge status={user.status} selected={selected} />
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

// ─── User detail panel ────────────────────────────────────────────────────────

function UserDetail({
  user,
  onEdit,
}: {
  user: UserResponse;
  onEdit: (u: UserResponse) => void;
}) {
  const { t } = useTranslation();
  const statusLabels: Record<string, string> = {
    ACTIVE: t('active'),
    INACTIVE: t('inactive'),
    SUSPENDED: t('suspended'),
  };

  return (
    <Card className="p-6 h-full flex flex-col gap-5">
      {/* Header: avatar grande + nome + badge + botão editar */}
      <div className="flex items-start gap-4">
        <Avatar user={user} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-textPrimary leading-tight truncate">
                {user.displayName || "—"}
              </h2>
              <p className="text-xs font-mono text-textTertiary mt-0.5 flex items-center gap-1">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z" />
                </svg>
                {t('age')}: {calculateAge(user.birthDate) ?? "—"} {calculateAge(user.birthDate) ? t('years') : ""}
              </p>
            </div>
            <button
              onClick={() => onEdit(user)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surfaceBorder hover:border-primary hover:bg-primary hover:bg-opacity-10 text-textSecondary hover:text-primary text-xs font-medium transition-all duration-150 shrink-0"
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
              {t('edit')}
            </button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-surfaceBorder" />

      {/* Campos padronizados com bordas roxas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
        <ReadOnlyField label={t('email')} value={<EmailLink email={user.email} />} />
        <ReadOnlyField
          label={t('status')}
          value={
            <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${
              user.status === 'ACTIVE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]' :
              user.status === 'INACTIVE' ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400' :
              user.status === 'SUSPENDED' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]' :
              'text-textSecondary'
            }`}>
              {statusLabels[user.status as UserStatus] ?? t('unknown')}
            </span>
          }
        />
        <ReadOnlyField label={t('cellPhone')} value={<WhatsAppLink phone={user.cellPhoneNumber} />} />

        {user.birthDate && (
          <ReadOnlyField
            label={t('birthDate')}
            value={
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
                </svg>
                <span className="text-purple-400 font-bold">{fmtBirthDate(user.birthDate)}</span>
              </div>
            }
            className="bg-gradient-to-r from-purple-950/40 via-zinc-900/50 to-zinc-950/20 border border-purple-500/20"
          />
        )}

        {user.link && (
          <ReadOnlyField 
            label={t('instagram')} 
            value={<InstagramLink link={user.link} />}
          />
        )}

        {user.description && (
          <div className="sm:col-span-2">
            <ReadOnlyTextarea 
              label={t('bio')} 
              value={user.description} 
            />
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Empty detail placeholder ─────────────────────────────────────────────────

function DetailPlaceholder() {
  const { t } = useTranslation();
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
        {t('selectToView', { entity: t('nav.users') })}
      </p>
    </div>
  );
}

// ─── Create form (colapsável no topo) ────────────────────────────────────────

function CreateForm({ onCreated, events }: { onCreated: (u: UserResponse) => void; events: any[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateUserRequest>({
    displayName: "",
    status: "ACTIVE",
    link: "",
    birthDate: "",
    address: undefined,
  });
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
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
      setFormError('Invalid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setFormError(t('maxSize'));
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
      let created = await createUser({ ...form, eventIds: selectedEventIds });
      
      // 2. Se escolheu imagem, faz o upload e captura o usuário atualizado
      if (imageFile) {
        created = await updateAvatar(created.id, imageFile);
      }
      
      setSuccess(`${t('nav.users')} "${created.displayName}" ${t('created')}!`);
      setForm({ displayName: "", status: "ACTIVE", link: "", birthDate: "", address: undefined });
      setSelectedEventIds([]);
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

  function handleToggleEvent(eventId: string) {
    setSelectedEventIds(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Toggle bar */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surfaceHover transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-primary-20 rounded-lg flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-primary"
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
          <span className="text-sm font-semibold text-textPrimary">
            {t('newEntity', { entity: t('nav.user') })}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-textTertiary transition-transform duration-200 ${open ? "rotate-180" : ""}`}
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
        <div className="border-t border-surfaceBorder px-5 py-5">
          <form onSubmit={handleSubmit}>
            {/* Upload de imagem */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="relative shrink-0 group cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-primary border-dashed hover:border-solid shadow-lg transition-all duration-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-surface border-2 border-primary border-dashed hover:border-solid hover:bg-surfaceHover flex items-center justify-center text-primary text-2xl font-bold shadow-lg transition-all duration-200 group-hover:scale-105">
                      +
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileRef.current?.click();
                    }}
                    className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary hover:bg-primaryHover text-textInverse flex items-center justify-center shadow-md transition"
                    title={t('clickToAddPhoto')}
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
                <div className="flex flex-col items-start">
                  <p className="text-sm font-semibold text-textPrimary">+ {t('clickToChangePhoto')}</p>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="mt-1.5 text-xs text-primary hover:text-primaryHover font-medium transition"
                  >
                    {imageFile ? `✓ ${imageFile.name}` : t('clickToAddPhoto')}
                  </button>
                  {imageFile && (
                    <p className="text-xs text-textTertiary mt-0.5">
                      {(imageFile.size / 1024).toFixed(0)} KB · {imageFile.type}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 items-end">
              <div>
                <Label>{t('displayName')} *</Label>
                <Input
                  required
                  value={form.displayName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayName: e.target.value }))
                  }
                  placeholder={t('placeholderName')}
                />
              </div>
              <div>
                <Label>{t('status')} *</Label>
                <Select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as UserStatus,
                    }))
                  }
                >
                  <option value="ACTIVE">{t('statusActive')}</option>
                  <option value="SUSPENDED">{t('statusSuspended')}</option>
                </Select>
              </div>
              <div>
                <Label>{t('email')}</Label>
                <Input
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      email: e.target.value || undefined,
                    }))
                  }
                  placeholder={t('placeholderEmail')}
                />
              </div>
              <div>
                <Label>{t('cellPhone')}</Label>
                <Input
                  value={formatPhone(form.cellPhoneNumber)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setForm((f) => ({
                      ...f,
                      cellPhoneNumber: value || undefined,
                    }));
                  }}
                  placeholder={t('placeholderPhone')}
                  maxLength={15}
                />
              </div>
              <div>
                <Label>{t('instagram')}</Label>
                <Input
                  value={form.link ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      link: e.target.value || undefined,
                    }))
                  }
                  placeholder={t('placeholderInstagram')}
                />
              </div>
              <div>
                <Label>{t('birthDate')}</Label>
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
            </div>

            {/* Event selection (optional) */}
            <div className="mt-4">
              <Label>Eventos (Opcional)</Label>
              {events.length === 0 ? (
                <p className="text-xs text-zinc-500 italic mt-1">
                  Nenhum evento disponível.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-2 mt-2 bg-zinc-950/40 border border-zinc-800/80 rounded-xl">
                  {events.map((evt) => {
                    const isChecked = selectedEventIds.includes(evt.id);
                    return (
                      <div
                        key={evt.id}
                        onClick={() => handleToggleEvent(evt.id)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all duration-150 ${
                          isChecked
                            ? "bg-purple-500/10 border-purple-500 text-white font-semibold shadow-md"
                            : "bg-zinc-900/40 border-zinc-800/60 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          readOnly
                          className="accent-purple-500 pointer-events-none"
                        />
                        <span className="truncate">{evt.name || evt.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4">
              <Label>{t('bio')}</Label>
              <Textarea
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    description: e.target.value || undefined,
                  }))
                }
                placeholder={t('placeholderDesc')}
                rows={3}
              />
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

            <div className="mt-4">
              <SubmitButton loading={saving}>Criar Cliente</SubmitButton>
            </div>
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
  const { t } = useTranslation();
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
          className="w-4 h-4 text-textTertiary"
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
        placeholder={t('searchBy')}
        className="w-full pl-10 pr-4 py-2.5 border border-surfaceBorder rounded-xl bg-surface text-sm text-textPrimary placeholder-textTertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-150"
      />
      {loading && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <svg
            className="animate-spin w-4 h-4 text-primary"
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
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserResponse | null>(null);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);

  function load(query?: string) {
    setLoading(true);
    
    Promise.all([
      query && query.trim() ? searchUsers(query.trim()) : getUsers(),
      getEvents()
    ])
      .then(([usersList, eventsList]) => {
        setUsers(usersList);
        setEvents(eventsList);
        // Mantém o usuário selecionado atualizado após reload
        setSelected(
          (prev) =>
            prev
              ? (usersList.find((u) => u.id === prev.id) ?? null) // mantém selecionado após reload
              : (usersList[0] ?? null), // seleciona o primeiro na carga inicial
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
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('nav.users')}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {users.length === 1 ? t('entityCount', { count: users.length }) : t('entityCountPlural', { count: users.length })}
          </p>
        </div>
      </div>

      {/* ── Create form (primeiro, antes da pesquisa) ── */}
      <CreateForm onCreated={handleCreated} events={events} />

      {/* ── Search input (depois do create form) ── */}
      <Card className="p-4">
        <SearchInput onSearch={handleSearch} loading={loading} />
      </Card>

      {/* ── User list (antes dos detalhes, com altura limitada) ── */}
      <div className="lg:max-h-80 lg:overflow-y-auto">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-textPrimary">
              {t('nav.users')} ({users.length})
            </h3>
            {selected && (
              <div className="text-xs text-textTertiary">
                {t('selected')}: {selected.displayName}
              </div>
            )}
          </div>

          <div className="space-y-2">
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
                <span className="text-sm font-medium">{t('loadingData')}</span>
              </div>
            )}
            {!loading && error && <ErrorAlert message={error} />}
            {!loading && !error && users.length === 0 && (
              <EmptyState label={t('noEntity', { entity: t('nav.users') })} />
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
        </Card>
      </div>

      {/* ── User details panel (fixo sem ficar atrás da lista) ── */}
      <div className="lg:sticky lg:top-6 lg:z-20">
        {selected ? (
          <UserDetail user={selected} onEdit={setEditingUser} />
        ) : (
          <DetailPlaceholder />
        )}
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
