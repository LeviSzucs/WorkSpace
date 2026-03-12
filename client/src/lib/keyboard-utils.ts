/**
 * Convert number input to time format
 * 9 -> 09:00
 * 17 -> 17:00
 * 930 -> 09:30
 */
export function numberToTime(input: string): string | null {
  const num = parseInt(input);
  
  if (isNaN(num)) return null;
  if (num < 0 || num > 2359) return null;

  // Single digit: 9 -> 09:00
  if (input.length === 1) {
    return `${String(num).padStart(2, '0')}:00`;
  }

  // Two digits: 17 -> 17:00, 09 -> 09:00
  if (input.length === 2) {
    const hour = num;
    if (hour > 23) return null;
    return `${String(hour).padStart(2, '0')}:00`;
  }

  // Three digits: 930 -> 09:30
  if (input.length === 3) {
    const hour = Math.floor(num / 100);
    const minute = num % 100;
    if (hour > 23 || minute > 59) return null;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  // Four digits: 1730 -> 17:30
  if (input.length === 4) {
    const hour = Math.floor(num / 100);
    const minute = num % 100;
    if (hour > 23 || minute > 59) return null;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  return null;
}

export interface GridCell {
  staffIndex: number;
  dayIndex: number;
}

export function moveRight(cell: GridCell, daysCount: number): GridCell {
  return {
    ...cell,
    dayIndex: Math.min(cell.dayIndex + 1, daysCount - 1),
  };
}

export function moveLeft(cell: GridCell): GridCell {
  return {
    ...cell,
    dayIndex: Math.max(cell.dayIndex - 1, 0),
  };
}

export function moveDown(cell: GridCell, staffCount: number): GridCell {
  return {
    ...cell,
    staffIndex: Math.min(cell.staffIndex + 1, staffCount - 1),
  };
}

export function moveUp(cell: GridCell): GridCell {
  return {
    ...cell,
    staffIndex: Math.max(cell.staffIndex - 1, 0),
  };
}
