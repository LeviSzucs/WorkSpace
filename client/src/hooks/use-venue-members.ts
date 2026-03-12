import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface VenueMember {
  user_id: string;
  full_name: string;
  role: string;
}

export function useVenueMembers(venueId: string | null) {
  const [members, setMembers] = useState<VenueMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!venueId) {
        setMembers([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('[useVenueMembers] Fetching members for selectedVenueId:', venueId);

        // Query: SELECT user_id, role, venue_id, profiles(full_name)
        //        FROM venue_memberships
        //        WHERE venue_id = $1
        //        (include all assignable roles: VENUE_MANAGER, SUPERVISOR, STAFF)
        const { data, error: fetchError } = await supabase
          .from('venue_memberships')
          .select('user_id, role, venue_id, profiles(full_name)')
          .eq('venue_id', venueId);

        if (fetchError) throw fetchError;

        console.log('[useVenueMembers] venue_memberships returned', data?.length || 0, 'rows');
        console.log('[useVenueMembers] roles returned:', (data || []).map((d: any) => d.role).join(', '));

        const formattedMembers: VenueMember[] = (data || [])
          .map((item: any) => ({
            user_id: item.user_id,
            full_name: item.profiles?.full_name || 'Unnamed user',
            role: item.role,
          }));

        console.log('[useVenueMembers] Staff rows rendered:', formattedMembers.length);

        setMembers(formattedMembers);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch members');
        setError(error);
        console.error('Error fetching members:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [venueId]);

  return {
    members,
    isLoading,
    error,
  };
}
