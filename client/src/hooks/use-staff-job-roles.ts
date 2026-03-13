import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface StaffJobRoleMapping {
  user_id: string;
  full_name: string;
  job_role_id: string;
  venue_id: string;
  department_name: string;
  venue_role: string;
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

        console.log('[useStaffJobRoles] Fetching staff-to-department mappings from web_staff_department_rows for venue:', venueId);

        // Query: SELECT user_id, job_role_id, venue_id, department_name, full_name, venue_role
        //        FROM web_staff_department_rows
        //        WHERE venue_id = $1
        //        ORDER BY department_name, full_name
        const { data, error: fetchError } = await supabase
          .from('web_staff_department_rows')
          .select('user_id, job_role_id, venue_id, department_name, full_name, venue_role')
          .eq('venue_id', venueId)
          .order('department_name', { ascending: true })
          .order('full_name', { ascending: true });

        if (fetchError) throw fetchError;

        console.log('[useStaffJobRoles] web_staff_department_rows returned', data?.length || 0, 'rows');

        const formattedMappings: StaffJobRoleMapping[] = (data || []).map((item: any) => ({
          user_id: item.user_id,
          full_name: item.full_name || 'Unnamed user',
          job_role_id: item.job_role_id,
          venue_id: item.venue_id,
          department_name: item.department_name,
          venue_role: item.venue_role,
        }));

        const departmentNames = [...new Set(formattedMappings.map((m) => m.department_name))];
        const staffNames = formattedMappings.map((m) => m.full_name);

        console.log('[useStaffJobRoles] Processed', formattedMappings.length, 'staff-department mappings');
        console.log('[useStaffJobRoles] Departments:', departmentNames);
        console.log('[useStaffJobRoles] Staff:', staffNames);

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
