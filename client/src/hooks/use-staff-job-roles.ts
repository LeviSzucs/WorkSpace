import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface StaffJobRoleMapping {
  user_id: string;
  full_name: string;
  job_role_id: string;
  job_role_name: string;
}

export function useStaffJobRoles(venueId: string | null) {
  const [staffJobRoles, setStaffJobRoles] = useState<StaffJobRoleMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStaffJobRoles = async () => {
      if (!venueId) {
        setStaffJobRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('[useStaffJobRoles] Fetching staff-to-department mappings for venue:', venueId);

        // Query: SELECT staff_job_roles.user_id, profiles.full_name, 
        //               staff_job_roles.job_role_id, job_roles.name
        //        FROM staff_job_roles
        //        JOIN job_roles ON staff_job_roles.job_role_id = job_roles.id
        //        JOIN profiles ON staff_job_roles.user_id = profiles.user_id
        //        WHERE job_roles.venue_id = $1
        const { data, error: fetchError } = await supabase
          .from('staff_job_roles')
          .select('user_id, job_role_id, job_roles(name, venue_id), profiles(full_name)')
          .eq('job_roles.venue_id', venueId);

        if (fetchError) throw fetchError;

        console.log('[useStaffJobRoles] staff_job_roles returned', data?.length || 0, 'mappings');

        const formattedMappings: StaffJobRoleMapping[] = (data || [])
          .filter((item: any) => item.job_roles?.venue_id === venueId)
          .map((item: any) => ({
            user_id: item.user_id,
            full_name: item.profiles?.full_name || 'Unnamed user',
            job_role_id: item.job_role_id,
            job_role_name: item.job_roles?.name || 'Unknown Role',
          }));

        console.log('[useStaffJobRoles] Processed', formattedMappings.length, 'staff-department mappings');

        setStaffJobRoles(formattedMappings);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch staff job roles');
        setError(error);
        console.error('Error fetching staff job roles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStaffJobRoles();
  }, [venueId]);

  return {
    staffJobRoles,
    isLoading,
    error,
  };
}
