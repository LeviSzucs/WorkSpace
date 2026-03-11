import { useState } from 'react';
import { useRole } from '@/hooks/use-role';
import { useManagedHolidayRequests } from '@/hooks/use-managed-holiday-requests';
import { HolidayApprovalCard } from '@/components/HolidayApprovalCard';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { AlertCircle, Plane } from 'lucide-react';

type FilterStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';

export default function HolidaysManage() {
  const [, setLocation] = useLocation();
  const { role, isLoading: roleLoading } = useRole();
  const { requests, isLoading, error, updateRequestStatus } = useManagedHolidayRequests();
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('PENDING');

  // Redirect STAFF away
  useEffect(() => {
    if (!roleLoading && role === 'STAFF') {
      setLocation('/app/rota');
    }
  }, [role, roleLoading, setLocation]);

  const filteredRequests = filterStatus === 'ALL' 
    ? requests 
    : requests.filter((r) => r.status === filterStatus);

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  if (roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Error Loading Requests</h3>
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-6 border-b border-zinc-200 overflow-x-auto">
        <button
          onClick={() => setFilterStatus('PENDING')}
          className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'PENDING'
              ? 'text-primary border-b-2 border-primary'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Pending Requests ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('APPROVED')}
          className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'APPROVED'
              ? 'text-primary border-b-2 border-primary'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilterStatus('REJECTED')}
          className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'REJECTED'
              ? 'text-primary border-b-2 border-primary'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`pb-4 text-sm font-medium whitespace-nowrap transition-colors ${
            filterStatus === 'ALL'
              ? 'text-primary border-b-2 border-primary'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          All Requests
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
            <p className="text-sm text-zinc-500">Loading requests...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
          <Plane className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Requests</h3>
          <p className="text-zinc-600">
            {filterStatus === 'PENDING'
              ? 'No pending requests to review.'
              : filterStatus === 'APPROVED'
              ? 'No approved requests.'
              : filterStatus === 'REJECTED'
              ? 'No rejected requests.'
              : 'No requests found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <HolidayApprovalCard
              key={request.id}
              id={request.id}
              requesterEmail={request.requester_email}
              startDate={request.start_date}
              endDate={request.end_date}
              status={request.status}
              reason={request.reason}
              reviewedAt={request.reviewed_at}
              onApprove={() => updateRequestStatus(request.id, 'APPROVED')}
              onReject={() => updateRequestStatus(request.id, 'REJECTED')}
            />
          ))}
        </div>
      )}
    </div>
  );
}
