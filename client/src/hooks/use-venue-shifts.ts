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
  break_minutes: number;
  notes: string;
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

      // Query: SELECT * FROM web_rota_rows
      //        WHERE venue_id = $1
      //        AND shift_date >= $2
      //        AND shift_date <= $3
      //        ORDER BY shift_date, starts_at
      
      console.log('[useVenueShifts] Fetching shifts for venue:', venueId, 'week:', startDateStr, '-', endDateStr);
      
      const { data: rotas, error: rotasError } = await supabase
        .from('web_rota_rows')
        .select('*')
        .eq('venue_id', venueId)
        .gte('shift_date', startDateStr)
        .lte('shift_date', endDateStr)
        .order('shift_date', { ascending: true })
        .order('starts_at', { ascending: true });

      if (rotasError) throw rotasError;

      console.log('[useVenueShifts] Returned', rotas?.length || 0, 'rota rows');

      // Group rota rows by shift id to reconstruct assigned_staff array
      const shiftsMap = new Map<string, ShiftWithAssignments>();
      
      (rotas || []).forEach((row: any) => {
        if (!row?.id) return;
        
        if (!shiftsMap.has(row.id)) {
          shiftsMap.set(row.id, {
            id: row.id || '',
            shift_date: row.shift_date || '',
            start_time: row.starts_at || '',
            end_time: row.ends_at || '',
            status: row.status || '',
            job_role_id: row.job_role_id || '',
            job_role_name: row.job_role_name || 'Unknown Role',
            break_minutes: row.break_minutes ?? 0,
            notes: row.notes ?? '',
            assigned_staff: [],
          });
        }
        
        const shift = shiftsMap.get(row.id)!;
        
        // Add staff assignment if user info exists
        if (row.user_id && row.user_email) {
          const userName = row.user_email.split('@')[0] || 'Unknown';
          if (!shift.assigned_staff.some(s => s.user_id === row.user_id)) {
            shift.assigned_staff.push({
              user_id: row.user_id,
              user_name: userName,
            });
          }
        }
      });

      const formattedShifts = Array.from(shiftsMap.values());
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
