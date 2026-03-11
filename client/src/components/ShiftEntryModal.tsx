import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';

const JOB_ROLES = [
  { id: '1', name: 'Server' },
  { id: '2', name: 'Chef' },
  { id: '3', name: 'Bartender' },
  { id: '4', name: 'Host' },
  { id: '5', name: 'Manager' },
];

interface ShiftEntryModalProps {
  staffId: string;
  staffName: string;
  date: string;
  venueId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShiftAdded: () => void;
}

export function ShiftEntryModal({
  staffId,
  staffName,
  date,
  venueId,
  open,
  onOpenChange,
  onShiftAdded,
}: ShiftEntryModalProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [jobRoleId, setJobRoleId] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      setSubmitting(true);

      // Create shift
      const { data: shiftData, error: shiftError } = await supabase
        .from('shifts')
        .insert({
          venue_id: venueId,
          shift_date: date,
          start_time: startTime,
          end_time: endTime,
          job_role_id: jobRoleId,
          status: 'DRAFT',
        })
        .select()
        .single();

      if (shiftError) throw shiftError;
      if (!shiftData) throw new Error('Failed to create shift');

      // Create shift assignment
      const { error: assignmentError } = await supabase
        .from('shift_assignments')
        .insert({
          shift_id: shiftData.id,
          user_id: staffId,
        });

      if (assignmentError) throw assignmentError;

      // Reset and close
      setStartTime('09:00');
      setEndTime('17:00');
      setJobRoleId('1');
      onOpenChange(false);
      onShiftAdded();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create shift';
      setError(errorMsg);
      console.error('Error creating shift:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Shift for {staffName}</DialogTitle>
          <DialogDescription>{date}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Job Role
            </label>
            <select
              value={jobRoleId}
              onChange={(e) => setJobRoleId(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
            >
              {JOB_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1 gap-2">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Add Shift
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
