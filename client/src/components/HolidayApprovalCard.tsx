import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

interface HolidayApprovalCardProps {
  id: string;
  requesterEmail: string;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  reason?: string;
  reviewedAt?: string;
  onApprove: () => Promise<{ success: boolean; error?: Error }>;
  onReject: () => Promise<{ success: boolean; error?: Error }>;
}

export function HolidayApprovalCard({
  id,
  requesterEmail,
  startDate,
  endDate,
  status,
  reason,
  reviewedAt,
  onApprove,
  onReject,
}: HolidayApprovalCardProps) {
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setError(null);
    setApproving(true);
    const result = await onApprove();
    if (!result.success) {
      setError(result.error?.message || 'Failed to approve');
    }
    setApproving(false);
  };

  const handleReject = async () => {
    setError(null);
    setRejecting(true);
    const result = await onReject();
    if (!result.success) {
      setError(result.error?.message || 'Failed to reject');
    }
    setRejecting(false);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-zinc-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 border-red-200';
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-200';
      case 'CANCELLED':
        return 'bg-zinc-50 border-zinc-200';
      default:
        return 'bg-white border-zinc-200';
    }
  };

  return (
    <div className={`rounded-xl border p-4 space-y-4 ${getStatusColor()}`}>
      {error && (
        <div className="p-3 rounded-lg bg-red-100 border border-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {getStatusIcon()}
            <div>
              <h4 className="font-semibold text-zinc-900">{requesterEmail}</h4>
              <p className="text-sm opacity-75">
                {formatDate(new Date(startDate))} - {formatDate(new Date(endDate))}
              </p>
            </div>
          </div>

          {reason && (
            <p className="text-sm opacity-75 mt-3 pl-8">
              <span className="font-medium">Reason:</span> {reason}
            </p>
          )}

          {reviewedAt && (
            <p className="text-xs opacity-50 mt-3 pl-8">
              Reviewed on {formatDate(new Date(reviewedAt))}
            </p>
          )}
        </div>

        <span className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
          status === 'APPROVED'
            ? 'bg-green-100 text-green-700'
            : status === 'REJECTED'
            ? 'bg-red-100 text-red-700'
            : status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-zinc-200 text-zinc-700'
        }`}>
          {status}
        </span>
      </div>

      {status === 'PENDING' && (
        <div className="flex gap-2 pt-2 border-t border-current border-opacity-20">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={approving || rejecting}
            className="flex-1 gap-2"
          >
            {rejecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                Reject
              </>
            )}
          </Button>
          <Button
            size="sm"
            onClick={handleApprove}
            disabled={approving || rejecting}
            className="flex-1 gap-2"
          >
            {approving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
