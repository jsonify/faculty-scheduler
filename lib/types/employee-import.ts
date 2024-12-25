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
  email: string;
  role: 'teacher' | 'para-educator' | 'admin';
  schedule_type: 'fixed' | 'flexible';
  start_time: string;
  end_time: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
}

export interface ImportValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  errors: ImportValidationError[];
}

export interface ImportOptions {
  skipDuplicates?: boolean;
  generateRandomSchedules?: boolean;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulImports: number;
  errors: ImportValidationError[];
  importedEmployees: string[];
}