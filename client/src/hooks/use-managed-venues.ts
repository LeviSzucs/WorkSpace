import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './use-auth';
import { useRole } from './use-role';

export interface Venue {
  id: string;
  name: string;
}

export function useManagedVenues() {
  const { user, isLoading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useRole();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      if (!user || !role) {
        setVenues([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // ORG_ADMIN and HEAD_OFFICE can see all venues
        // VENUE_MANAGER and SUPERVISOR can only see their own venue
        if (role === 'ORG_ADMIN' || role === 'HEAD_OFFICE') {
          const { data, error: fetchError } = await supabase
            .from('venues')
            .select('id, name')
            .order('name', { ascending: true });

          if (fetchError) throw fetchError;
          setVenues(data || []);
        } else if (role === 'VENUE_MANAGER' || role === 'SUPERVISOR') {
          // Get venues from venue_memberships where user_id = current user
          const { data, error: fetchError } = await supabase
            .from('venue_memberships')
            .select('venues (id, name)')
            .eq('user_id', user.id);

          if (fetchError) throw fetchError;

          const venueList = (data || [])
            .map((item: any) => item.venues)
            .filter(Boolean) as Venue[];

          setVenues(venueList);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch venues');
        setError(error);
        console.error('Error fetching venues:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && !roleLoading) {
      fetchVenues();
    }
  }, [user, role, authLoading, roleLoading]);

  return {
    venues,
    isLoading: authLoading || roleLoading || isLoading,
    error,
  };
}
