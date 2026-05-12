import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface JobRole {
  id: string;
  name: string;
  department: string;
  colour: string;
}

export function useVenueJobRoles(venueId: string | null) {
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchJobRoles = async () => {
      if (!venueId) {
        setJobRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('[useVenueJobRoles] Fetching job_roles for venue:', venueId);

        // Query: SELECT id, name, venue_id
        //        FROM job_roles
        //        WHERE venue_id = $1
        //        ORDER BY name
        const { data, error: fetchError } = await supabase
          .from('job_roles')
          .select('id, name, venue_id, colour')
          .eq('venue_id', venueId)
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;

        console.log('[useVenueJobRoles] Returned', data?.length || 0, 'job_roles');

        const formattedRoles: JobRole[] = (data || []).map((role: any) => ({
          id: role.id,
          name: role.name,
          department: role.name,
          colour: role.colour ?? '#3b82f6',
        }));

        setJobRoles(formattedRoles);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch job roles');
        setError(error);
        console.error('Error fetching job roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobRoles();
  }, [venueId]);

  return {
    jobRoles,
    isLoading,
    error,
  };
}
