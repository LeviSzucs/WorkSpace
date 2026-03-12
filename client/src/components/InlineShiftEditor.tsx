import { useState } from 'react';
import { Check, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { formatTime } from '@/lib/date-utils';

const JOB_ROLES = [
  { id: '1', name: 'Server' },
  { id: '2', name: 'Chef' },
  { id: '3', name: 'Bartender' },
  { id: '4', name: 'Host' },
  { id: '5', name: 'Manager' },
];

interface InlineShiftEditorProps {
  staffId: string;
  date: string;
  venueId: string;
  onCancel: () => void;
  onShiftAdded: () => void;
}

export function InlineShiftEditor({
  staffId,
  date,
  venueId,
  onCancel,
  onShiftAdded,
}: InlineShiftEditorProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [jobRoleId, setJobRoleId] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
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
    <div className="p-2 space-y-2 bg-blue-50 border border-blue-300 rounded-lg">
      {error && (
        <div className="text-xs text-red-600 bg-red-50 p-1.5 rounded">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <select
          value={jobRoleId}
          onChange={(e) => setJobRoleId(e.target.value)}
          disabled={submitting}
          className="w-full text-xs px-2 py-1 rounded border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
        >
          {JOB_ROLES.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-1">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={submitting}
            className="text-xs px-2 py-1 rounded border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={submitting}
            className="text-xs px-2 py-1 rounded border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
          className="h-7 text-xs flex-1"
        >
          <X className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={submitting}
          className="h-7 text-xs flex-1 gap-1"
        >
          <Check className="w-3 h-3" />
          Save
        </Button>
      </div>
    </div>
  );
}
