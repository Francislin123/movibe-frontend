// ─── Enums ────────────────────────────────────────────────────────────────────

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type EventType = "STANDARD" | "PREMIUM_BALLAD" | "NETWORK" | "OPEN";
export type PromoterSubscription = "NONE" | "VIP_BALLADS_FOR_PROMOTERS";
export type RsvpIntention =
  | "ONLY_DRINKS"
  | "FIND_PARTNER"
  | "JUST_DANCE"
  | "NETWORK"
  | "OPEN";

// ─── Dashboard Types ────────────────────────────────────────────────────────────

export interface DashboardMetricsResponse {
  totalBaladas: number;
  baladaGrowthRate: number;
  totalEvents: number;
  eventGrowthRate: number;
  totalMovibers: number;
  moviberGrowthRate: number;
  totalUsers: number;
  userGrowthRate: number;
  totalRsvps: number;
  rsvpGrowthRate: number;
  totalCheckIns: number;
  checkInGrowthRate: number;
  totalFollowers: number;
  followerGrowthRate: number;
  totalActiveEvents: number;
  activeEventGrowthRate: number;
  averageAttendanceRate: number;
}

export interface EventRankingResponse {
  id: string;
  title: string;
  image: string;
  confirmedCount: number;
  checkInCount: number;
  attendanceRate: number;
  eventDate: string;
  eventType: string;
}

export interface GrowthDataResponse {
  date: string;
  count: number; // Mantido para compatibilidade genérica
  userCount: number;
  eventCount: number;
  rsvpCount: number;
  checkInCount: number;
  followerCount: number; // Sincronizado com getFollowersGrowth do Java
}

/** * Interface para o novo gráfico de Rosca/Pizza
 */
export interface CategoryDistributionResponse {
  category: string;
  count: number;
}

/**
 * Interface específica para distribuição de tipos (se usar o enum EventType)
 */
export interface EventTypeDistributionResponse {
  eventType: string;
  count: number;
  percentage?: number;
}

export interface EventRsvpDetailResponse {
  id: string;
  title: string;
  image: string;
  startsAt: string;
  eventType: string;
  cep: string;
  description: string;
  confirmedCount: number;
  checkInCount: number;
  attendanceRate: number;
  confirmedUsers: UserRsvpInfo[];
}

export interface UserRsvpInfo {
  id: string;
  displayName: string;
  email: string;
  image: string;
  status: string;
  confirmedAt: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string;
  service: string;
}

export interface BaladaResponse {
  id: string;
  ownerUserId: string;
  tradeName: string;
  cnpj: string | null;
  reasonSocial: string | null;
  email: string | null;
  responsibleName: string | null;
  cep: string | null;
  numb: string | null;
  complemento: string | null;
  local: string | null;
  logradouro: string | null;
  numero: string | null;
  bairro: string | null;
  localidade: string | null;
  uf: string | null;
  description: string | null;
  cellPhoneNumber: string | null;
  telephoneNumber: string | null;
  rules: string | null;
  link: string | null;
  image: string | null;
  verified: boolean;
  hostedEventIds: string[];
  userIds: string[];
}

export interface EventResponse {
  id: string;
  hostBaladaId: string | null;
  hostBalada?: BaladaResponse;
  hostBaladaName?: string;
  type: EventType;
  title: string;
  category: string; // Adicionado para bater com a nova query de distribuição
  cep: string | null;
  numb: string | null;
  desc: string | null;
  image: string | null;
  startsAt: string;
  endsAt: string;
  userIds: string[];
  moviberIds: string[];
}

// ... Restante dos DTOs de Moviber, User e Request permanecem iguais ...
export interface MoviberResponse {
  id: string;
  linkedUserId: string;
  followerCount: number;
  cpf: string | null;
  name: string | null;
  email: string | null;
  responsibleName: string | null;
  cep: string | null;
  cellPhoneNumber: string | null;
  telephoneNumber: string | null;
  image: string | null;
  subscription: PromoterSubscription;
}

export interface UserResponse {
  id: string;
  displayName: string;
  cnpj: string | null;
  cpf: string | null;
  reasonSocial: string | null;
  email: string | null;
  responsibleName: string | null;
  cep: string | null;
  description: string | null;
  cellPhoneNumber: string | null;
  telephoneNumber: string | null;
  rules: string | null;
  image: string | null;
  link: string | null;
  birthDate: string | null;
  status: UserStatus;
}

export interface RsvpGoingResponse {
  id: number;
  eventId: string;
  userId: string;
  intention: RsvpIntention;
  decidedAt: string;
}

export interface EventUserResponse {
  id: string;
  eventId: string;
  userId: string;
  confirmedAt: string;
  user: UserResponse;
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface CreateUserRequest {
  displayName: string;
  status: UserStatus;
  email?: string;
  description?: string;
  cellPhoneNumber?: string;
  telephoneNumber?: string;
  cep?: string;
  link?: string;
  birthDate?: string;
}

export interface UpdateUserRequest {
  displayName: string;
  status: UserStatus;
  cnpj?: string;
  reasonSocial?: string;
  email?: string;
  responsibleName?: string;
  cep?: string;
  description?: string;
  cellPhoneNumber?: string;
  telephoneNumber?: string;
  rules?: string;
  image?: string;
  link?: string;
  birthDate?: string;
}

export interface CreateMoviberRequest {
  linkedUserId: string;
  followerCount: number;
  subscription: PromoterSubscription;
  name?: string;
  email?: string;
  cpf?: string;
  image?: string;
  responsibleName?: string;
  cep?: string;
  cellPhoneNumber?: string;
  telephoneNumber?: string;
}

export interface UpdateMoviberRequest {
  followerCount: number;
  subscription: PromoterSubscription;
  cpf?: string;
  name?: string;
  email?: string;
  responsibleName?: string;
  cep?: string;
  cellPhoneNumber?: string;
  telephoneNumber?: string;
  image?: string;
}

export interface CreateBaladaRequest {
  ownerUserId?: string;
  tradeName: string;
  cnpj?: string;
  email?: string;
  description?: string;
  cellPhoneNumber?: string;
  telephoneNumber?: string;
  local?: string;
  link?: string;
}

export interface CreateEventRequest {
  hostBaladaId: string;
  type: EventType;
  title: string;
  category: string; // Adicionado
  cep?: string;
  numb?: string;
  desc?: string;
  startsAt: string;
  endsAt: string;
}

export interface CreateRsvpRequest {
  userId: string;
  eventId: string;
  intention: RsvpIntention;
}

export interface CreateAddressRequest {
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export interface AddressResponse {
  id: string;
  baladaId: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  localidade: string;
  uf: string;
  createdAt: string;
}

export interface ApiError {
  message: string;
  status: number;
}