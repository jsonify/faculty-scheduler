import { Break, Coverage, Employee, Shift } from "@/types/schedule";

export function calculateCoverage(
  shifts: Shift[],
  timeSlot: { start: string; end: string }
): Coverage {
  const staffCount = shifts.filter((shift) => {
    const shiftStart = new Date(`${shift.date}T${shift.startTime}`);
    const shiftEnd = new Date(`${shift.date}T${shift.endTime}`);
    const slotStart = new Date(`${shift.date}T${timeSlot.start}`);
    const slotEnd = new Date(`${shift.date}T${timeSlot.end}`);
    
    return shiftStart <= slotEnd && shiftEnd >= slotStart;
  }).length;

  return {
    minimumStaff: 2, // Configurable
    optimalStaff: 3, // Configurable
    currentStaff: staffCount,
  };
}

export function optimizeBreaks(
  shifts: Shift[],
  coverage: Coverage
): Shift[] {
  if (coverage.currentStaff <= coverage.minimumStaff) {
    return redistributeBreaks(shifts);
  }
  return shifts;
}

function redistributeBreaks(shifts: Shift[]): Shift[] {
  return shifts.map((shift) => {
    const flexibleBreaks = shift.breaks.filter((b) => b.isFlexible);
    // Implement break redistribution logic here
    return shift;
  });
}