export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  return date.toLocaleDateString('en-US', options);
}

export function formatTime(time: string): string {
  // Assumes time is in HH:mm:ss format
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export function groupShiftsByDay(shifts: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {};
  
  shifts.forEach((shift) => {
    const date = shift.shift_date;
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(shift);
  });

  // Sort by date
  const sorted: Record<string, any[]> = {};
  Object.keys(grouped)
    .sort()
    .forEach((date) => {
      sorted[date] = grouped[date];
    });

  return sorted;
}
