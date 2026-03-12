import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './use-auth';
import { useRole } from './use-role';

export type HolidayStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface ManagedHolidayRequest {
  id: string;
  user_id: string;
  requester_email: string;
  requester_name: string;
  venue_id: string;
  venue_name: string;
  start_date: string;
  end_date: string;
  status: HolidayStatus;
  reason?: string;
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export function useManagedHolidayRequests() {
  const { user, isLoading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useRole();
  const [requests, setRequests] = useState<ManagedHolidayRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRequests = useCallback(async () => {
    if (!user || !role) {
      setRequests([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('[useManagedHolidayRequests] Starting fetch, user:', user?.id, 'role:', role);

      // Get managed venue IDs based on role
      let venueIds: string[] = [];

      if (role === 'ORG_ADMIN' || role === 'HEAD_OFFICE') {
        // Can see all venues - fetch all holiday requests
        console.log('[useManagedHolidayRequests] ORG_ADMIN/HEAD_OFFICE - fetching all holiday requests');
      } else if (role === 'VENUE_MANAGER' || role === 'SUPERVISOR') {
        // Get their managed venues
        const { data: memberships, error: membershipError } = await supabase
          .from('venue_memberships')
          .select('venue_id')
          .eq('user_id', user.id);

        if (membershipError) throw membershipError;
        
        venueIds = (memberships || []).map((m: any) => m.venue_id).filter(Boolean);
        console.log('[useManagedHolidayRequests] VENUE_MANAGER/SUPERVISOR - managed venues:', venueIds);
      }

      // Query: SELECT * FROM web_holiday_requests
      //        WHERE venue_id = $1 (if VENUE_MANAGER/SUPERVISOR)
      //        ORDER BY created_at DESC
      
      let query = supabase
        .from('web_holiday_requests')
        .select('*');

      // Filter by venue if manager/supervisor
      if (venueIds.length > 0) {
        query = query.in('venue_id', venueIds);
      } else if (role !== 'ORG_ADMIN' && role !== 'HEAD_OFFICE') {
        // Non-admin without venues - no access
        setRequests([]);
        setIsLoading(false);
        return;
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      console.log('[useManagedHolidayRequests] Returned', data?.length || 0, 'holiday requests');

      const formattedRequests: ManagedHolidayRequest[] = (data || [])
        .map((item: any) => ({
          id: item.id || '',
          user_id: item.user_id || '',
          requester_email: item.requester_email || 'Unknown',
          requester_name: item.requester_name || 'Unknown User',
          venue_id: item.venue_id || '',
          venue_name: item.venue_name || 'Unknown Venue',
          start_date: item.starts_on || '',
          end_date: item.ends_on || '',
          status: (item.status || 'PENDING') as HolidayStatus,
          reason: item.reason || undefined,
          created_at: item.created_at || '',
          reviewed_by: item.reviewed_by || undefined,
          reviewed_at: item.reviewed_at || undefined,
        }));

      setRequests(formattedRequests);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch requests');
      setError(error);
      console.error('Error fetching holiday requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    if (!authLoading && !roleLoading) {
      fetchRequests();
    }
  }, [authLoading, roleLoading, fetchRequests]);

  const updateRequestStatus = useCallback(
    async (requestId: string, newStatus: 'APPROVED' | 'REJECTED') => {
      if (!user) return { success: false, error: new Error('Not authenticated') };

      try {
        // UPDATE holiday_requests SET status = $1, reviewed_by = $2, reviewed_at = NOW()
        // WHERE id = $3
        const { error: updateError } = await supabase
          .from('holiday_requests')
          .update({
            status: newStatus,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', requestId);

        if (updateError) throw updateError;

        // Refetch to update local state
        await fetchRequests();

        return { success: true };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update request');
        console.error('Error updating request:', error);
        return { success: false, error };
      }
    },
    [user, fetchRequests]
  );

  return {
    requests,
    isLoading: authLoading || roleLoading || isLoading,
    error,
    updateRequestStatus,
  };
}
