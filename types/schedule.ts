export type TimeBlock = {
  hour: number;
  isActive: boolean;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  schedule: TimeBlock[];
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