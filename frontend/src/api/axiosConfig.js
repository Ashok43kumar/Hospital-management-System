import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
});

// Request interceptor: attach Supabase JWT if available
api.interceptors.request.use(
  async (config) => {
    // Skip token for retried anonymous requests
    if (config._skipAuth) {
      delete config.headers.Authorization;
      return config;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      console.warn('[axiosConfig] Could not get Supabase session:', err.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor:
//  - Log errors with detail
//  - On 401, retry the SAME request WITHOUT the token.
//    This lets DRF's AllowAny endpoints work even when the JWT is bad/expired.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    const status = error.response?.status;
    const url = config?.url || 'unknown';
    const detail = error.response?.data?.detail || error.response?.data?.error || error.message;

    console.error(`[API ERROR] ${config?.method?.toUpperCase()} ${url} → ${status}: ${detail}`);

    // If 401 and we haven't already retried, retry without Authorization header.
    // The backend global DEFAULT_PERMISSION_CLASSES is AllowAny, so most
    // list/retrieve endpoints will succeed as anonymous.
    if (status === 401 && !config._retried) {
      console.log(`[axiosConfig] Retrying ${url} anonymously (without JWT)...`);
      config._retried = true;
      config._skipAuth = true;
      return api(config);
    }

    return Promise.reject(error);
  }
);

export default api;
