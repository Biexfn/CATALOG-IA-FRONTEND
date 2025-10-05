import { create } from 'zustand';
import { User, LoginCredentials, RegisterData } from '@/types';
import { authService } from '@/services/auth.service';
import { clearTokens } from '@/lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  /**
   * Fazer login
   */
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Tentando login:', credentials.email);
      const { user } = await authService.login(credentials);
      console.log('Login bem-sucedido:', user);
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro ao fazer login';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  /**
   * Registrar novo usuário
   */
  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log('Tentando registrar:', data);
      const { user } = await authService.register(data);
      console.log('Registro bem-sucedido:', user);
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      let errorMessage = 'Erro ao criar conta';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      set({ 
        error: errorMessage, 
        isLoading: false,
        isAuthenticated: false 
      });
      throw error;
    }
  },

  /**
   * Fazer logout
   */
  logout: async () => {
    set({ isLoading: true });
    
    try {
      await authService.logout();
    } finally {
      clearTokens();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: null
      });
    }
  },

  /**
   * Carregar dados do usuário atual
   */
  loadUser: async () => {
    if (!authService.isAuthenticated()) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    
    try {
      const user = await authService.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      clearTokens();
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  /**
   * Limpar erro
   */
  clearError: () => {
    set({ error: null });
  },
}));