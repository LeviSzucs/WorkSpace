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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  // Sync refs so blur/navigate handlers see current values without stale closures
  const editingRef = useRef(false);
  const savingRef = useRef(false);

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
    editingRef.current = true;
    setEditing(true);
    requestAnimationFrame(() => startRef.current?.focus());
  }, []);

  const closeEditor = useCallback(() => {
    editingRef.current = false;
    setEditing(false);
    containerRef.current?.focus();
  }, []);

  // Fire-and-forget: caller closes the editor and navigates before calling this.
  // On failure shows a red flash on the cell so the user knows to re-enter.
  const save = useCallback(
    async (startVal: string, endVal: string) => {
      if (savingRef.current || startVal === endVal) return;
      savingRef.current = true;

      // Hospitality shifts cross midnight: 19:00–02:00 ends on the next day
      const crossesMidnight = endVal < startVal;
      let endDate = date;
      if (crossesMidnight) {
        const d = new Date(date);
        d.setDate(d.getDate() + 1);
        endDate = d.toISOString().split('T')[0];
      }

      try {
        const { data: shift, error: shiftErr } = await supabase
          .from('shifts')
          .insert({
            venue_id: venueId,
            starts_at: `${date}T${startVal}:00`,
            ends_at: `${endDate}T${endVal}:00`,
            job_role_id: jobRoleId,
          })
          .select('id')
          .single();
        if (shiftErr) throw shiftErr;

        const { error: assignErr } = await supabase
          .from('shift_assignments')
          .insert({ shift_id: shift.id, user_id: staffId });
        if (assignErr) throw assignErr;

        onShiftSaved();
      } catch (err) {
        console.error('[ShiftGridCell] Save failed:', err);
        setSaveError(true);
        setTimeout(() => setSaveError(false), 2500);
      } finally {
        savingRef.current = false;
      }
    },
    [venueId, date, jobRoleId, staffId, onShiftSaved],
  );

  // Close + save + move right/left  — Tab always navigates instantly
  const commitAndMove = useCallback(
    (dir: 'right' | 'left') => {
      const s = startRef.current?.value ?? startTime;
      const en = endRef.current?.value ?? endTime;
      editingRef.current = false;
      setEditing(false);
      void save(s, en);
      onNavigate(dir);
    },
    [startTime, endTime, save, onNavigate],
  );

  // Close + save + stay on cell  — Enter
  const commitAndStay = useCallback(() => {
    const s = startRef.current?.value ?? startTime;
    const en = endRef.current?.value ?? endTime;
    editingRef.current = false;
    setEditing(false);
    void save(s, en);
    containerRef.current?.focus();
  }, [startTime, endTime, save]);

  // Auto-save when focus leaves the cell entirely (e.g. clicking another cell)
  const handleContainerBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      if (!editingRef.current || savingRef.current) return;
      if (containerRef.current?.contains(e.relatedTarget as Node)) return;
      const s = startRef.current?.value ?? startTime;
      const en = endRef.current?.value ?? endTime;
      editingRef.current = false;
      setEditing(false);
      void save(s, en);
    },
    [startTime, endTime, save],
  );

  const deleteShift = useCallback(
    async (shiftId: string) => {
      setDeletingId(shiftId);
      try {
        await supabase.from('shift_assignments').delete().eq('shift_id', shiftId).eq('user_id', staffId);
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
        ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down',
      };
      if (dirs[e.key]) { e.preventDefault(); onNavigate(dirs[e.key]); }
    },
    [editing, shifts, openEditor, deleteShift, onNavigate],
  );

  const timeInputClass =
    'flex-1 min-w-0 text-xs px-1 py-0.5 rounded border border-blue-300 bg-white font-mono ' +
    'focus:outline-none focus:ring-1 focus:ring-blue-500 ' +
    '[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden';

  return (
    <div
      ref={setRef}
      tabIndex={editing ? -1 : 0}
      className={[
        'flex-1 border-r border-zinc-200 p-1 outline-none transition-colors group',
        saveError
          ? 'ring-2 ring-inset ring-red-400 bg-red-50'
          : editing
          ? ''
          : isActive
          ? 'bg-blue-50 ring-2 ring-inset ring-blue-400'
          : 'cursor-pointer hover:bg-zinc-50/80',
      ].join(' ')}
      onFocus={!editing ? onActivate : undefined}
      onClick={!editing ? openEditor : undefined}
      onKeyDown={handleContainerKey}
      onBlur={handleContainerBlur}
    >
      {editing ? (
        <div className="rounded border-2 border-blue-500 bg-blue-50 p-1.5 space-y-1">
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
              className={timeInputClass}
            />
            <span className="text-[10px] text-zinc-400 shrink-0">–</span>
            <input
              ref={endRef}
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitAndStay();
                } else if (e.key === 'Tab') {
                  e.preventDefault();
                  commitAndMove(e.shiftKey ? 'left' : 'right');
                } else if (e.key === 'Escape') {
                  closeEditor();
                }
              }}
              className={timeInputClass}
            />
          </div>
          <p className="text-[9px] text-zinc-400 leading-none select-none">
            Tab saves &amp; next · Esc cancel
          </p>
        </div>
      ) : (
        <div className="min-h-[36px] flex flex-col gap-0.5">
          {shifts.length === 0 ? (
            <div className="min-h-[36px] flex items-center justify-center select-none">
              {isActive && <span className="text-[10px] text-zinc-400">↵ to add</span>}
            </div>
          ) : (
            shifts.map((shift) => (
              <div
                key={shift.id}
                className="rounded px-1 py-0.5 flex items-center gap-1 group/chip"
                style={{ backgroundColor: roleColor + '18', borderLeft: `3px solid ${roleColor}` }}
              >
                <span className="font-mono text-[11px] text-zinc-800 flex-1 leading-relaxed truncate">
                  {fmtTime(shift.start_time)}–{fmtTime(shift.end_time)}
                </span>
                <button
                  tabIndex={-1}
                  onClick={(e) => { e.stopPropagation(); deleteShift(shift.id); }}
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
