import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: { username: string; password: string }) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
      return { success: true };
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Please check your credentials',
      });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      toast.success('Logged out successfully');
      router.push('/');
      router.refresh();
      return { success: true };
    } catch (error: any) {
      toast.error('Logout failed');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    try {
      await update();
      return { success: true };
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return { success: false, error: 'Failed to refresh session' };
    }
  }, [update]);

  return {
    session,
    status,
    isLoading,
    isAuthenticated: status === 'authenticated',
    isUnauthenticated: status === 'unauthenticated',
    isSessionLoading: status === 'loading',
    login,
    logout,
    refreshSession,
  };
}