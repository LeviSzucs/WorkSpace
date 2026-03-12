import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface VenueMember {
  user_id: string;
  email: string;
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

        console.log('[useVenueMembers] Fetching members for venue:', venueId);

        // Query: SELECT venue_memberships.*, users.email
        //        FROM venue_memberships
        //        JOIN users ON venue_memberships.user_id = users.id
        //        WHERE venue_memberships.venue_id = $1
        //        ORDER BY users.email
        
        const { data, error: fetchError } = await supabase
          .from('venue_memberships')
          .select('user_id, role, users (email)')
          .eq('venue_id', venueId)
          .order('users(email)', { ascending: true });

        if (fetchError) throw fetchError;

        console.log('[useVenueMembers] Returned', data?.length || 0, 'members');

        const formattedMembers: VenueMember[] = (data || [])
          .map((item: any) => ({
            user_id: item.user_id,
            email: item.users?.email || 'Unknown',
            role: item.role,
          }));

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
