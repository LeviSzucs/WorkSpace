import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface JobRole {
  id: string;
  name: string;
  department: string;
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

        // Query: SELECT job_roles.id, job_roles.name, job_roles.department
        //        FROM job_roles
        //        WHERE job_roles.venue_id = $1
        //        ORDER BY job_roles.department, job_roles.name

        const { data, error: fetchError } = await supabase
          .from('job_roles')
          .select('id, name, department')
          .eq('venue_id', venueId)
          .order('department', { ascending: true })
          .order('name', { ascending: true });

        if (fetchError) throw fetchError;

        const formattedRoles: JobRole[] = (data || []).map((role: any) => ({
          id: role.id,
          name: role.name,
          department: role.department || 'General',
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
