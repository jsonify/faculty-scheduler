// types/students.ts
import { Database } from './database'

export type Student = Database['public']['Tables']['students']['Row']
export type StudentSchedule = Database['public']['Tables']['student_schedules']['Row']
export type SupportRequirement = Database['public']['Tables']['support_requirements']['Row']

export type StudentWithDetails = Student & {
  support_requirements?: SupportRequirement | null
  student_schedules?: StudentSchedule[]
  employee?: {
    id: string
    name: string
    role: string
  }
}

export type SupportLevel = 1 | 2 | 3

export type StudentCreateInput = {
  name: string
  grade: number
  support_level: SupportLevel
}

export type StudentUpdateInput = Partial<StudentCreateInput> & {
  id: string
}

export type ScheduleCreateInput = {
  student_id: string
  employee_id: string
  start_time: string
  end_time: string
  requires_support?: boolean
  location?: string
}