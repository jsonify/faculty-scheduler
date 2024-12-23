// types/database.ts
export interface Employee {
  id: string;
  name: string;
  role: "teacher" | "para-educator";
  created_at: string;
  schedules?: {
    id: string;
    hour: number;
    isActive: boolean;
    employee_id: string;
    created_at: string;
  }[];
  shifts?: Tables['shifts']['Row'][];
  breaks?: Tables['breaks']['Row'][];
}

export interface Shift {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

type Tables = Database['public']['Tables'];

export type Database = {
    public: {
      Tables: {
        employees: {
          Row: {
            id: string
            name: string
            role: string
            created_at: string
          }
          Insert: {
            id?: string
            name: string
            role: string
            created_at?: string
          }
          Update: {
            id?: string
            name?: string
            role?: string
            created_at?: string
          }
        }
        schedules: {
          Row: {
            id: string
            employee_id: string
            hour: number
            is_active: boolean
            created_at: string
          }
          Insert: {
            id?: string
            employee_id: string
            hour: number
            is_active?: boolean
            created_at?: string
          }
          Update: {
            id?: string
            employee_id?: string
            hour?: number
            is_active?: boolean
            created_at?: string
          }
        }
        shifts: {
          Row: {
            id: string
            employee_id: string
            date: string
            start_time: string
            end_time: string
            created_at: string
          }
          Insert: {
            id?: string
            employee_id: string
            date: string
            start_time: string
            end_time: string
            created_at?: string
          }
          Update: {
            id?: string
            employee_id?: string
            date?: string
            start_time?: string
            end_time?: string
            created_at?: string
          }
        }
        breaks: {
          Row: {
            id: string
            shift_id: string
            employee_id: string
            start_time: string
            duration: number
            is_flexible: boolean
            created_at: string
          }
          Insert: {
            id?: string
            shift_id: string
            employee_id: string
            start_time: string
            duration: number
            is_flexible?: boolean
            created_at?: string
          }
          Update: {
            id?: string
            shift_id?: string
            employee_id?: string
            start_time?: string
            duration?: number
            is_flexible?: boolean
            created_at?: string
          }
        }
        students: {
          Row: {
            id: string
            name: string
            grade: number
            support_level: number
            created_at: string
          }
          Insert: {
            id?: string
            name: string
            grade: number
            support_level: number
            created_at?: string
          }
          Update: {
            id?: string
            name?: string
            grade?: number
            support_level?: number
            created_at?: string
          }
        }
        
        student_schedules: {
          Row: {
            id: string
            student_id: string
            employee_id: string
            requires_support: boolean
            start_time: string
            end_time: string
            location: string
            created_at: string
          }
          Insert: {
            id?: string
            student_id: string
            employee_id: string
            requires_support?: boolean
            start_time: string
            end_time: string
            location?: string
            created_at?: string
          }
          Update: {
            id?: string
            student_id?: string
            employee_id?: string
            requires_support?: boolean
            start_time?: string
            end_time?: string
            location?: string
            created_at?: string
          }
        }
        
        support_requirements: {
          Row: {
            id: string
            student_id: string
            support_level: number
            notes: string | null
            created_at: string
          }
          Insert: {
            id?: string
            student_id: string
            support_level: number
            notes?: string | null
            created_at?: string
          }
          Update: {
            id?: string
            student_id?: string
            support_level?: number
            notes?: string | null
            created_at?: string
          }
        }
      }
    }
  }