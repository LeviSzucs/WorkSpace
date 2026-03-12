import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ShiftGridCell } from './ShiftGridCell';
import { DAYS_OF_WEEK } from '@/lib/week-utils';

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
  // Get unique departments from job_roles and sort them
  const departmentList = useMemo(() => {
    const depts = [...new Set(jobRoles.map((role) => role.department))];
    return depts.sort();
  }, [jobRoles]);

  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(
    new Set(departmentList)
  );

  // Group staff by department from job_roles
  const groupByDepartment = (members: StaffMember[]) => {
    const groups: Record<string, StaffMember[]> = {};
    
    // Initialize all departments from job_roles
    departmentList.forEach((dept) => {
      groups[dept] = [];
    });

    // Assign staff to departments based on their role/manager status
    members.forEach((member) => {
      // Managers and supervisors go to "Management" if it exists
      if (member.role === 'VENUE_MANAGER' || member.role === 'SUPERVISOR') {
        const mgmtDept = departmentList.find((d) => d.toLowerCase().includes('management'));
        if (mgmtDept) {
          groups[mgmtDept].push(member);
        } else {
          groups[departmentList[0]].push(member);
        }
      } else {
        // Regular staff go to the first department (typically Front of House)
        groups[departmentList[0]].push(member);
      }
    });

    return groups;
  };

  const departments = groupByDepartment(staff);

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
    return shifts.filter(
      (shift) =>
        shift.shift_date === date &&
        shift.assigned_staff.some((s) => s.user_id === staffId)
    );
  };

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
    <div className="overflow-x-auto bg-white rounded-lg border border-zinc-200">
      <div className="inline-block min-w-full">
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
                deptMembers.map((member) => {
                  const userName = member.email.split('@')[0];
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

                        return (
                          <div
                            key={`${member.user_id}-${dateStr}`}
                            className="w-40 px-3 py-2 border-r border-zinc-200"
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
      <div className="px-4 py-3 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-600">
        <p>💡 Click any cell to add a shift • Arrow keys to navigate • Delete shifts with hover menu</p>
      </div>
    </div>
  );
}
