import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          setAuthState((prev) => ({ ...prev, error, isLoading: false }));
          return;
        }

        setAuthState({
          user: session?.user || null,
          session: session || null,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setAuthState((prev) => ({
          ...prev,
          error: err instanceof Error ? err : new Error('Unknown error'),
          isLoading: false,
        }));
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user || null,
        session: session || null,
        isLoading: false,
        error: null,
      });
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setAuthState({
          user: data.user || null,
          session: data.session || null,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sign up failed');
        setAuthState((prev) => ({ ...prev, error, isLoading: false }));
        return { success: false, error };
      }
    },
    []
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true }));
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setAuthState({
          user: data.user || null,
          session: data.session || null,
          isLoading: false,
          error: null,
        });

        return { success: true };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Sign in failed');
        setAuthState((prev) => ({ ...prev, error, isLoading: false }));
        return { success: false, error };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });

      setLocation('/login');
      return { success: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign out failed');
      setAuthState((prev) => ({ ...prev, error, isLoading: false }));
      return { success: false, error };
    }
  }, [setLocation]);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    isAuthenticated: authState.session !== null,
  };
}
