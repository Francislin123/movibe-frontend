import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';
// ALTERAÇÃO CIRÚRGICA: Trocado getEvents por getEventsActive
import { getMovibers, searchMovibers, createMoviber, updateMoviberImage, getUsersByBalada, getAvailableUsersForMoviber, getEventsActive } from "../services/api";
import {
  Card,
  EmptyState,
  ErrorAlert,
  Input,
  Label,
  SubmitButton,
} from "../components/ui";
import SearchInput from "../components/SearchInput";
import MoviberEditModal from "../components/MoviberEditModal";
import type {
  MoviberResponse,
  CreateMoviberRequest,
  ApiError,
  PromoterSubscription,
  UserResponse,
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

// ─── Helpers: data binding fixes ────────────────────────────────────────────

function isUrlValue(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^(https?:\/\/|\/\/)/i.test(value) || /cloudinary\.com/i.test(value);
}

function sanitizeEmail(email: string | null | undefined): string | null {
  if (!email || isUrlValue(email)) return null;
  return email;
}

function normalizeMoviber(m: MoviberResponse): MoviberResponse {
  if (isUrlValue(m.email)) {
    return {
      ...m,
      image: m.image ?? m.email,
      email: null,
    };
  }
  return m;
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
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-sm hover:shadow-md hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-150"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {formatted}
    </a>
  );
}

// ─── Email pill (interactive link) ──────────────────────────────────────────

function EmailLink({ email }: { email: string | null | undefined }) {
  const safe = sanitizeEmail(email);
  if (!safe) {
    return <span className="text-sm text-textTertiary">—</span>;
  }
  return (
    <a
      href={`mailto:${safe}`}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/10 via-violet-500/10 to-indigo-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold shadow-sm hover:shadow-md hover:border-purple-500/40 hover:scale-[1.02] transition-all duration-150 max-w-full"
    >
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
      <span className="truncate">{safe}</span>
    </a>
  );
}

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
      ? "w-20 h-20 text-2xl rounded-2xl"
      : size === "sm"
        ? "w-11 h-11 text-sm rounded-xl"
        : "w-14 h-14 text-base rounded-xl";

  const image =
    moviber.image ||
    (isUrlValue(moviber.email) ? moviber.email : null) ||
    linkedUser?.image;
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
        className={`${dim} object-cover shrink-0 ring-2 ring-[#7B2FFF]/20 shadow-lg`}
      />
    );
  }

  return (
    <div
      className={`${dim} bg-gradient-to-br from-[#7B2FFF] to-[#A855F7] flex items-center justify-center text-white font-bold shrink-0 ring-2 ring-[#7B2FFF]/20 shadow-md`}
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
    sanitizeEmail(linkedUser?.email) ??
    sanitizeEmail(moviber.email) ??
    "—";

  return (
    <button
      onClick={() => onSelect(moviber)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 border ${
        selected
          ? "bg-gradient-to-r from-[#7B2FFF]/15 to-[#A855F7]/10 border-[#7B2FFF] shadow-[0_0_15px_rgba(123,47,255,0.15)]"
          : "bg-[#0B0B0F]/40 border-surfaceBorder hover:border-[#7B2FFF]/40 hover:bg-[#0B0B0F]/70"
      }`}
    >
      <MoviberAvatar moviber={moviber} linkedUser={linkedUser} size="sm" />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-semibold truncate leading-tight ${
            selected ? "text-white font-bold" : "text-textPrimary"
          }`}
        >
          {name}
        </p>
        <p
          className={`text-xs truncate mt-0.5 ${
            selected ? "text-[#B3B3C3]" : "text-textTertiary"
          }`}
        >
          {subtitle}
        </p>
      </div>

      <div className="text-right shrink-0">
        <span
          className={`text-sm font-bold block ${
            selected ? "text-[#A855F7]" : "text-textPrimary"
          }`}
          title={`${moviber.followerCount} seguidores`}
        >
          {moviber.followerCount}
        </span>
        <span className="text-[9px] block text-textTertiary font-semibold uppercase tracking-wider">
          seg.
        </span>
      </div>

      <div className="shrink-0 ml-1">
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            selected ? "text-[#7B2FFF] transform translate-x-0.5" : "text-textTertiary"
          }`}
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
      </div>
    </button>
  );
}

// ─── Detail panel ─────────────────────────────────────────────────────────────

function MoviberDetail({
  moviber,
  linkedUser,
  onEdit,
}: {
  moviber: MoviberResponse;
  linkedUser?: UserResponse;
  onEdit: (m: MoviberResponse) => void;
}) {
  const { t } = useTranslation();
  const subscriptionLabels: Record<string, string> = {
    NONE: t('subscriptionFree'),
    VIP_BALLADS_FOR_PROMOTERS: `★ ${t('subscriptionVip')}`,
  };

  return (
    <Card
      className="p-6 h-full flex flex-col gap-5 border border-surfaceBorder bg-gradient-to-b from-surface to-surface/90 relative overflow-hidden rounded-2xl"
      style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(254, 254, 254, 0.02)' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[100px] bg-gradient-to-b from-[#7B2FFF]/10 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-start gap-4 relative z-10">
        <MoviberAvatar moviber={moviber} linkedUser={linkedUser} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-textPrimary leading-tight truncate tracking-tight">
                {moviber.name ?? linkedUser?.displayName ?? "—"}
              </h2>
              {linkedUser && (
                <p className="text-xs text-[#A855F7] font-semibold truncate mt-1 flex items-center gap-1">
                  <span>👤</span>
                  <span className="text-textSecondary font-normal">{t('userLinked')}:</span>
                  <span className="text-white font-medium">{linkedUser.displayName}</span>
                </p>
              )}
            </div>

            <button
              onClick={() => onEdit(moviber)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surfaceBorder hover:border-[#7B2FFF]/40 bg-[#0B0B0F]/50 text-textSecondary hover:text-white text-xs font-medium transition-all duration-150 shrink-0 active:scale-95"
            >
              <svg className="w-3.5 h-3.5 text-[#7B2FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>{t('edit')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-surfaceBorder/60" />

      {/* Dados do moviber */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 relative z-10">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-textTertiary uppercase tracking-wider">{t('followers')}</span>
          <div className="mt-0.5">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-white text-xs font-semibold border ${
                moviber.followerCount > 100
                  ? "bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-400"
                  : "bg-[#0B0B0F]/40 border-surfaceBorder text-textSecondary"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{moviber.followerCount.toLocaleString('pt-BR')}</span>
              {moviber.followerCount > 100 && (
                <span className="text-[9px] font-bold uppercase tracking-wide bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
                  {t('free')}
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-textTertiary uppercase tracking-wider">{t('email')}</span>
          <div className="mt-0.5 max-w-full overflow-hidden">
            <EmailLink email={sanitizeEmail(moviber.email) ?? linkedUser?.email} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-textTertiary uppercase tracking-wider">{t('cpf')}</span>
          <div className="mt-0.5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#7B2FFF]/10 to-[#A855F7]/10 border border-[#7B2FFF]/20 text-[#A855F7] text-xs font-semibold shadow-sm">
              <svg className="w-3.5 h-3.5 text-[#7B2FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3 3 0 01-3-3V7a3 3 0 013-3h6a3 3 0 013 3v4a3 3 0 01-3 3h-1m-3-3v1m0-6v1m0 6H9" />
              </svg>
              <span className="text-white font-medium">{moviber.cpf ?? linkedUser?.cpf ?? '—'}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-textTertiary uppercase tracking-wider">{t('cellPhone')}</span>
          <div className="mt-0.5">
            <WhatsAppLink phone={moviber.cellPhoneNumber ?? linkedUser?.cellPhoneNumber ?? null} />
          </div>
        </div>

        <div className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-[10px] font-bold text-textTertiary uppercase tracking-wider">{t('subscription')}</span>
          <p className="text-xs font-bold text-textSecondary bg-[#0B0B0F]/40 border border-surfaceBorder rounded-xl px-3 py-2 mt-0.5 inline-block w-fit">
            {subscriptionLabels[moviber.subscription] ?? t('unknown')}
          </p>
        </div>
      </div>
    </Card>
  );
}

// ─── Empty detail placeholder ─────────────────────────────────────────────────

function DetailPlaceholder() {
  const { t } = useTranslation();
  return (
    <Card className="p-8 border border-surfaceBorder border-dashed bg-surface/30 rounded-2xl flex flex-col items-center justify-center text-center min-h-[220px]">
      <div className="w-12 h-12 rounded-full bg-surfaceBorder/40 flex items-center justify-center text-textTertiary mb-3">
        <svg className="w-6 h-6 opacity-50 text-[#7B2FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <p className="text-xs font-medium text-textTertiary max-w-[200px]">
        {t('selectToView', { entity: t('nav.movibers') })}
      </p>
    </Card>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

interface MovibersProps {
  baladaId?: string;
}

export default function Movibers({ baladaId }: MovibersProps) {
  const { t } = useTranslation();
  const [movibers, setMovibers] = useState<MoviberResponse[]>([]);
  const [users, setUsers] = useState<UserResponse[]>([]);
  // ADICIONADO: Estado para armazenar os eventos trazidos da API
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<MoviberResponse | null>(null);
  const [editingMoviber, setEditingMoviber] = useState<MoviberResponse | null>(null);

  // form
  const [open, setOpen] = useState(false);
  const [linkedUserId, setLinkedUserId] = useState("");
  // ADICIONADO: Estado para guardar o array de UUIDs dos eventos selecionados no form
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [subscription, setSubscription] =
    useState<PromoterSubscription>("NONE");
  const [cpf, setCpf] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedUser = users.find((u) => u.id === linkedUserId) ?? null;
  const linkedIds = new Set(movibers.map((m) => m.linkedUserId));
  const availableUsers = users.filter((u) => !linkedIds.has(u.id));

  const selectedLinkedUser = selected
    ? users.find((u) => u.id === selected.linkedUserId)
    : undefined;

  function load(query?: string) {
    setLoading(true);

    const movibersPromise = query && query.trim()
      ? searchMovibers(query.trim())
      : getMovibers();

    const usersPromise = baladaId
      ? getUsersByBalada(baladaId)
      : getAvailableUsersForMoviber();

    // ALTERAÇÃO CIRÚRGICA: Modificado para invocar a nova API de eventos ativos
    const eventsPromise = getEventsActive();

    Promise.all([movibersPromise, usersPromise, eventsPromise])
      .then(([rawMovibers, u, rawEvents]) => {
        const m = rawMovibers.map(normalizeMoviber);
        setMovibers(m);
        setUsers(u);
        setEvents(rawEvents || []); // Garante o array de eventos no estado
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

  function handleEdit(m: MoviberResponse) {
    setEditingMoviber(m);
  }

  function handleSaved(updated: MoviberResponse) {
    setMovibers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    setSelected(updated);
    setEditingMoviber(null);
  }

  function handleDeleted(id: string) {
    setMovibers((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) {
      setSelected(null);
    }
  }

  function handleFileChange(file: File | null) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFormError(t('maxSize'));
      return;
    }
    setFormError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // ADICIONADO: Helper para alternar a seleção dos eventos (Marcar/Desmarcar)
  function handleToggleEvent(eventId: string) {
    setSelectedEventIds(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
    setFormError(null);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!linkedUserId || !selectedUser) {
      setFormError(t('selectUser'));
      return;
    }
    if (!cpf || cpf.replace(/\D/g, '').length < 11) {
      setFormError(t('cpf') + ' ' + t('required') + '.');
      return;
    }
    // ADICIONADO: Regra de validação — Necessário pelo menos 1 evento selecionado
    if (selectedEventIds.length === 0) {
      setFormError("Selecione pelo menos um evento para este Moviber divulgar.");
      return;
    }

    setSaving(true);
    setFormError(null);
    setSuccess(null);

    try {
      const payload: CreateMoviberRequest & { eventIds?: string[] } = {
        linkedUserId,
        followerCount: 0,
        subscription,
        name: selectedUser.displayName,
        email: selectedUser.email ?? undefined,
        cpf: cpf.replace(/\D/g, ''),
        responsibleName: selectedUser.responsibleName ?? undefined,
        cep: selectedUser.cep ?? undefined,
        cellPhoneNumber: selectedUser.cellPhoneNumber ?? undefined,
        telephoneNumber: selectedUser.telephoneNumber ?? undefined,
        eventIds: selectedEventIds, // ADICIONADO: Enviando a lista de eventos acoplada ao payload
      };

      let created = normalizeMoviber(await createMoviber(payload));
      if (imageFile) {
        setImageLoading(true);
        try {
          created = await updateMoviberImage(created.id, imageFile);
        } catch (uploadErr) {
          setFormError(t('createEntity', { entity: 'Moviber' }) + ', ' + t('error'));
        } finally {
          setImageLoading(false);
        }
      }

      setSuccess(
        `${t('nav.movibers')} "${created.name ?? selectedUser.displayName}" ${t('created')}!`,
      );
      setLinkedUserId("");
      setSelectedEventIds([]); // ADICIONADO: Reset do campo de eventos
      setSubscription("NONE");
      setCpf("");
      setImageFile(null);
      setImagePreview(null);
      load();
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
    <div className="w-full max-w-7xl mx-auto space-y-6 px-2 sm:px-4 lg:px-6">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-textPrimary tracking-tight">
            {t('nav.movibers')}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-textTertiary font-medium uppercase tracking-wider">Divulgadores</span>
            <span className="text-lg font-bold text-textPrimary">
              {movibers.length} <span className="text-xs font-normal text-textSecondary">ativos</span>
            </span>
          </div>
          <div className="h-8 w-px bg-surfaceBorder/60 hidden sm:block" />
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-textTertiary font-medium uppercase tracking-wider">Selecionado</span>
            <span className="text-base font-bold text-[#A855F7] max-w-[150px] truncate">
              {selected ? (selected.name ?? selectedLinkedUser?.displayName) : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Create form (Premium Style Collapsible) ── */}
      <Card
        className="overflow-hidden border border-surfaceBorder bg-gradient-to-br from-surface to-surface/90"
        style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(254, 254, 254, 0.02)' }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#0B0B0F]/30 transition-colors duration-150 text-left"
        >
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-[#7B2FFF]/10 border border-[#7B2FFF]/30 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <svg className="w-4 h-4 text-[#7B2FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <div>
              <span className="text-sm font-bold text-textPrimary block">
                {t('newEntity', { entity: t('nav.movibers') })}
              </span>
              <p className="text-[11px] text-textTertiary">Cadastre um novo divulgador oficial na plataforma</p>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-textTertiary transition-transform duration-200 ${open ? "rotate-180 text-white" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="border-t border-surfaceBorder/60 px-5 py-5 bg-[#060609]/10">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Picker de usuário */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    <Label>{t('linkedUser')} *</Label>
                  </div>
                  <select
                    required
                    value={linkedUserId}
                    onChange={(e) => {
                      setLinkedUserId(e.target.value);
                      setFormError(null);
                    }}
                    className="w-full bg-[#0B0B0F]/60 border border-surfaceBorder rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#7B2FFF]/50 transition-all focus:ring-1 focus:ring-[#7B2FFF]/20 custom-select"
                  >
                    <option value="" className="bg-surface">{t('selectUser')}</option>
                    {availableUsers.map((u) => (
                      <option key={u.id} value={u.id} className="bg-surface">
                        {u.displayName} ({u.email || 'Sem e-mail'})
                      </option>
                    ))}
                  </select>
                  {availableUsers.length === 0 && !loading && (
                    <p className="text-xs text-amber-500/80 mt-1 pl-1 font-medium">
                      ⚠️ {t('allUsersLinked')}
                    </p>
                  )}
                </div>

                {/* CPF */}
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    <Label>{t('cpf')} *</Label>
                  </div>
                  <Input
                    value={cpf}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                      let formatted = raw;
                      if (raw.length > 9) {
                        formatted = raw.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                      } else if (raw.length > 6) {
                        formatted = raw.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
                      } else if (raw.length > 3) {
                        formatted = raw.replace(/(\d{3})(\d{3})/, '$1.$2');
                      }
                      setCpf(formatted);
                      setFormError(null);
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>

                {/* ADICIONADO: Seleção de Eventos Disponíveis (Grid de Checkboxes estilizados) */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    <Label>Eventos para Divulgação * (Mínimo 1)</Label>
                  </div>
                  {events.length === 0 ? (
                    <p className="text-xs text-textTertiary italic bg-[#0B0B0F]/30 border border-surfaceBorder rounded-xl p-3">
                      Nenhum evento disponível criado por você. Cadastre um evento antes de criar um Moviber.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-2 bg-[#0B0B0F]/40 border border-surfaceBorder rounded-xl subtle-scrollbar">
                      {events.map((evt) => {
                        const isChecked = selectedEventIds.includes(evt.id);
                        return (
                          <div
                            key={evt.id}
                            onClick={() => handleToggleEvent(evt.id)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-all duration-150 unselectable ${
                              isChecked
                                ? "bg-[#7B2FFF]/10 border-[#7B2FFF] text-white font-semibold"
                                : "bg-[#0B0B0F]/20 border-surfaceBorder/60 text-textSecondary hover:border-textTertiary"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-[#7B2FFF] pointer-events-none"
                            />
                            <span className="truncate">{evt.name || evt.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Assinatura */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-1">
                    <Label>{t('subscription')} *</Label>
                  </div>
                  <select
                    value={subscription}
                    onChange={(e) => setSubscription(e.target.value as PromoterSubscription)}
                    className="w-full bg-[#0B0B0F]/60 border border-surfaceBorder rounded-xl px-4 py-3 text-sm text-textPrimary focus:outline-none focus:border-[#7B2FFF]/50 transition-all focus:ring-1 focus:ring-[#7B2FFF]/20"
                  >
                    <option value="NONE" className="bg-surface">{t('subscriptionFree')}</option>
                    <option value="VIP_BALLADS_FOR_PROMOTERS" className="bg-surface">★ {t('subscriptionVip')}</option>
                  </select>
                  <p className="text-xs text-textTertiary pl-1 italic mt-1">
                    {subscription === "VIP_BALLADS_FOR_PROMOTERS"
                      ? '★ ' + t('subscriptionVipDesc')
                      : t('subscriptionFreeDesc')}
                  </p>
                </div>
              </div>

              {/* Upload de imagem */}
              <div className="p-4 rounded-xl bg-[#0B0B0F]/30 border border-surfaceBorder/50">
                <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider mb-2">
                  <Label>{t('clickToChangePhoto')}</Label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileChange(e.target.files?.[0] || null)}
                  />
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative w-16 h-16 rounded-2xl overflow-hidden border border-surfaceBorder hover:border-[#7B2FFF]/60 bg-[#0B0B0F]/60 cursor-pointer transition-all duration-200 group shadow-inner shrink-0"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : selectedUser?.image ? (
                      <img src={selectedUser.image} alt="User avatar" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-textTertiary group-hover:text-white transition-colors">
                        <svg className="w-5 h-5 text-[#7B2FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    {imageLoading && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-textSecondary font-medium">{t('imageHint')}</p>
                    <p className="text-[10px] text-textTertiary mt-0.5">{t('imageFormats')}</p>
                  </div>
                </div>
              </div>

              {/* Pré-visualização de Dados Herdados */}
              {selectedUser && (
                <div className="p-4 bg-gradient-to-br from-[#7B2FFF]/5 to-[#A855F7]/5 rounded-xl border border-[#7B2FFF]/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#7B2FFF]/5 rounded-full blur-xl pointer-events-none" />
                  <p className="text-[10px] font-bold text-[#A855F7] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7B2FFF] animate-pulse" />
                    {t('inheritedData')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <div className="bg-[#0B0B0F]/20 p-2 rounded-lg border border-surfaceBorder/30">
                      <span className="text-textTertiary font-medium block mb-0.5">{t('name')}:</span>
                      <p className="font-semibold text-textPrimary truncate">{selectedUser.displayName}</p>
                    </div>
                    <div className="bg-[#0B0B0F]/20 p-2 rounded-lg border border-surfaceBorder/30">
                      <span className="text-textTertiary font-medium block mb-0.5">{t('email')}:</span>
                      <p className="font-semibold text-textPrimary truncate">{selectedUser.email || "—"}</p>
                    </div>
                    <div className="bg-[#0B0B0F]/20 p-2 rounded-lg border border-surfaceBorder/30">
                      <span className="text-textTertiary font-medium block mb-0.5">{t('cellPhone')}:</span>
                      <p className="font-semibold text-textPrimary">{selectedUser.cellPhoneNumber || "—"}</p>
                    </div>
                    <div className="bg-[#0B0B0F]/20 p-2 rounded-lg border border-surfaceBorder/30">
                      <span className="text-textTertiary font-medium block mb-0.5">{t('cep')}:</span>
                      <p className="font-semibold text-textPrimary">{selectedUser.cep || "—"}</p>
                    </div>
                  </div>
                </div>
              )}

              {formError && <ErrorAlert message={formError} />}
              {success && (
                <div className="text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl px-4 py-3 font-semibold shadow-sm">
                  ✓ {success}
                </div>
              )}

              <div className="mt-4">
                <SubmitButton loading={saving}>{t('createMoviber')}</SubmitButton>
              </div>
            </form>
          </div>
        )}
      </Card>

      {/* ── Search input ── */}
      <Card className="p-4 border border-surfaceBorder shadow-sm bg-gradient-to-br from-surface to-surface/90">
        <SearchInput
          onSearch={handleSearch}
          loading={loading}
          placeholder={t('searchBy')}
        />
      </Card>

      {/* Layout Master/Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Lista Lateral */}
        <div className="lg:col-span-2">
          <Card className="p-5 border border-surfaceBorder shadow-inner bg-[#060609]/20 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-surfaceBorder/60 pb-3">
              <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider">
                {t('nav.movibers')} ({movibers.length})
              </h3>
            </div>

            <div className="space-y-2 lg:max-h-[460px] lg:overflow-y-auto pr-1 subtle-scrollbar">
              {loading && (
                <div className="flex items-center justify-center py-14 text-[#7B2FFF] gap-3">
                  <div className="w-5 h-5 border-2 border-[#7B2FFF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium text-textTertiary">{t('loadingData')}</span>
                </div>
              )}
              {!loading && error && <ErrorAlert message={error} />}
              {!loading && !error && movibers.length === 0 && (
                <EmptyState label={t('noEntity', { entity: t('nav.movibers') })} />
              )}
              {!loading && !error && movibers.map((m) => {
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
          </Card>
        </div>

        {/* Painel Fixo de Detalhes */}
        <div className="lg:sticky lg:top-6 lg:z-20">
          {selected ? (
            <MoviberDetail
              moviber={selected}
              linkedUser={selectedLinkedUser}
              onEdit={handleEdit}
            />
          ) : (
            <DetailPlaceholder />
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingMoviber && (
        <MoviberEditModal
          moviber={editingMoviber}
          linkedUser={users.find((u) => u.id === editingMoviber.linkedUserId)}
          onClose={() => setEditingMoviber(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}