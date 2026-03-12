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

      // Get all shift_assignments for venues where this user is VENUE_MANAGER or SUPERVISOR
      // Then get holiday_requests from those venues
      const { data: venueMembershipsData, error: venueMembershipsError } = await supabase
        .from('venue_memberships')
        .select('venue_id')
        .eq('user_id', user.id)
        .in('role', ['VENUE_MANAGER', 'SUPERVISOR']);

      if (venueMembershipsError) throw venueMembershipsError;

      const managedVenueIds = (venueMembershipsData || []).map((vm: any) => vm.venue_id);

      // If ORG_ADMIN or HEAD_OFFICE, get all holiday requests
      if (role === 'ORG_ADMIN' || role === 'HEAD_OFFICE') {
        const { data, error: fetchError } = await supabase
          .from('holiday_requests')
          .select(`
            id,
            user_id,
            venue_id,
            users (email, full_name),
            venues (name),
            start_date,
            end_date,
            status,
            reason,
            created_at,
            reviewed_by,
            reviewed_at
          `)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;

        const formattedRequests: ManagedHolidayRequest[] = (data || []).map((item: any) => ({
          id: item.id,
          user_id: item.user_id,
          requester_email: item.users?.email || 'Unknown',
          requester_name: item.users?.full_name || 'Unknown User',
          venue_id: item.venue_id,
          venue_name: item.venues?.name || 'Unknown Venue',
          start_date: item.start_date,
          end_date: item.end_date,
          status: item.status as HolidayStatus,
          reason: item.reason,
          created_at: item.created_at,
          reviewed_by: item.reviewed_by,
          reviewed_at: item.reviewed_at,
        }));

        setRequests(formattedRequests);
      } else if (managedVenueIds.length > 0) {
        // Get holiday requests for staff in managed venues
        const { data: staffData, error: staffError } = await supabase
          .from('venue_memberships')
          .select('user_id')
          .in('venue_id', managedVenueIds);

        if (staffError) throw staffError;

        const staffIds = (staffData || []).map((vm: any) => vm.user_id);

        if (staffIds.length > 0) {
          const { data, error: fetchError } = await supabase
            .from('holiday_requests')
            .select(`
              id,
              user_id,
              venue_id,
              users (email, full_name),
              venues (name),
              start_date,
              end_date,
              status,
              reason,
              created_at,
              reviewed_by,
              reviewed_at
            `)
            .in('user_id', staffIds)
            .order('created_at', { ascending: false });

          if (fetchError) throw fetchError;

          const formattedRequests: ManagedHolidayRequest[] = (data || []).map((item: any) => ({
            id: item.id,
            user_id: item.user_id,
            requester_email: item.users?.email || 'Unknown',
            requester_name: item.users?.full_name || 'Unknown User',
            venue_id: item.venue_id,
            venue_name: item.venues?.name || 'Unknown Venue',
            start_date: item.start_date,
            end_date: item.end_date,
            status: item.status as HolidayStatus,
            reason: item.reason,
            created_at: item.created_at,
            reviewed_by: item.reviewed_by,
            reviewed_at: item.reviewed_at,
          }));

          setRequests(formattedRequests);
        } else {
          setRequests([]);
        }
      } else {
        setRequests([]);
      }
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
