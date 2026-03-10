import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './use-auth';

export type UserRole = 'ORG_ADMIN' | 'HEAD_OFFICE' | 'VENUE_MANAGER' | 'SUPERVISOR' | 'STAFF';

export interface UserMembership {
  role: UserRole;
  venue_id: string | null;
}

export function useRole() {
  const { user, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasValidMembership, setHasValidMembership] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setHasValidMembership(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Try to fetch from memberships table first
        const { data: membershipData, error: membershipError } = await supabase
          .from('memberships')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!membershipError && membershipData) {
          setRole(membershipData.role as UserRole);
          setHasValidMembership(true);
          setError(null);
          setIsLoading(false);
          return;
        }

        // Try to fetch from venue_memberships table
        const { data: venueMembershipData, error: venueMembershipError } = await supabase
          .from('venue_memberships')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!venueMembershipError && venueMembershipData) {
          setRole(venueMembershipData.role as UserRole);
          setHasValidMembership(true);
          setError(null);
          setIsLoading(false);
          return;
        }

        // No valid membership found
        setRole(null);
        setHasValidMembership(false);
        setError(null);
        setIsLoading(false);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch role');
        setError(error);
        setRole(null);
        setHasValidMembership(false);
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchRole();
    }
  }, [user, authLoading]);

  const getDefaultRoute = (): string => {
    if (!role) return '/app/no-access';

    switch (role) {
      case 'ORG_ADMIN':
      case 'HEAD_OFFICE':
      case 'VENUE_MANAGER':
      case 'SUPERVISOR':
        return '/app/rota-builder';
      case 'STAFF':
        return '/app/rota';
      default:
        return '/app/no-access';
    }
  };

  const isManager = (): boolean => {
    return role ? ['ORG_ADMIN', 'HEAD_OFFICE', 'VENUE_MANAGER', 'SUPERVISOR'].includes(role) : false;
  };

  return {
    role,
    isLoading: authLoading || isLoading,
    error,
    hasValidMembership,
    getDefaultRoute,
    isManager,
  };
}
