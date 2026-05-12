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
  local: string | null;
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
  type: EventType;
  title: string;
  cep: string | null;
  numb: string | null;
  desc: string | null;
  image: string | null;
  startsAt: string;
  endsAt: string;
  userIds: string[];
  moviberIds: string[];
}

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
  /** @deprecated O backend define automaticamente baseado no usuário autenticado */
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

// ─── UI helpers ───────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  status: number;
}
