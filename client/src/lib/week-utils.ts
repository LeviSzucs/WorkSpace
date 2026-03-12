// Week start logic: Monday is the first day of the week (day 0)
// JavaScript getDay(): 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
// Conversion: (getDay() + 6) % 7 = Monday-based day index (0=Monday, 1=Tuesday, ..., 6=Sunday)

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  // Days since Monday: Sunday=6, Monday=0, Tuesday=1, ..., Saturday=5
  const daysSinceMonday = (day + 6) % 7;
  const diff = d.getDate() - daysSinceMonday;
  return new Date(d.setDate(diff));
}

export function getWeekEnd(date: Date): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // Monday + 6 days = Sunday
  return end;
}

export function getWeekLabel(date: Date): string {
  const start = getWeekStart(date);
  const end = getWeekEnd(date);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}

export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  return date.getDay();
}

export function getMonday(date: Date): Date {
  return getWeekStart(date);
}

export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
