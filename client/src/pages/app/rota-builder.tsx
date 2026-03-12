import { useState, useEffect } from 'react';
import { useRole } from '@/hooks/use-role';
import { useManagedVenues } from '@/hooks/use-managed-venues';
import { useVenueShifts } from '@/hooks/use-venue-shifts';
import { useVenueMembers } from '@/hooks/use-venue-members';
import { useLocation } from 'wouter';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RotaGrid } from '@/components/RotaGrid';
import { ManagementSummary } from '@/components/ManagementSummary';
import { getWeekStart, getWeekLabel } from '@/lib/week-utils';

export default function RotaBuilder() {
  const [, setLocation] = useLocation();
  const { role, isLoading: roleLoading } = useRole();
  const { venues, isLoading: venuesLoading } = useManagedVenues();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [weekDate, setWeekDate] = useState(new Date());
  const weekStart = getWeekStart(weekDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  
  const { shifts, isLoading: shiftsLoading, refetch: refetchShifts } = useVenueShifts(
    selectedVenue,
    weekStart
  );
  const { members } = useVenueMembers(selectedVenue);

  console.log('[RotaBuilder] selectedVenue:', selectedVenue, 'week:', weekStartStr, '-', weekEndStr);
  console.log('[RotaBuilder] shiftsLoading:', shiftsLoading, 'shifts count:', shifts.length);
  
  // Derive unique job role names directly from shifts
  const derivedDepartments = Array.from(
    new Set((shifts || []).map(s => s.job_role_name).filter(Boolean))
  ).sort();
  console.log('[RotaBuilder] derived departments from shifts:', derivedDepartments);

  // Redirect STAFF away
  useEffect(() => {
    if (!roleLoading && role === 'STAFF') {
      setLocation('/app/rota');
    }
  }, [role, roleLoading, setLocation]);

  // Set initial venue (one-time only when venues load)
  useEffect(() => {
    if (venues.length > 0 && !selectedVenue) {
      console.log('[RotaBuilder] Setting initial venue:', venues[0].id);
      setSelectedVenue(venues[0].id);
    }
  }, [venues.length]);

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-zinc-900">Management Console</h1>
        <p className="text-sm text-zinc-600 mt-1">Build rotas, forecast revenue, and manage budgets</p>
      </div>

      {/* Week & Venue Controls */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Week of {getWeekLabel(weekDate)}</h2>
            <p className="text-sm text-zinc-500">Click cells to add shifts • Keyboard-first entry</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekDate(new Date(weekDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekDate(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setWeekDate(new Date(weekDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
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
              className="w-full sm:w-64 px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
            >
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Management Summary - Forecasts & Budgets */}
      {selectedVenue && !shiftsLoading && (
        <ManagementSummary venueId={selectedVenue} weekStart={weekStart} />
      )}

      {/* Rota Grid */}
      <div>
        <h2 className="text-lg font-semibold text-zinc-900 mb-4">Weekly Rota</h2>
        {shiftsLoading ? (
          <div className="flex items-center justify-center min-h-96">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary animate-pulse"></div>
              <p className="text-sm text-zinc-500">Loading shifts...</p>
            </div>
          </div>
        ) : !selectedVenue ? (
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
            <p className="text-zinc-600">Select a venue to view the rota.</p>
          </div>
        ) : shifts.length === 0 ? (
          <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
            <p className="text-zinc-600">No shifts yet for this week.</p>
          </div>
        ) : (
          <RotaGrid
            staff={members}
            shifts={shifts}
            weekStart={weekStart}
            venueId={selectedVenue}
            derivedDepartments={derivedDepartments}
            onShiftAdded={refetchShifts}
            onShiftDeleted={refetchShifts}
          />
        )}
      </div>
    </div>
  );
}
