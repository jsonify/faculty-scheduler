// lib/types/employee-import.ts

export interface DayAvailability {
  start: string;
  end: string;
}

export interface WeeklyAvailability {
  mon: DayAvailability;
  tue: DayAvailability;
  wed: DayAvailability;
  thu: DayAvailability;
  fri: DayAvailability;
}

export interface EmployeeImportRow {
  name: string;
  role: 'teacher' | 'para-educator' | 'admin';  // Updated to match DB enum employee_role
  schedule_type: 'fixed' | 'flexible';
  default_start_time?: string;
  default_end_time?: string;
  mon_start?: string;
  mon_end?: string;
  tue_start?: string;
  tue_end?: string;
  wed_start?: string;
  wed_end?: string;
  thu_start?: string;
  thu_end?: string;
  fri_start?: string;
  fri_end?: string;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  errors: ImportValidationError[];
  importedEmployees: string[];
}

export interface ImportOptions {
  generateRandomSchedules?: boolean;
  skipDuplicates?: boolean;
  validateAvailability?: boolean;
}