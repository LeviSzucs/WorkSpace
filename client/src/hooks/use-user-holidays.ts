import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './use-auth';

export type HolidayStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface HolidayRequest {
  id: string;
  start_date: string;
  end_date: string;
  status: HolidayStatus;
  reason?: string;
  created_at: string;
}

export function useUserHolidays() {
  const { user, isLoading: authLoading } = useAuth();
  const [holidays, setHolidays] = useState<HolidayRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHolidays = useCallback(async () => {
    if (!user) {
      setHolidays([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Query: SELECT * FROM holiday_requests WHERE user_id = user.id ORDER BY start_date DESC
      const { data, error: fetchError } = await supabase
        .from('holiday_requests')
        .select('id, start_date, end_date, status, reason, created_at')
        .eq('user_id', user.id)
        .order('start_date', { ascending: false });

      if (fetchError) throw fetchError;

      setHolidays(
        (data || []).map((item) => ({
          id: item.id,
          start_date: item.start_date,
          end_date: item.end_date,
          status: item.status as HolidayStatus,
          reason: item.reason,
          created_at: item.created_at,
        }))
      );
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch holidays');
      setError(error);
      console.error('Error fetching holidays:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchHolidays();
    }
  }, [authLoading, fetchHolidays]);

  const createHolidayRequest = useCallback(
    async (startDate: string, endDate: string, reason?: string) => {
      if (!user) return { success: false, error: new Error('Not authenticated') };

      try {
        // INSERT INTO holiday_requests (user_id, start_date, end_date, status, reason)
        // VALUES (user.id, startDate, endDate, 'PENDING', reason)
        const { data, error: insertError } = await supabase
          .from('holiday_requests')
          .insert({
            user_id: user.id,
            start_date: startDate,
            end_date: endDate,
            status: 'PENDING',
            reason: reason || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Refetch to update local state
        await fetchHolidays();

        return { success: true, data };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create holiday request');
        console.error('Error creating holiday request:', error);
        return { success: false, error };
      }
    },
    [user, fetchHolidays]
  );

  return {
    holidays,
    isLoading: authLoading || isLoading,
    error,
    createHolidayRequest,
  };
}
