import { useState, useRef, useCallback, useMemo } from 'react';
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
  // Optimistic entries shown immediately on commit, removed once real data arrives
  const [optimisticShifts, setOptimisticShifts] = useState<ShiftItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);
  const editingRef = useRef(false);
  const savingRef = useRef(false);

  // Merge real + optimistic, deduplicating by HH:MM time once real data arrives
  const displayShifts = useMemo(() => {
    const pending = optimisticShifts.filter(
      (os) =>
        !shifts.some(
          (s) => fmtTime(s.start_time) === os.start_time && fmtTime(s.end_time) === os.end_time,
        ),
    );
    return [...shifts, ...pending];
  }, [shifts, optimisticShifts]);

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

  const save = useCallback(
    async (startVal: string, endVal: string) => {
      if (savingRef.current || startVal === endVal) return;
      savingRef.current = true;

      // Show chip immediately — don't wait for the DB round-trip
      const optimisticId = `opt-${Date.now()}`;
      setOptimisticShifts((prev) => [
        ...prev,
        { id: optimisticId, start_time: startVal, end_time: endVal, job_role_name: '' },
      ]);

      // Hospitality shifts can cross midnight (e.g. 19:00–02:00)
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
        // Remove the optimistic chip and flash the cell red
        setOptimisticShifts((prev) => prev.filter((s) => s.id !== optimisticId));
        setSaveError(true);
        setTimeout(() => setSaveError(false), 2500);
      } finally {
        savingRef.current = false;
      }
    },
    [venueId, date, jobRoleId, staffId, onShiftSaved],
  );

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

  const commitAndStay = useCallback(() => {
    const s = startRef.current?.value ?? startTime;
    const en = endRef.current?.value ?? endTime;
    editingRef.current = false;
    setEditing(false);
    void save(s, en);
    containerRef.current?.focus();
  }, [startTime, endTime, save]);

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
      if ((e.key === 'Delete' || e.key === 'Backspace') && displayShifts.length > 0) {
        e.preventDefault();
        const last = displayShifts[displayShifts.length - 1];
        if (!last.id.startsWith('opt-')) deleteShift(last.id);
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
    [editing, displayShifts, openEditor, deleteShift, onNavigate],
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
          {displayShifts.length === 0 ? (
            <div className="min-h-[36px] flex items-center justify-center select-none">
              {isActive && <span className="text-[10px] text-zinc-400">↵ to add</span>}
            </div>
          ) : (
            displayShifts.map((shift) => (
              <div
                key={shift.id}
                className="rounded px-1 py-0.5 flex items-center gap-1 group/chip"
                style={{ backgroundColor: roleColor + '18', borderLeft: `3px solid ${roleColor}` }}
              >
                <span className="font-mono text-[11px] text-zinc-800 flex-1 leading-relaxed truncate">
                  {fmtTime(shift.start_time)}–{fmtTime(shift.end_time)}
                </span>
                {!shift.id.startsWith('opt-') && (
                  <button
                    tabIndex={-1}
                    onClick={(e) => { e.stopPropagation(); deleteShift(shift.id); }}
                    disabled={deletingId === shift.id}
                    className="opacity-0 group-hover/chip:opacity-100 transition-opacity shrink-0"
                  >
                    <X className="w-2.5 h-2.5 text-zinc-400 hover:text-red-500" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
