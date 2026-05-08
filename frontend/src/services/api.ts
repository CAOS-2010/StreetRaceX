// Axios API client with JWT injection

import axios, { AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────────────

export const authApi = {
  register: (data: { username: string; email: string; password: string; zona_ciudad?: string; zona_pais?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// ── Users ─────────────────────────────────────────────────────────

export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: Partial<{ username: string; foto_perfil: string; zona_ciudad: string; zona_pais: string }>) =>
    api.patch('/users/me', data),
  getById: (id: string) => api.get(`/users/${id}`),
  discover: (params?: { zona_ciudad?: string; zona_pais?: string; page?: number; limit?: number }) =>
    api.get('/users/discover', { params }),
};

// ── Vehicles ──────────────────────────────────────────────────────

export const vehicleApi = {
  create: (data: {
    tipo_vehiculo: string;
    marca: string;
    modelo: string;
    anio: number;
    color?: string;
    placa?: string;
    modificaciones?: string;
  }) => api.post('/vehicles', data),
  getAll: () => api.get('/vehicles'),
  update: (id: string, data: Partial<{ marca: string; modelo: string; color: string; modificaciones: string }>) =>
    api.patch(`/vehicles/${id}`, data),
  delete: (id: string) => api.delete(`/vehicles/${id}`),
  activate: (id: string) => api.patch(`/vehicles/${id}/activate`),
};

// ── Challenges ────────────────────────────────────────────────────

export const challengeApi = {
  create: (data: {
    retado_id: string;
    tipo_carrera: string;
    ubicacion_acordada?: string;
    fecha_acordada?: string;
    notas?: string;
  }) => api.post('/challenges', data),
  updateStatus: (id: string, estado: string) =>
    api.patch(`/challenges/${id}/status`, { estado }),
  registerResult: (id: string, ganador_id: string) =>
    api.post(`/challenges/${id}/result`, { ganador_id }),
  getHistory: (params?: { rol?: string; estado?: string; page?: number }) =>
    api.get('/challenges/history', { params }),
  cancel: (id: string) => api.delete(`/challenges/${id}`),
};

// ── Notifications ─────────────────────────────────────────────────

export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/notifications', { params }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
