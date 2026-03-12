import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ShiftGridCell } from './ShiftGridCell';
import { DAYS_OF_WEEK } from '@/lib/week-utils';
import { numberToTime, moveRight, moveLeft, moveDown, moveUp, type GridCell } from '@/lib/keyboard-utils';

interface StaffMember {
  user_id: string;
  email: string;
  role: string;
  department?: string;
}

interface JobRole {
  id: string;
  name: string;
  department: string;
}

interface Shift {
  id: string;
  shift_date: string;
  start_time: string;
  end_time: string;
  job_role_name: string;
  assigned_staff: Array<{
    user_id: string;
    user_name: string;
  }>;
}

interface RotaGridProps {
  staff: StaffMember[];
  shifts: Shift[];
  weekStart: Date;
  venueId: string;
  jobRoles: JobRole[];
  onShiftAdded: () => void;
  onShiftDeleted: () => void;
}

export function RotaGrid({
  staff,
  shifts,
  weekStart,
  venueId,
  jobRoles,
  onShiftAdded,
  onShiftDeleted,
}: RotaGridProps) {
  // Extract unique departments from job_roles (this is the grid structure)
  const departmentList = useMemo(() => {
    const depts = [...new Set((jobRoles || []).map((role) => role.department).filter(Boolean))];
    return depts.sort();
  }, [jobRoles]);

  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(
    new Set(departmentList)
  );

  // Keyboard navigation state
  const [focusedCell, setFocusedCell] = useState<GridCell | null>(null);
  const [numberInput, setNumberInput] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Build grid structure: departments with staff rows underneath
  // Department → Staff rows for that department
  const gridStructure = useMemo(() => {
    const structure: Record<string, StaffMember[]> = {};
    
    // Initialize all departments from job_roles
    departmentList.forEach((dept) => {
      if (dept) structure[dept] = [];
    });

    // Map staff to departments based on job roles they're assigned to
    // For now, assign based on available job roles in their department
    (staff || []).forEach((member) => {
      if (!member || !member.user_id) return;
      
      // Get all departments for this staff member's roles
      const memberDepts = (jobRoles || [])
        .filter((role) => role.department) // Only departments with roles
        .map((role) => role.department);
      
      // Assign to all departments they have roles in, default to first dept if none found
      if (memberDepts.length > 0) {
        const uniqueDepts = [...new Set(memberDepts)];
        uniqueDepts.forEach((dept) => {
          if (structure[dept]) {
            structure[dept].push(member);
          }
        });
      } else if (departmentList[0]) {
        structure[departmentList[0]].push(member);
      }
    });

    return structure;
  }, [staff, jobRoles, departmentList]);

  const departments = gridStructure;

  const toggleDepartment = (dept: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(dept)) {
      newExpanded.delete(dept);
    } else {
      newExpanded.add(dept);
    }
    setExpandedDepartments(newExpanded);
  };

  const getStaffShifts = (staffId: string, date: string) => {
    if (!staffId || !date) return [];
    return (shifts || []).filter(
      (shift) =>
        shift?.shift_date === date &&
        (shift?.assigned_staff || []).some((s) => s?.user_id === staffId)
    );
  };

  // Build flat list of staff across all departments for navigation
  const flatStaffList = useMemo(() => {
    const list: StaffMember[] = [];
    departmentList.forEach((dept) => {
      list.push(...(departments[dept] || []));
    });
    return list;
  }, [departments, departmentList]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!focusedCell) return;

      // Number input for times
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        const newInput = numberInput + e.key;
        const time = numberToTime(newInput);
        if (time) {
          setNumberInput(newInput);
        }
        return;
      }

      // Backspace to clear number input
      if (e.key === 'Backspace' && numberInput) {
        e.preventDefault();
        setNumberInput(numberInput.slice(0, -1));
        return;
      }

      // Tab / Shift+Tab for day navigation
      if (e.key === 'Tab') {
        e.preventDefault();
        const newCell = e.shiftKey
          ? moveLeft(focusedCell)
          : moveRight(focusedCell, DAYS_OF_WEEK.length);
        setFocusedCell(newCell);
        setNumberInput('');
        focusCell(newCell);
        return;
      }

      // Arrow keys for staff navigation
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newCell = moveUp(focusedCell);
        setFocusedCell(newCell);
        setNumberInput('');
        focusCell(newCell);
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newCell = moveDown(focusedCell, flatStaffList.length);
        setFocusedCell(newCell);
        setNumberInput('');
        focusCell(newCell);
        return;
      }

      // Enter to trigger edit
      if (e.key === 'Enter') {
        e.preventDefault();
        const cellElement = cellRefs.current.get(`cell-${focusedCell.staffIndex}-${focusedCell.dayIndex}`);
        if (cellElement) {
          cellElement.click();
        }
        return;
      }

      // Escape to clear focus
      if (e.key === 'Escape') {
        e.preventDefault();
        setFocusedCell(null);
        setNumberInput('');
        return;
      }
    },
    [focusedCell, numberInput, flatStaffList.length]
  );

  const focusCell = (cell: GridCell) => {
    const cellElement = cellRefs.current.get(`cell-${cell.staffIndex}-${cell.dayIndex}`);
    if (cellElement) {
      cellElement.focus();
    }
  };

  // Attach keyboard listener
  useEffect(() => {
    if (focusedCell) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [focusedCell, handleKeyDown]);

  // If no departments exist, show empty state
  if (departmentList.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
        <p className="text-zinc-600">No departments configured for this venue.</p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="rounded-lg bg-zinc-50 border border-zinc-200 p-12 text-center">
        <p className="text-zinc-600">No staff assigned to this venue.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-zinc-200" ref={gridRef}>
      <div className="inline-block min-w-full" onKeyDown={handleKeyDown}>
        {/* Header Row */}
        <div className="flex sticky top-0 z-10 bg-white border-b border-zinc-200">
          <div className="w-48 px-4 py-3 font-semibold text-sm text-zinc-900 sticky left-0 bg-white border-r border-zinc-200 z-20">
            Staff
          </div>
          {DAYS_OF_WEEK.map((dayName, dayIndex) => {
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + dayIndex);
            const dateStr = dayDate.toISOString().split('T')[0];
            return (
              <div
                key={dayIndex}
                className="w-40 px-4 py-3 font-semibold text-sm text-zinc-900 border-r border-zinc-200 text-center"
              >
                <div className="text-xs text-zinc-500 uppercase">{dayName}</div>
                <div className="text-sm">{dayDate.getDate()}</div>
              </div>
            );
          })}
        </div>

        {/* Department Sections */}
        {departmentList.map((deptName) => {
          const deptMembers = departments[deptName] || [];
          if (deptMembers.length === 0) return null;

          const isExpanded = expandedDepartments.has(deptName);

          return (
            <div key={deptName}>
              {/* Department Header */}
              <div
                className="flex items-center sticky left-0 z-20 bg-zinc-50 border-t border-b border-zinc-200 cursor-pointer hover:bg-zinc-100 transition-colors"
                onClick={() => toggleDepartment(deptName)}
              >
                <div className="w-48 px-4 py-2 flex items-center gap-2 border-r border-zinc-200">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-zinc-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-600" />
                  )}
                  <span className="text-sm font-semibold text-zinc-900">{deptName}</span>
                  <span className="text-xs text-zinc-500">({deptMembers.length})</span>
                </div>
                <div className="flex-1 h-full" />
              </div>

              {/* Staff Rows */}
              {isExpanded &&
                deptMembers.map((member, staffIdx) => {
                  if (!member || !member.email) return null;
                  const userName = member.email.split('@')[0];
                  const globalStaffIndex = flatStaffList.findIndex((s) => s?.user_id === member.user_id);
                  return (
                    <div key={member.user_id} className="flex border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <div className="w-48 px-4 py-2 font-medium text-sm text-zinc-900 sticky left-0 bg-white border-r border-zinc-200 z-20 truncate">
                        {userName}
                      </div>
                      {DAYS_OF_WEEK.map((_, dayIndex) => {
                        const dayDate = new Date(weekStart);
                        dayDate.setDate(dayDate.getDate() + dayIndex);
                        const dateStr = dayDate.toISOString().split('T')[0];
                        const staffShifts = getStaffShifts(member.user_id, dateStr);
                        const cellKey = `cell-${globalStaffIndex}-${dayIndex}`;
                        const isFocused = focusedCell?.staffIndex === globalStaffIndex && focusedCell?.dayIndex === dayIndex;

                        return (
                          <div
                            key={`${member.user_id}-${dateStr}`}
                            className={`w-40 px-3 py-2 border-r border-zinc-200 ${isFocused ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`}
                            ref={(el) => {
                              if (el) cellRefs.current.set(cellKey, el);
                            }}
                            tabIndex={isFocused ? 0 : -1}
                            onClick={() => setFocusedCell({ staffIndex: globalStaffIndex, dayIndex })}
                            onFocus={() => setFocusedCell({ staffIndex: globalStaffIndex, dayIndex })}
                          >
                            <ShiftGridCell
                              staffId={member.user_id}
                              staffName={userName}
                              date={dateStr}
                              shifts={staffShifts}
                              onShiftAdded={onShiftAdded}
                              onShiftDeleted={onShiftDeleted}
                              venueId={venueId}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      {/* Keyboard Hints */}
      <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-600 space-y-1">
        <p>⌨️ <strong>Keyboard shortcuts:</strong> Number keys for time (9→09:00, 17→17:00) • Tab/Shift+Tab to move days • Arrow keys to move staff • Enter to edit • Escape to exit</p>
        <p>🖱️ Click any cell to add/edit shifts directly • Hover to delete shifts</p>
      </div>
    </div>
  );
}
