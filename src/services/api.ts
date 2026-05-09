import axios, { AxiosError } from "axios";
import type {
  ApiError,
  BaladaResponse,
  CreateBaladaRequest,
  CreateEventRequest,
  CreateMoviberRequest,
  CreateRsvpRequest,
  CreateUserRequest,
  UpdateUserRequest,
  EventResponse,
  HealthResponse,
  MoviberResponse,
  RsvpGoingResponse,
  UserResponse,
} from "../types";

const client = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

// ─── System ───────────────────────────────────────────────────────────────────

export const getHealth = () => unwrap<HealthResponse>(client.get("/health"));

// ─── Baladas ──────────────────────────────────────────────────────────────────

export const getBaladas = () =>
  unwrap<BaladaResponse[]>(client.get("/baladas"));

export const createBalada = (body: CreateBaladaRequest) =>
  unwrap<BaladaResponse>(client.post("/baladas", body));

// ─── Events ───────────────────────────────────────────────────────────────────

export const getEvents = () => unwrap<EventResponse[]>(client.get("/events"));

export const createEvent = (body: CreateEventRequest) =>
  unwrap<EventResponse>(client.post("/events", body));

// ─── Movibers ─────────────────────────────────────────────────────────────────

export const getMovibers = () =>
  unwrap<MoviberResponse[]>(client.get("/movibers"));

export const createMoviber = (body: CreateMoviberRequest) =>
  unwrap<MoviberResponse>(client.post("/movibers", body));

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = () => unwrap<UserResponse[]>(client.get("/users"));

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

export const getRsvps = () =>
  unwrap<RsvpGoingResponse[]>(client.get("/event-rsvps"));

export const createRsvp = (body: CreateRsvpRequest) =>
  unwrap<RsvpGoingResponse>(client.post("/event-rsvps", body));

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function unwrap<T>(promise: Promise<{ data: T }>): Promise<T> {
  try {
    const { data } = await promise;
    return data;
  } catch (err) {
    throw normalise(err);
  }
}

function normalise(err: unknown): ApiError {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? 0;
    const payload = err.response?.data;

    if (status === 0 || !err.response)
      return {
        status: 0,
        message:
          "Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8080.",
      };
    if (status === 404)
      return { status: 404, message: "Recurso não encontrado (404)." };
    if (status === 400)
      return {
        status: 400,
        message:
          payload?.error ?? payload?.message ?? "Requisição inválida (400).",
      };
    if (status === 503)
      return {
        status: 503,
        message: payload?.message ?? "Cloudinary não configurado no servidor.",
      };
    if (status === 413)
      return { status: 413, message: "Arquivo muito grande (413)." };

    return {
      status,
      message:
        payload?.error ?? payload?.message ?? `Erro inesperado (${status}).`,
    };
  }
  return { status: 0, message: String(err) };
}
