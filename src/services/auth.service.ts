import api, { setTokens, clearTokens } from '@/lib/api';
import { 
  AuthTokens, 
  LoginCredentials, 
  RegisterData, 
  User,
} from '@/types';

// Interface para a resposta do backend
interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export const authService = {
  /**
   * Registrar novo usuário
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<AuthResponse>('/api/v1/auth/register', data);
    
    const tokens: AuthTokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      token_type: 'Bearer',
      expires_in: 900,
    };
    
    setTokens(tokens);
    
    const user: User = {
      id: response.data.user.id,
      name: response.data.user.name,
      email: response.data.user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return { user, tokens };
  },

  /**
   * Fazer login
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await api.post<AuthResponse>('/api/v1/auth/login', credentials);
    
    const tokens: AuthTokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      token_type: 'Bearer',
      expires_in: 900,
    };
    
    setTokens(tokens);
    
    const user: User = {
      id: response.data.user.id,
      name: response.data.user.name,
      email: response.data.user.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return { user, tokens };
  },

  /**
   * Renovar access token usando refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await api.post<TokenResponse>('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    const tokens: AuthTokens = {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      token_type: 'Bearer',
      expires_in: 900,
    };
    
    setTokens(tokens);
    
    return tokens;
  },

  /**
   * Fazer logout
   */
  async logout(): Promise<void> {
    clearTokens();
  },

  /**
   * Obter dados do usuário autenticado
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<{
      id: string;
      email: string;
      name: string;
    }>('/api/v1/users/me');
    
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * Verificar se usuário está autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('catalogai_access_token');
    return !!token;
  },
};