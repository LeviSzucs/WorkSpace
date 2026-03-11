import { useState } from 'react';
import { useRole } from '@/hooks/use-role';
import { useManagedVenues } from '@/hooks/use-managed-venues';
import { useVenueShifts } from '@/hooks/use-venue-shifts';
import { useVenueMembers } from '@/hooks/use-venue-members';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddShiftModal } from '@/components/AddShiftModal';
import { getWeekStart, getWeekLabel, getDayOfWeek, DAYS_OF_WEEK } from '@/lib/week-utils';
import { formatTime } from '@/lib/date-utils';

// Mock job roles - in real app would fetch from DB
const JOB_ROLES = [
  { id: '1', name: 'Server' },
  { id: '2', name: 'Chef' },
  { id: '3', name: 'Bartender' },
  { id: '4', name: 'Host' },
  { id: '5', name: 'Manager' },
];

export default function RotaBuilder() {
  const [, setLocation] = useLocation();
  const { role, isLoading: roleLoading } = useRole();
  const { venues, isLoading: venuesLoading } = useManagedVenues();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [weekDate, setWeekDate] = useState(new Date());
  const weekStart = getWeekStart(weekDate);
  const { shifts, isLoading: shiftsLoading, refetch: refetchShifts } = useVenueShifts(selectedVenue, weekStart);
  const { members } = useVenueMembers(selectedVenue);

  // Redirect STAFF away
  useEffect(() => {
    if (!roleLoading && role === 'STAFF') {
      setLocation('/app/rota');
    }
  }, [role, roleLoading, setLocation]);

  // Set initial venue
  useEffect(() => {
    if (venues.length > 0 && !selectedVenue) {
      setSelectedVenue(venues[0].id);
    }
  }, [venues, selectedVenue]);

  if (roleLoading || venuesLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-yellow-900 mb-1">No Access</h3>
          <p className="text-sm text-yellow-700">You don't have access to any venues.</p>
        </div>
      </div>
    );
  }

  // Group shifts by day
  const shiftsByDay: Record<number, typeof shifts> = {};
  shifts.forEach((shift) => {
    const dayIndex = getDayOfWeek(shift.shift_date);
    if (!shiftsByDay[dayIndex]) {
      shiftsByDay[dayIndex] = [];
    }
    shiftsByDay[dayIndex].push(shift);
  });

  return (
    <div className="space-y-6">
      {/* Week & Venue Selector */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Week of {getWeekLabel(weekDate)}</h2>
            <p className="text-sm text-zinc-500">Build and manage shifts for your team</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekDate(new Date(weekDate.setDate(weekDate.getDate() - 7)))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setWeekDate(new Date())}>
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekDate(new Date(weekDate.setDate(weekDate.getDate() + 7)))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 mb-2">Select Venue</label>
            <select
              value={selectedVenue || ''}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
          {selectedVenue && (
            <AddShiftModal
              venueId={selectedVenue}
              onShiftAdded={refetchShifts}
              jobRoles={JOB_ROLES}
              staffMembers={members}
            />
          )}
        </div>
      </div>

      {/* Weekly Grid */}
      {shiftsLoading ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
            <p className="text-sm text-zinc-500">Loading shifts...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + dayIndex);
            const dateStr = dayDate.toISOString().split('T')[0];
            const dayShifts = shiftsByDay[dayIndex] || [];

            return (
              <div
                key={dayIndex}
                className="bg-white rounded-xl border border-zinc-200 overflow-hidden flex flex-col"
              >
                <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200">
                  <p className="text-xs font-semibold text-zinc-600 uppercase">{dayName}</p>
                  <p className="text-sm font-semibold text-zinc-900">{dayDate.getDate()}</p>
                </div>

                <div className="flex-1 p-3 space-y-2">
                  {dayShifts.length === 0 ? (
                    <p className="text-xs text-zinc-400 text-center py-8">No shifts</p>
                  ) : (
                    dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs space-y-1"
                      >
                        <div className="font-semibold text-blue-900">{shift.job_role_name}</div>
                        <div className="flex items-center gap-1 text-blue-700">
                          <Clock className="w-3 h-3" />
                          {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                        </div>
                        {shift.assigned_staff.length > 0 && (
                          <div className="flex items-center gap-1 text-blue-700">
                            <Users className="w-3 h-3" />
                            {shift.assigned_staff.map((s) => s.user_name).join(', ')}
                          </div>
                        )}
                        <div>
                          <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${
                            shift.status === 'PUBLISHED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {shift.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
