// types/database.ts
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
      }
    }
  }