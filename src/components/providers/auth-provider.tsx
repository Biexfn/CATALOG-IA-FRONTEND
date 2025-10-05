'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

const PUBLIC_ROUTES = ['/login', '/register', '/', '/test-auth'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loadUser, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    // Carregar dados do usuário ao montar
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    // Aguardar carregamento inicial
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // Se não está autenticado e não está em rota pública
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
    }

    // Se está autenticado e está na página de login/register
    if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, pathname, isLoading, router]);

  // Mostrar loading apenas na primeira verificação
  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}