import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api/v1' : 'http://localhost:5000/api/v1');

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: unknown) => void; reject: (r: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

const isTokenExpired = (token: string): boolean => {
  try {
    const payloadBase64 = token.split('.')[1];
    const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const decoded = JSON.parse(decodedJson) as { exp: number };
    const expDate = new Date(decoded.exp * 1000);
    return expDate.getTime() - Date.now() < 60000; // less than 60s
  } catch (e) {
    return true;
  }
};

// Auth endpoints that should NEVER trigger a token refresh attempt
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/forgot-password'];

const isAuthEndpoint = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((ep) => url.includes(ep));
};

// Request interceptor
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('hh-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        let accessToken = parsed?.state?.accessToken;
        
        if (accessToken && !isAuthEndpoint(config.url)) {
          if (isTokenExpired(accessToken)) {
            if (!isRefreshing) {
              isRefreshing = true;
              try {
                const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
                accessToken = res.data.data.accessToken;
                parsed.state.accessToken = accessToken;
                parsed.state.user = res.data.data.user;
                localStorage.setItem('hh-auth', JSON.stringify(parsed));
                processQueue(null, accessToken);
              } catch (refreshError) {
                processQueue(refreshError, null);
                localStorage.removeItem('hh-auth');
                window.dispatchEvent(new Event('auth-error'));
                return Promise.reject(refreshError);
              } finally {
                isRefreshing = false;
              }
            } else {
              accessToken = await new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
              });
            }
          }
          config.headers.Authorization = `Bearer ${accessToken}`;
        } else if (accessToken && isAuthEndpoint(config.url)) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch { /* ignore */ }
    }
  }
  return config;
}, (error) => Promise.reject(error));

// The AUTH_ENDPOINTS and isAuthEndpoint are defined above now.

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Never attempt token refresh on auth endpoints — prevents infinite loops
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken, user } = res.data.data;
        
        // Update Zustand store
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('hh-auth');
          if (stored) {
            try {
              const parsed = JSON.parse(stored);
              parsed.state.accessToken = accessToken;
              parsed.state.user = user;
              parsed.state.isAuthenticated = true;
              localStorage.setItem('hh-auth', JSON.stringify(parsed));
            } catch { /* ignore */ }
          }
        }

        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clean up stale auth state instead of hard redirect (prevents refresh loop)
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem('hh-auth');
            window.dispatchEvent(new Event('auth-error'));
          } catch { /* ignore */ }
        }
        return Promise.reject(refreshError);
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default api;

export const apiGet = <T>(url: string, params?: Record<string, unknown>) =>
  api.get<T>(url, { params }).then((r) => r.data);
export const apiPost = <T>(url: string, data?: unknown) =>
  api.post<T>(url, data).then((r) => r.data);
export const apiPut = <T>(url: string, data?: unknown) =>
  api.put<T>(url, data).then((r) => r.data);
export const apiDelete = <T>(url: string) =>
  api.delete<T>(url).then((r) => r.data);
export const apiUpload = <T>(url: string, formData: FormData) =>
  api.post<T>(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data);
