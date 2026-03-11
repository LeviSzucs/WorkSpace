import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './use-auth';

export interface UserShift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  job_role_name: string;
  status: string;
}

export function useUserShifts() {
  const { user, isLoading: authLoading } = useAuth();
  const [shifts, setShifts] = useState<UserShift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShifts = async () => {
      if (!user) {
        setShifts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Query shifts assigned to the current user
        // SQL: SELECT shifts.*, venues.name, job_roles.name
        //      FROM shifts
        //      JOIN shift_assignments ON shifts.id = shift_assignments.shift_id
        //      JOIN venues ON shifts.venue_id = venues.id
        //      JOIN job_roles ON shifts.job_role_id = job_roles.id
        //      WHERE shift_assignments.user_id = user.id
        //      ORDER BY shifts.shift_date, shifts.start_time
        
        const { data, error: fetchError } = await supabase
          .from('shift_assignments')
          .select(`
            shift_id,
            shifts (
              id,
              shift_date,
              start_time,
              end_time,
              status,
              venue_id,
              job_role_id,
              venues (name),
              job_roles (name)
            )
          `)
          .eq('user_id', user.id)
          .order('shifts(shift_date)', { ascending: true });

        if (fetchError) throw fetchError;

        if (data) {
          const formattedShifts: UserShift[] = data
            .map((item: any) => {
              const shift = item.shifts;
              if (!shift) return null;
              
              return {
                id: shift.id,
                shift_date: shift.shift_date,
                start_time: shift.start_time,
                end_time: shift.end_time,
                status: shift.status,
                venue_name: shift.venues?.[0]?.name || 'Unknown Venue',
                job_role_name: shift.job_roles?.[0]?.name || 'Unknown Role',
              };
            })
            .filter(Boolean);

          setShifts(formattedShifts);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch shifts');
        setError(error);
        console.error('Error fetching shifts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchShifts();
    }
  }, [user, authLoading]);

  return {
    shifts,
    isLoading: authLoading || isLoading,
    error,
  };
}
