import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { AuthTokens, ApiError } from '@/types';

// URL base da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Criar instância do axios
export const api = axios.create({
  baseURL: API_BASE_URL, // SEM /api/v1 aqui
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// ============================================
// FUNÇÕES DE TOKEN
// ============================================

export const TOKEN_KEYS = {
  ACCESS: 'catalogai_access_token',
  REFRESH: 'catalogai_refresh_token',
} as const;

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEYS.REFRESH);
};

export const setTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEYS.ACCESS, tokens.access_token);
  localStorage.setItem(TOKEN_KEYS.REFRESH, tokens.refresh_token);
};

export const clearTokens = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
};

// ============================================
// INTERCEPTOR DE REQUEST
// ============================================

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR DE RESPONSE (REFRESH TOKEN)
// ============================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Se não for erro 401 ou já tentou renovar, rejeita
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Se já está renovando, adiciona à fila
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return api(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    try {
      // Tentar renovar o token
      const response = await axios.post<{ access_token: string; refresh_token: string }>(
        `${API_BASE_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken }
      );

      const { access_token, refresh_token: new_refresh_token } = response.data;

      // Salvar novos tokens
      setTokens({
        access_token,
        refresh_token: new_refresh_token,
        token_type: 'Bearer',
        expires_in: 900,
      });

      // Atualizar header da requisição original
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
      }

      // Processar fila de requisições pendentes
      processQueue(null, access_token);

      // Retentar a requisição original
      return api(originalRequest);
    } catch (refreshError) {
      // Falhou ao renovar, fazer logout
      processQueue(refreshError, null);
      clearTokens();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

// ============================================
// FUNÇÃO HELPER PARA TRATAR ERROS
// ============================================

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || 'Erro ao processar requisição';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Erro desconhecido';
};

// ============================================
// FUNÇÃO PARA UPLOAD DE ARQUIVOS
// ============================================

export const uploadFile = async (
  endpoint: string,
  formData: FormData,
  onProgress?: (progress: number) => void
) => {
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

export default api;