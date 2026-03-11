import { useUserShifts } from "@/hooks/use-user-shifts";
import { CalendarDays, MapPin, Clock, AlertCircle } from "lucide-react";
import { formatDate, formatTime, groupShiftsByDay } from "@/lib/date-utils";

export default function Rota() {
  const { shifts, isLoading, error } = useUserShifts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
          <p className="text-sm text-zinc-500">Loading your shifts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 mb-1">Error Loading Shifts</h3>
          <p className="text-sm text-red-700">{error.message}</p>
        </div>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
        <CalendarDays className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-zinc-900 mb-2">No Shifts Assigned</h3>
        <p className="text-zinc-600">You don't have any shifts assigned yet. Check back soon!</p>
      </div>
    );
  }

  const groupedShifts = groupShiftsByDay(shifts);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Your Shifts</h2>
        <p className="text-sm text-zinc-500">{shifts.length} shift{shifts.length !== 1 ? 's' : ''} assigned</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedShifts).map(([date, dayShifts]) => (
          <div key={date}>
            <h3 className="text-sm font-semibold text-zinc-700 mb-3 pb-2 border-b border-zinc-200">
              {formatDate(new Date(date))}
            </h3>

            <div className="space-y-3">
              {dayShifts.map((shift) => (
                <div
                  key={shift.id}
                  className="bg-white rounded-xl border border-zinc-200 p-4 hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-zinc-900">{shift.venue_name}</h4>
                      <p className="text-sm text-zinc-600">{shift.job_role_name}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      shift.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : shift.status === 'DRAFT'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-zinc-100 text-zinc-700'
                    }`}>
                      {shift.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-zinc-400" />
                      <span>{formatTime(shift.start_time)} - {formatTime(shift.end_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-zinc-400" />
                      <span>Shift</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
