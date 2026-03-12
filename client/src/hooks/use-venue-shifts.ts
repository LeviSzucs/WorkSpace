import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ShiftWithAssignments {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  status: string;
  job_role_id: string;
  job_role_name: string;
  assigned_staff: Array<{
    user_id: string;
    user_name: string;
  }>;
}

export function useVenueShifts(venueId: string | null, weekStartDate: Date) {
  const [shifts, setShifts] = useState<ShiftWithAssignments[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchShifts = useCallback(async () => {
    if (!venueId) {
      setShifts([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Calculate week end date (6 days after start)
      const weekEndDate = new Date(weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      const startDateStr = weekStartDate.toISOString().split('T')[0];
      const endDateStr = weekEndDate.toISOString().split('T')[0];

      // Query: SELECT shifts.*, job_roles.name
      //        FROM shifts
      //        JOIN job_roles ON shifts.job_role_id = job_roles.id
      //        WHERE shifts.venue_id = $1
      //        AND shifts.shift_date >= $2
      //        AND shifts.shift_date <= $3
      //        ORDER BY shifts.shift_date, shifts.starts_at
      
      console.log('[useVenueShifts] Fetching shifts for venue:', venueId, 'week:', startDateStr, '-', endDateStr);
      
      const { data: shiftsData, error: shiftsError } = await supabase
        .from('shifts')
        .select(`
          id,
          shift_date,
          starts_at,
          ends_at,
          status,
          job_role_id,
          job_roles (name),
          shift_assignments (
            user_id,
            users (id, email)
          )
        `)
        .eq('venue_id', venueId)
        .gte('shift_date', startDateStr)
        .lte('shift_date', endDateStr)
        .order('shift_date', { ascending: true })
        .order('starts_at', { ascending: true });

      if (shiftsError) throw shiftsError;

      console.log('[useVenueShifts] Returned', shiftsData?.length || 0, 'shifts');

      const formattedShifts: ShiftWithAssignments[] = (shiftsData || [])
        .map((shift: any) => ({
          id: shift.id,
          shift_date: shift.shift_date,
          start_time: shift.starts_at,
          end_time: shift.ends_at,
          status: shift.status,
          job_role_id: shift.job_role_id,
          job_role_name: shift.job_roles?.name || 'Unknown Role',
          assigned_staff: (shift.shift_assignments || []).map((sa: any) => ({
            user_id: sa.user_id,
            user_name: sa.users?.email?.split('@')[0] || 'Unknown',
          })),
        }));

      setShifts(formattedShifts);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch shifts');
      setError(error);
      console.error('Error fetching shifts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [venueId, weekStartDate]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  return {
    shifts,
    isLoading,
    error,
    refetch: fetchShifts,
  };
}
