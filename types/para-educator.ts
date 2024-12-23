// types/para-educator.ts
import { Database } from './database';
import { StudentWithDetails } from './students';

export type ParaEducator = Database['public']['Tables']['employees']['Row'] & {
  shifts?: Database['public']['Tables']['shifts']['Row'][];
  student_schedules?: Database['public']['Tables']['student_schedules']['Row'][];
};

export type ParaEducatorWithAssignments = ParaEducator & {
  assignments?: Array<{
    id: string;
    start_time: string;
    end_time: string;
    location: string;
    student: StudentWithDetails;
  }>;
};

export type ParaEducatorCreateInput = {
  name: string;
  dailyCapacity?: number; // in minutes
  shiftStart?: string;
  shiftEnd?: string;
};

export type ParaEducatorUpdateInput = Partial<ParaEducatorCreateInput> & {
  id: string;
};

export type AssignmentCreateInput = {
  studentId: string;
  startTime: string;
  endTime: string;
  location?: string;
};

// Utility type for checking time conflicts
export type TimeSlot = {
  startTime: string;
  endTime: string;
};