import axios, { AxiosError } from "axios";
import type { AxiosResponse } from "axios";
import type { 
  AddressResponse,
  BaladaResponse,
  CreateAddressRequest,
  CreateBaladaRequest,
  CreateEventRequest,
  CreateMoviberRequest,
  CreateRsvpRequest,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateMoviberRequest,
  EventResponse,
  EventRsvpDetailResponse,
  EventUserResponse,
  HealthResponse,
  MoviberResponse,
  RsvpGoingResponse,
  UserResponse,
} from "../types";

export const client = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

export const rsvpClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// ─── System ───────────────────────────────────────────────────────────────────

export const getHealth = () => unwrap<HealthResponse>(client.get("/health"));

// ─── Baladas ──────────────────────────────────────────────────────────────────

export const getBaladas = () =>
  unwrap<BaladaResponse[]>(client.get("/baladas"));

export const getBaladaById = (id: string) =>
  unwrap<BaladaResponse>(client.get(`/baladas/${id}`));

export const searchBaladas = (query?: string) => 
  unwrap<BaladaResponse[]>(client.get("/baladas/search", { params: { q: query } }));

export async function createBalada(data: CreateBaladaRequest): Promise<BaladaResponse> {
  const res = await client.post('/baladas', data)
  return res.data
}

export async function createBaladaWithImage(
  data: CreateBaladaRequest,
  imageFile?: File | null
): Promise<BaladaResponse> {
  // 1. Cria a balada
  const created = await createBalada(data)

  // 2. Se houver imagem, faz upload
  if (imageFile && created.id) {
    await updateBaladaImage(created.id, imageFile)
    // Retorna a balada atualizada com a imagem
    const updated = await client.get<BaladaResponse>(`/baladas/${created.id}`)
    return updated.data
  }

  return created
}

export async function updateBalada(id: string, data: Partial<BaladaResponse>): Promise<BaladaResponse> {
  const res = await client.put(`/baladas/${id}`, data)
  return res.data
}

export async function updateBaladaAddress(baladaId: string, addressId: string, data: CreateAddressRequest): Promise<AddressResponse> {
  const res = await client.put(`/baladas/${baladaId}/addresses/${addressId}`, data)
  return res.data
}

export const updateBaladaImage = (id: string, file: File, complemento?: string) => {
  const form = new FormData();
  form.append("file", file);
  if (complemento !== undefined && complemento !== null) {
    form.append("complemento", complemento);
  }
  return unwrap<BaladaResponse>(
    client.patch(`/baladas/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
};

// ─── Events ───────────────────────────────────────────────────────────────────

export const getEvents = () => unwrap<EventResponse[]>(client.get("/events"));

// ADICIONADO CIRURGICAMENTE: Nova chamada para obter apenas os eventos ativos e futuros do Owner
export const getEventsActive = () => unwrap<EventResponse[]>(client.get("/events/active"));

export const getEventsByBalada = async (baladaId: string): Promise<EventResponse[]> => {
  const events = await getEvents()
  const filtered = events.filter(e => e.hostBaladaId === baladaId)
  return filtered.filter((ev, idx, self) => idx === self.findIndex(e => e.id === ev.id))
};

export const searchEvents = (query?: string) =>
  unwrap<EventResponse[]>(client.get("/events/search", { params: { q: query } }));

export const createEvent = (body: CreateEventRequest) =>
  unwrap<EventResponse>(client.post("/events", body));

export const listEventMovibers = (eventId: string) =>
  unwrap<MoviberResponse[]>(client.get(`/events/${eventId}/movibers`));

export const linkEventMovibers = (eventId: string, moviberIds: string[]) =>
  unwrap<EventResponse>(client.post(`/events/${eventId}/movibers`, { moviberIds }));

export const unlinkEventMoviber = (eventId: string, moviberId: string) =>
  unwrap<EventResponse>(client.delete(`/events/${eventId}/movibers/${moviberId}`));

export const updateEventImage = (id: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return unwrap<EventResponse>(
    client.patch(`/events/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
};

export async function updateEvent(id: string, data: Partial<EventResponse>): Promise<EventResponse> {
  const res = await client.put(`/events/${id}`, data)
  return res.data
}

// ─── Movibers ─────────────────────────────────────────────────────────────────

export const getMovibers = () =>
  unwrap<MoviberResponse[]>(client.get("/movibers"));

export const searchMovibers = (query?: string) =>
  unwrap<MoviberResponse[]>(client.get("/movibers/search", { params: { q: query } }));

export const createMoviber = (body: CreateMoviberRequest) =>
  unwrap<MoviberResponse>(client.post("/movibers", body));

export const updateMoviberImage = (id: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return unwrap<MoviberResponse>(
    client.patch(`/movibers/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
};

export async function updateMoviber(id: string, data: UpdateMoviberRequest): Promise<MoviberResponse> {
  const res = await client.put(`/movibers/${id}`, data);
  return res.data;
}

export const deleteMoviber = (id: string) =>
  unwrap<void>(client.delete(`/movibers/${id}`));

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = () => unwrap<UserResponse[]>(client.get("/users"));

export const getAvailableUsersForMoviber = () =>
  unwrap<UserResponse[]>(client.get("/users/available-as-moviber"));

export const getUsersByBalada = (baladaId: string) =>
  unwrap<UserResponse[]>(client.get(`/users/by-balada/${baladaId}`));

export const searchUsers = (query?: string) =>
  unwrap<UserResponse[]>(client.get("/users/search", { params: { q: query } }));

export const createUser = (body: CreateUserRequest) =>
  unwrap<UserResponse>(client.post("/users", body));

export const updateUser = (id: string, body: UpdateUserRequest) =>
  unwrap<UserResponse>(client.put(`/users/${id}`, body));

export const updateAvatar = (id: string, file: File) => {
  const form = new FormData();
  form.append("file", file);
  return unwrap<UserResponse>(
    client.patch(`/users/${id}/avatar`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
};

// ─── RSVPs ────────────────────────────────────────────────────────────────────

export const getEventRsvps = () =>
  unwrap<EventRsvpDetailResponse[]>(rsvpClient.get("/dashboard/rsvps"));

export const getEventRsvpDetails = (eventId: string) =>
  unwrap<EventRsvpDetailResponse>(rsvpClient.get(`/dashboard/rsvps/event/${eventId}`));

export const createRsvp = (body: CreateRsvpRequest) =>
  unwrap<RsvpGoingResponse>(client.post("/event-rsvps", body));

// ─── Event Users ───────────────────────────────────────────────────────────────

export const getEventUsers = async (eventId: string): Promise<EventUserResponse[]> => {
  // Buscar todos os eventos para encontrar o evento específico e obter os userIds
  const events = await getEvents();
  const event = events.find(e => e.id === eventId);

  if (!event || !event.userIds || event.userIds.length === 0) {
    return [];
  }

  // Buscar todos os usuários (poderia ser otimizado com cache no futuro)
  const allUsers = await getUsers();

  // Filtrar usuários que estão confirmados no evento
  const confirmedUsers = allUsers.filter(user => event.userIds.includes(user.id));

  // Criar EventUserResponse para cada usuário confirmado
  const eventUsers: EventUserResponse[] = confirmedUsers.map((user) => ({
    id: `${eventId}-user-${user.id}`,
    eventId: eventId,
    userId: user.id,
    confirmedAt: new Date().toISOString(), // Data atual como placeholder
    user: user
  }));

  // Retornar usuários ordenados alfabeticamente
  return eventUsers.sort((a, b) => a.user.displayName.localeCompare(b.user.displayName));
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const unwrap = <T>(promise: Promise<AxiosResponse<T>>): Promise<T> =>
  promise.then((response) => response.data).catch((e: AxiosError) => {
    const message = (e.response?.data as any)?.message ?? e.message;
    throw new Error(message);
  });