// types/schedule.ts

export type SupportLevel = 1 | 2 | 3;

export type TimeBlock = {
  hour: number;
  isActive: boolean;
};

export type TimeSlot = {
  start: string;
  end: string;
};

export type Employee = {
  id: string;
  name: string;
  role: "Teacher" | "Para-Educator";  // Now explicitly typing roles
  schedule: TimeBlock[];
  availability: TimeSlot[];
  dailyCapacity?: number;
  shiftStart?: string;
  shiftEnd?: string;
  // New fields for para-educators
  isAvailable?: boolean;
  currentAssignment?: string;  // Student ID they're currently assigned to
};

export type Break = {
  id: string;
  employeeId: string;
  startTime: string;
  duration: number; // in minutes
  isFlexible: boolean;
};

export type Shift = {
  id: string;
  employeeId: string;
  date: string;
  startTime: string;
  endTime: string;
  breaks: Break[];
};

export type Coverage = {
  minimumStaff: number;
  optimalStaff: number;
  currentStaff: number;
};

export type Student = {
  id: string;
  name: string;
  supportLevel: SupportLevel;
  schedule: StudentScheduleBlock[];
};

export type StudentScheduleBlock = {
  hour: number;
  requiresSupport: boolean;
  supportProvided: boolean;
  paraEducatorId?: string;
};