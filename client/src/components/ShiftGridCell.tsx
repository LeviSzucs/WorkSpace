import { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export interface ShiftItem {
  id: string;
  start_time: string;
  end_time: string;
  job_role_name: string;
  status?: string;
}

export interface ShiftGridCellProps {
  staffId: string;
  date: string;
  shifts: ShiftItem[];
  jobRoleId: string;
  roleColor: string;
  venueId: string;
  isActive: boolean;
  onActivate: () => void;
  onShiftSaved: () => void;
  onShiftDeleted: () => void;
  onNavigate: (dir: 'right' | 'left' | 'up' | 'down') => void;
  registerRef: (el: HTMLDivElement | null) => void;
}

function fmtTime(t: string): string {
  return t ? t.substring(0, 5) : '';
}

export function ShiftGridCell({
  staffId,
  date,
  shifts,
  jobRoleId,
  roleColor,
  venueId,
  isActive,
  onActivate,
  onShiftSaved,
  onShiftDeleted,
  onNavigate,
  registerRef,
}: ShiftGridCellProps) {
  const [editing, setEditing] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const setRef = useCallback(
    (el: HTMLDivElement | null) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
      registerRef(el);
    },
    [registerRef],
  );

  const openEditor = useCallback(() => {
    setStartTime('09:00');
    setEndTime('17:00');
    setError(null);
    setEditing(true);
    requestAnimationFrame(() => startRef.current?.focus());
  }, []);

  const closeEditor = useCallback(() => {
    setEditing(false);
    setError(null);
    containerRef.current?.focus();
  }, []);

  const save = useCallback(
    async (andThen?: () => void) => {
      if (saving) return;
      if (startTime >= endTime) {
        setError('End must be after start');
        return;
      }
      setSaving(true);
      setError(null);
      try {
        const { data: shift, error: shiftErr } = await supabase
          .from('shifts')
          .insert({
            venue_id: venueId,
            shift_date: date,
            start_time: startTime,
            end_time: endTime,
            job_role_id: jobRoleId,
            status: 'DRAFT',
          })
          .select('id')
          .single();
        if (shiftErr) throw shiftErr;
        const { error: assignErr } = await supabase
          .from('shift_assignments')
          .insert({ shift_id: shift.id, user_id: staffId });
        if (assignErr) throw assignErr;
        setEditing(false);
        onShiftSaved();
        andThen?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save');
      } finally {
        setSaving(false);
      }
    },
    [saving, startTime, endTime, venueId, date, jobRoleId, staffId, onShiftSaved],
  );

  const deleteShift = useCallback(
    async (shiftId: string) => {
      setDeletingId(shiftId);
      try {
        await supabase
          .from('shift_assignments')
          .delete()
          .eq('shift_id', shiftId)
          .eq('user_id', staffId);
        await supabase.from('shifts').delete().eq('id', shiftId);
        onShiftDeleted();
      } finally {
        setDeletingId(null);
      }
    },
    [staffId, onShiftDeleted],
  );

  const handleContainerKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (editing) return;

      if (e.key === 'Enter' || /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        openEditor();
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && shifts.length > 0) {
        e.preventDefault();
        deleteShift(shifts[shifts.length - 1].id);
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        onNavigate(e.shiftKey ? 'left' : 'right');
        return;
      }
      const dirs: Record<string, 'right' | 'left' | 'up' | 'down'> = {
        ArrowRight: 'right',
        ArrowLeft: 'left',
        ArrowUp: 'up',
        ArrowDown: 'down',
      };
      if (dirs[e.key]) {
        e.preventDefault();
        onNavigate(dirs[e.key]);
      }
    },
    [editing, shifts, openEditor, deleteShift, onNavigate],
  );

  return (
    <div
      ref={setRef}
      tabIndex={editing ? -1 : 0}
      className={`flex-1 min-w-[100px] border-r border-zinc-200 p-1 outline-none transition-colors group
        ${editing ? '' : isActive ? 'bg-blue-50 ring-2 ring-inset ring-blue-400' : 'cursor-pointer hover:bg-zinc-50/80'}
      `}
      onFocus={!editing ? onActivate : undefined}
      onClick={!editing ? openEditor : undefined}
      onKeyDown={handleContainerKey}
    >
      {editing ? (
        <div className="rounded border-2 border-blue-500 bg-blue-50 p-1.5 space-y-1.5">
          {error && <p className="text-[10px] text-red-600 leading-tight">{error}</p>}
          <div className="flex items-center gap-1">
            <input
              ref={startRef}
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab' || e.key === 'Enter') {
                  e.preventDefault();
                  endRef.current?.focus();
                } else if (e.key === 'Escape') {
                  closeEditor();
                }
              }}
              disabled={saving}
              className="w-[74px] text-xs px-1.5 py-0.5 rounded border border-blue-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <span className="text-xs text-zinc-400 shrink-0">–</span>
            <input
              ref={endRef}
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  save(() => containerRef.current?.focus());
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  save(() => onNavigate(e.shiftKey ? 'left' : 'right'));
                } else if (e.key === 'Escape') {
                  closeEditor();
                }
              }}
              disabled={saving}
              className="w-[74px] text-xs px-1.5 py-0.5 rounded border border-blue-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>
          <div className="flex gap-1">
            <button
              tabIndex={-1}
              onClick={closeEditor}
              className="flex-1 text-[10px] py-0.5 rounded border border-zinc-200 text-zinc-500 hover:bg-zinc-100 transition-colors"
            >
              Esc
            </button>
            <button
              tabIndex={-1}
              onClick={() => save(() => containerRef.current?.focus())}
              disabled={saving}
              className="flex-1 text-[10px] py-0.5 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? '…' : '↵ Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="min-h-[38px] flex flex-col gap-0.5">
          {shifts.length === 0 ? (
            <div className="min-h-[38px] flex items-center justify-center select-none">
              {isActive ? (
                <span className="text-[10px] text-zinc-400">↵ or type to add</span>
              ) : (
                <span className="text-[10px] text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity">
                  + add
                </span>
              )}
            </div>
          ) : (
            shifts.map((shift) => (
              <div
                key={shift.id}
                className="relative rounded px-1.5 py-0.5 flex items-center gap-1 group/chip"
                style={{ backgroundColor: roleColor + '18', borderLeft: `3px solid ${roleColor}` }}
              >
                <span className="font-mono text-[11px] text-zinc-800 flex-1 leading-relaxed">
                  {fmtTime(shift.start_time)}–{fmtTime(shift.end_time)}
                </span>
                <button
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteShift(shift.id);
                  }}
                  disabled={deletingId === shift.id}
                  className="opacity-0 group-hover/chip:opacity-100 transition-opacity shrink-0"
                >
                  <X className="w-2.5 h-2.5 text-zinc-400 hover:text-red-500" />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
