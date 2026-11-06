import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { clearAuthSessionCookies, getAuthTokenFromCookie } from '@/utils/cookies.util';

export const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || 'https://proyecto-asiscoup-g1.onrender.com';

export const NEWS_API_BASE_URL =
  import.meta.env.VITE_NEWS_API_URL || 'http://localhost:3000/api';

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
    headers: {
      'Content-Type': 'application/json',
    },
  }),
);

export const newsApiClient: AxiosInstance = attachAuthInterceptors(
  axios.create({
    baseURL: NEWS_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  }),
);
