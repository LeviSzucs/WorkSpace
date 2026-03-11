import { useUserHolidays } from "@/hooks/use-user-holidays";
import { HolidayRequestForm } from "@/components/HolidayRequestForm";
import { Plane, Calendar, AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/date-utils";

export default function Holidays() {
  const { holidays, isLoading, error, createHolidayRequest } = useUserHolidays();

  const getStatusIcon = (status: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 border-green-200 text-green-900';
      case 'REJECTED':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'PENDING':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'CANCELLED':
        return 'bg-zinc-50 border-zinc-200 text-zinc-700';
      default:
        return 'bg-white border-zinc-200 text-zinc-900';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
          <p className="text-sm text-zinc-500">Loading your requests...</p>
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Time Off & Holidays</h2>
        <HolidayRequestForm onSubmit={createHolidayRequest} />
      </div>

      {holidays.length === 0 ? (
        <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
          <Plane className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Requests Yet</h3>
          <p className="text-zinc-600 mb-4">Submit your first time-off request to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {holidays.map((holiday) => (
            <div
              key={holiday.id}
              className={`rounded-xl border p-4 ${getStatusColor(holiday.status)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(holiday.status)}
                    <div>
                      <h4 className="font-semibold">{formatDate(new Date(holiday.start_date))} - {formatDate(new Date(holiday.end_date))}</h4>
                      <p className="text-sm opacity-75">Requested {formatDate(new Date(holiday.created_at))}</p>
                    </div>
                  </div>
                  {holiday.reason && (
                    <p className="text-sm opacity-75 mt-2">{holiday.reason}</p>
                  )}
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap ${
                  holiday.status === 'APPROVED'
                    ? 'bg-green-100 text-green-700'
                    : holiday.status === 'REJECTED'
                    ? 'bg-red-100 text-red-700'
                    : holiday.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-zinc-200 text-zinc-700'
                }`}>
                  {holiday.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
