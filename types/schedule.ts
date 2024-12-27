// types/schedule.ts

export type SupportLevel = 1 | 2 | 3;

export type TimeBlockType = 'work' | 'break' | 'lunch';

export type TimeBlock = {
  hour: number;
  isActive: boolean;
  type: TimeBlockType;
};

export type TimeSlot = {
  start: string;
  end: string;
};

export type Employee = {
  id: string;
  name: string;
  role: 'teacher' | 'para-educator';
  scheduleType: 'fixed' | 'flexible';
  defaultStartTime?: string;
  defaultEndTime?: string;
  availability?: EmployeeAvailability[];
  schedule?: TimeBlock[];
  timeBlocks?: TimeBlock[];
  isAvailable?: boolean;
  
  currentAssignment?: {
    studentId: string;
    startTime: string;
    endTime: string;
  } | null;
};

export type EmployeeAvailability = {
  id: string;
  employeeId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
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
