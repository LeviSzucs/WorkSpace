import { useState } from 'react';
import { formatTime } from '@/lib/date-utils';
import { Clock, X, Plus } from 'lucide-react';
import { InlineShiftEditor } from './InlineShiftEditor';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

interface ShiftGridCellProps {
  staffId: string;
  staffName: string;
  date: string;
  shifts: Array<{
    id: string;
    start_time: string;
    end_time: string;
    job_role_name: string;
  }>;
  onShiftAdded: () => void;
  onShiftDeleted: () => void;
  venueId: string;
}

export function ShiftGridCell({
  staffId,
  staffName,
  date,
  shifts,
  onShiftAdded,
  onShiftDeleted,
  venueId,
}: ShiftGridCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDeleteShift = async (shiftId: string) => {
    try {
      setDeleting(shiftId);
      // Delete shift assignments first
      await supabase
        .from('shift_assignments')
        .delete()
        .eq('shift_id', shiftId)
        .eq('user_id', staffId);

      // Then delete the shift
      await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);

      onShiftDeleted();
    } catch (error) {
      console.error('Error deleting shift:', error);
    } finally {
      setDeleting(null);
    }
  };

  // If editing, show inline editor
  if (isEditing) {
    return (
      <InlineShiftEditor
        staffId={staffId}
        date={date}
        venueId={venueId}
        onCancel={() => setIsEditing(false)}
        onShiftAdded={() => {
          setIsEditing(false);
          onShiftAdded();
        }}
      />
    );
  }

  return (
    <div
      className="min-h-[44px] p-1 border rounded border-zinc-200 bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors relative group"
      onClick={() => setIsEditing(true)}
    >
      {shifts.length === 0 ? (
        <div className="h-9 flex flex-col items-center justify-center gap-1">
          <p className="text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">+ add</p>
        </div>
      ) : (
        <div className="space-y-1">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="p-1.5 rounded bg-blue-100 border border-blue-300 text-xs group/shift relative cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="font-medium text-blue-900">{shift.job_role_name}</div>
              <div className="flex items-center gap-1 text-blue-700 text-xs">
                <Clock className="w-3 h-3" />
                {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteShift(shift.id);
                }}
                disabled={deleting === shift.id}
                className="absolute top-1 right-1 opacity-0 group-hover/shift:opacity-100 transition-opacity p-0.5 hover:bg-red-200 rounded"
                title="Delete shift"
              >
                <X className="w-3 h-3 text-red-600" />
              </button>
            </div>
          ))}
          {/* Fallback Add Shift button below existing shifts */}
          <Button
            size="sm"
            variant="outline"
            className="w-full h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
