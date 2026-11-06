import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { clearAuthSessionCookies, getAuthTokenFromCookie } from '@/utils/cookies.util';

export const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || 'https://proyecto-asiscoup-g1.onrender.com';

/** Backend de UP News, terminado en /api. */
export const NEWS_API_BASE_URL = (import.meta.env.VITE_NEWS_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');

function attachAuthInterceptors(instance: AxiosInstance): AxiosInstance {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAuthTokenFromCookie();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        clearAuthSessionCookies();
        window.dispatchEvent(new CustomEvent('upnews:unauthorized'));
      }
      return Promise.reject(error);
    },
  );

  return instance;
}

export const authApiClient: AxiosInstance = attachAuthInterceptors(
  axios.create({
    baseURL: AUTH_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  }),
);

/** Cliente del backend de UP News. Si hay sesión, adjunta `Authorization: Bearer <token>`. */
export const newsApiClient: AxiosInstance = attachAuthInterceptors(
  axios.create({
    baseURL: NEWS_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
  }),
);

/**
 * Convierte cualquier error en un mensaje para mostrar.
 * El backend de UP News responde `{ error, codigo, campos? }`; el principal usa `mensaje` o `message`.
 */
export function mensajeDeError(error: unknown, porDefecto: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.';
    const data = error.response.data as { error?: string; mensaje?: string; message?: string; campos?: string[] } | undefined;
    const texto = data?.error || data?.mensaje || data?.message;
    if (texto) return data?.campos?.length ? `${texto} (${data.campos.join(', ')})` : texto;
  }
  if (error instanceof Error && error.message) return error.message;
  return porDefecto;
}

/** true si la petición fue cancelada (el componente cambió o se desmontó). */
export function fueCancelada(error: unknown): boolean {
  return axios.isCancel(error) || (error instanceof Error && error.name === 'AbortError');
}
