import { useState, useMemo, useRef, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ShiftGridCell, type ShiftItem } from './ShiftGridCell';
import { DAYS_OF_WEEK } from '@/lib/week-utils';

interface StaffJobRoleMapping {
  user_id: string;
  full_name: string;
  job_role_id: string;
  venue_id: string;
  department_name: string;
  venue_role: string;
}

interface JobRole {
  id: string;
  name: string;
  department: string;
  colour: string;
}

interface Shift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  job_role_name: string;
  assigned_staff: Array<{ user_id: string; user_name: string }>;
}

interface RotaGridProps {
  staffJobRoles: StaffJobRoleMapping[];
  shifts: Shift[];
  weekStart: Date;
  venueId: string;
  jobRoles: JobRole[];
  onShiftAdded: () => void;
  onShiftDeleted: () => void;
}

export function RotaGrid({
  staffJobRoles,
  shifts,
  weekStart,
  venueId,
  jobRoles,
  onShiftAdded,
  onShiftDeleted,
}: RotaGridProps) {
  const jobRoleMap = useMemo(
    () => new Map((jobRoles || []).map((r) => [r.id, r])),
    [jobRoles],
  );

  const departmentList = useMemo(() => {
    if (!jobRoles?.length) return [];
    return [...new Set(jobRoles.map((r) => r.department).filter(Boolean))].sort();
  }, [jobRoles]);

  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(
    () => new Set(departmentList),
  );

  const gridStructure = useMemo(() => {
    const out: Record<string, StaffJobRoleMapping[]> = {};
    departmentList.forEach((d) => { out[d] = []; });
    (staffJobRoles || []).forEach((m) => {
      if (!m?.user_id || !m?.department_name) return;
      if (out[m.department_name] && !out[m.department_name].some((s) => s.user_id === m.user_id)) {
        out[m.department_name].push(m);
      }
    });
    return out;
  }, [staffJobRoles, departmentList]);

  // Only visible (expanded) staff are navigable — keeps siCursor in sync with visibleStaff
  const visibleStaff = useMemo(() => {
    const list: StaffJobRoleMapping[] = [];
    departmentList.forEach((d) => {
      if (expandedDepts.has(d)) list.push(...(gridStructure[d] || []));
    });
    return list;
  }, [gridStructure, departmentList, expandedDepts]);

  const [activeCell, setActiveCell] = useState<{ si: number; di: number } | null>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const focusCell = useCallback((si: number, di: number) => {
    cellRefs.current.get(`${si}-${di}`)?.focus();
  }, []);

  const navigate = useCallback(
    (si: number, di: number, dir: 'right' | 'left' | 'up' | 'down') => {
      const maxDi = DAYS_OF_WEEK.length - 1;
      const maxSi = visibleStaff.length - 1;
      let nsi = si;
      let ndi = di;
      if (dir === 'right') {
        if (di < maxDi) ndi = di + 1;
        else if (si < maxSi) { nsi = si + 1; ndi = 0; }
      } else if (dir === 'left') {
        if (di > 0) ndi = di - 1;
        else if (si > 0) { nsi = si - 1; ndi = maxDi; }
      } else if (dir === 'up') {
        nsi = Math.max(0, si - 1);
      } else {
        nsi = Math.min(maxSi, si + 1);
      }
      focusCell(nsi, ndi);
    },
    [visibleStaff.length, focusCell],
  );

  const getStaffShifts = useCallback(
    (staffId: string, date: string): ShiftItem[] =>
      (shifts || [])
        .filter(
          (s) =>
            s?.shift_date === date &&
            (s?.assigned_staff || []).some((a) => a?.user_id === staffId),
        )
        .map((s) => ({
          id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
          job_role_name: s.job_role_name,
        })),
    [shifts],
  );

  const toggleDept = useCallback((d: string) => {
    setExpandedDepts((prev) => {
      const next = new Set(prev);
      next.has(d) ? next.delete(d) : next.add(d);
      return next;
    });
  }, []);

  if (departmentList.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
        <p className="text-zinc-600">No departments configured for this venue.</p>
      </div>
    );
  }

  // siCursor tracks visible-staff index across all expanded depts, reset each render
  let siCursor = 0;

  return (
    <div className="w-full bg-white rounded-lg border border-zinc-200">
      <div className="w-full">
        {/* Header row */}
        <div className="flex sticky top-0 z-10 bg-zinc-50 border-b-2 border-zinc-300">
          <div className="w-40 shrink-0 px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wide sticky left-0 bg-zinc-50 border-r border-zinc-200 z-20">
            Staff
          </div>
          {DAYS_OF_WEEK.map((dayName, di) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + di);
            return (
              <div key={di} className="flex-1 px-2 py-1.5 border-r border-zinc-200 text-center min-w-0">
                <div className="text-xs font-semibold text-zinc-500 uppercase">{dayName.slice(0, 3)}</div>
                <div className="text-sm font-bold text-zinc-900">{d.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Department sections */}
        {departmentList.map((deptName) => {
          const members = gridStructure[deptName] || [];
          if (members.length === 0) return null;
          const isExpanded = expandedDepts.has(deptName);
          const deptRole = (jobRoles || []).find(
            (r) => r.name === deptName || r.department === deptName,
          );
          const deptColor = deptRole?.colour ?? '#94a3b8';

          return (
            <div key={deptName}>
              {/* Dept header */}
              <div
                className="flex items-center w-full bg-zinc-100 border-t border-b border-zinc-200 cursor-pointer hover:bg-zinc-200 transition-colors"
                style={{ borderLeft: `4px solid ${deptColor}` }}
                onClick={() => toggleDept(deptName)}
              >
                <div className="w-40 shrink-0 px-3 py-1 flex items-center gap-1.5 border-r border-zinc-200">
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-zinc-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-zinc-500 shrink-0" />
                  )}
                  <span className="text-xs font-bold text-zinc-800 uppercase tracking-wide truncate">
                    {deptName}
                  </span>
                  <span className="text-xs text-zinc-500 shrink-0">({members.length})</span>
                </div>
                <div className="flex-1" />
              </div>

              {/* Staff rows */}
              {isExpanded &&
                members.map((mapping) => {
                  if (!mapping?.user_id) return null;
                  const si = siCursor++;
                  const userName = mapping.full_name || 'Unknown';
                  const roleColor = jobRoleMap.get(mapping.job_role_id)?.colour ?? '#3b82f6';

                  return (
                    <div key={mapping.user_id} className="flex border-b border-zinc-100">
                      <div className="w-40 shrink-0 px-3 py-1 flex items-center text-sm text-zinc-900 sticky left-0 bg-white border-r border-zinc-200 z-10 truncate">
                        {userName}
                      </div>
                      {DAYS_OF_WEEK.map((_, di) => {
                        const d = new Date(weekStart);
                        d.setDate(d.getDate() + di);
                        const dateStr = d.toISOString().split('T')[0];
                        const cellShifts = getStaffShifts(mapping.user_id, dateStr);
                        const isActive = activeCell?.si === si && activeCell?.di === di;

                        return (
                          <ShiftGridCell
                            key={`${mapping.user_id}-${dateStr}`}
                            staffId={mapping.user_id}
                            date={dateStr}
                            shifts={cellShifts}
                            jobRoleId={mapping.job_role_id}
                            roleColor={roleColor}
                            venueId={venueId}
                            isActive={isActive}
                            onActivate={() => setActiveCell({ si, di })}
                            onShiftSaved={onShiftAdded}
                            onShiftDeleted={onShiftDeleted}
                            onNavigate={(dir) => navigate(si, di, dir)}
                            registerRef={(el) => cellRefs.current.set(`${si}-${di}`, el)}
                          />
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      <div className="px-3 py-1.5 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-500">
        <strong>Keyboard:</strong> Click or ↵ / type a number to add a shift · Tab / Shift+Tab moves between days · Arrow keys move between staff · Esc to cancel
      </div>
    </div>
  );
}
