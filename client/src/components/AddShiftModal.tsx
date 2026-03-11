import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase/client';

interface AddShiftModalProps {
  venueId: string;
  onShiftAdded: () => void;
  jobRoles: Array<{ id: string; name: string }>;
  staffMembers: Array<{ user_id: string; email: string }>;
}

export function AddShiftModal({
  venueId,
  onShiftAdded,
  jobRoles,
  staffMembers,
}: AddShiftModalProps) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [jobRoleId, setJobRoleId] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !startTime || !endTime || !jobRoleId) {
      setError('Please fill in all required fields');
      return;
    }

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

      // Create shift assignments for selected staff
      if (selectedStaff.length > 0) {
        const assignments = selectedStaff.map((userId) => ({
          shift_id: shiftData.id,
          user_id: userId,
        }));

        const { error: assignmentError } = await supabase
          .from('shift_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }

      // Reset form and close
      setDate('');
      setStartTime('09:00');
      setEndTime('17:00');
      setJobRoleId('');
      setSelectedStaff([]);
      setOpen(false);

      // Trigger refetch
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Shift
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Shift</DialogTitle>
          <DialogDescription>Create a shift and assign staff members.</DialogDescription>
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
              Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Start Time <span className="text-red-600">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                End Time <span className="text-red-600">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={submitting}
                className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Job Role <span className="text-red-600">*</span>
            </label>
            <select
              value={jobRoleId}
              onChange={(e) => setJobRoleId(e.target.value)}
              disabled={submitting}
              className="w-full px-3 py-2 rounded-lg bg-zinc-50 border border-zinc-200 text-zinc-900 focus:outline-none focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all disabled:opacity-50"
              required
            >
              <option value="">Select a role...</option>
              {jobRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Assign Staff (Optional)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {staffMembers.length === 0 ? (
                <p className="text-sm text-zinc-500">No staff available</p>
              ) : (
                staffMembers.map((member) => (
                  <label key={member.user_id} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-zinc-50">
                    <input
                      type="checkbox"
                      checked={selectedStaff.includes(member.user_id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStaff([...selectedStaff, member.user_id]);
                        } else {
                          setSelectedStaff(selectedStaff.filter((id) => id !== member.user_id));
                        }
                      }}
                      disabled={submitting}
                      className="rounded border-zinc-300"
                    />
                    <span className="text-sm text-zinc-700">{member.email}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Shift'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
