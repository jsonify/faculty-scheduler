// types/database.ts

export type EmployeeRole = 'teacher' | 'para-educator' | 'admin';

export interface EmployeeSchedule {
  id: string;
  employee_id: string;
  hour: number;
  is_active: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  is_active: boolean;
  archived_at?: string;
  archived_by?: string;
  created_at: string;
  schedules?: EmployeeSchedule[];
  shifts?: Shift[];
  breaks?: Break[];
}

export interface Shift {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_active?: boolean;
  archived_at?: string;
  archived_by?: string;
  created_at: string;
}

export interface Break {
  id: string;
  shift_id: string;
  employee_id: string;
  start_time: string;
  duration: number;
  is_flexible: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  support_level: number;
  created_at: string;
}

export interface StudentSchedule {
  id: string;
  student_id: string;
  employee_id: string;
  requires_support: boolean;
  start_time: string;
  end_time: string;
  location?: string;
  created_at: string;
}

export interface SupportRequirement {
  id: string;
  student_id: string;
  support_level: number;
  notes?: string | null;
  created_at: string;
}

export interface DataPurgeLog {
  id: string;
  purge_level: 'soft' | 'hard' | 'complete';
  role: 'teacher' | 'para-educator' | 'all';
  initiated_by?: string;
  initiated_at: string;
  records_affected?: number;
  backup_created?: boolean;
}

export type Database = {
  public: {
    Tables: {
      employees: {
        Row: Employee,
        Insert: Omit<Employee, 'id' | 'created_at'> & { 
          id?: string, 
          created_at?: string 
        },
        Update: Partial<Omit<Employee, 'id' | 'created_at'>> & { 
          id?: string, 
          created_at?: string 
        }
      },
      employee_schedules: {
        Row: EmployeeSchedule,
        Insert: Omit<EmployeeSchedule, 'id' | 'created_at'> & {
          id?: string,
          created_at?: string
        },
        Update: Partial<Omit<EmployeeSchedule, 'id' | 'created_at'>> & {
          id?: string,
          created_at?: string
        }
      },
      shifts: {
        Row: Shift,
        Insert: Omit<Shift, 'id' | 'created_at'> & { 
          id?: string, 
          created_at?: string 
        },
        Update: Partial<Omit<Shift, 'id' | 'created_at'>> & { 
          id?: string, 
          created_at?: string 
        }
      },
      breaks: {
        Row: Break,
        Insert: Omit<Break, 'id' | 'created_at'> & { 
          id?: string, 
          created_at?: string 
        },
        Update: Partial<Omit<Break, 'id' | 'created_at'>> & { 
          id?: string, 
          created_at?: string 
        }
      },
      students: {
        Row: Student,
        Insert: Omit<Student, 'id' | 'created_at'> & { 
          id?: string, 
          created_at?: string 
        },
        Update: Partial<Omit<Student, 'id' | 'created_at'>> & { 
          id?: string, 
          created_at?: string 
        }
      },
      student_schedules: {
        Row: StudentSchedule,
        Insert: Omit<StudentSchedule, 'id' | 'created_at'> & { 
          id?: string, 
          created_at?: string 
        },
        Update: Partial<Omit<StudentSchedule, 'id' | 'created_at'>> & { 
          id?: string, 
          created_at?: string 
        }
      },
      support_requirements: {
        Row: SupportRequirement,
        Insert: Omit<SupportRequirement, 'id' | 'created_at'> & { 
          id?: string, 
          created_at?: string 
        },
        Update: Partial<Omit<SupportRequirement, 'id' | 'created_at'>> & { 
          id?: string, 
          created_at?: string 
        }
      },
      data_purge_log: {
        Row: DataPurgeLog,
        Insert: Omit<DataPurgeLog, 'id' | 'initiated_at'> & { 
          id?: string, 
          initiated_at?: string 
        },
        Update: Partial<Omit<DataPurgeLog, 'id' | 'initiated_at'>> & { 
          id?: string, 
          initiated_at?: string 
        }
      }
    }
  }
};