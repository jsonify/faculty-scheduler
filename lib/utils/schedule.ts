import { Employee, TimeBlock } from "@/types/schedule";
import { BUSINESS_HOURS } from "@/lib/constants";

export function isTeacherActiveAtHour(schedule: TimeBlock[], hour: number): boolean {
  return schedule.some(block => block.hour === hour && block.isActive);
}

export function getActiveTeacherCount(employees: Employee[], hour: number): number {
  return employees.filter(employee => 
    isTeacherActiveAtHour(employee.schedule, hour)
  ).length;
}

export function getCurrentHourCoverage(employees: Employee[]): {
  activeStaff: number;
  totalStaff: number;
} {
  const currentHour = new Date().getHours();
  return {
    activeStaff: getActiveTeacherCount(employees, currentHour),
    totalStaff: employees.length,
  };
}

export function validateScheduleChange(
  employees: Employee[],
  employeeId: string,
  newHour: number,
  currentHour: number
): {
  isValid: boolean;
  message?: string;
} {
  const employee = employees.find(e => e.id === employeeId);
  if (!employee) return { isValid: false, message: "Employee not found" };

  // Check if the new hour is within business hours
  if (newHour < BUSINESS_HOURS.START || newHour >= BUSINESS_HOURS.END) {
    return {
      isValid: false,
      message: `Schedule must be between ${BUSINESS_HOURS.START}:00 AM and ${BUSINESS_HOURS.END % 12}:00 PM`
    };
  }

  // Get current active hours excluding the block being moved
  const currentActiveHours = employee.schedule
    .filter(block => block.isActive && block.hour !== currentHour)
    .length;

  // Adding new block would exceed maximum hours
  if (currentActiveHours >= BUSINESS_HOURS.MAX_HOURS) {
    return {
      isValid: false,
      message: `Cannot schedule more than ${BUSINESS_HOURS.MAX_HOURS} hours per teacher`
    };
  }

  return { isValid: true };
}