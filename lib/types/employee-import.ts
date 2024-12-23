// lib/types/employee-import.ts

export interface EmployeeImportRow {
    name: string;
    role: 'teacher' | 'para-educator';
    schedule_type: 'fixed' | 'flexible';
    default_start_time?: string;
    default_end_time?: string;
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
    importedEmployees: string[]; // IDs of successfully imported employees
  }
  
  export interface ImportOptions {
    generateRandomSchedules?: boolean;
    skipDuplicates?: boolean;
  }