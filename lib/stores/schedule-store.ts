// lib/stores/schedule-store.ts
import { create } from 'zustand';
import { Employee } from '@/types/schedule';
import { supabase } from '@/lib/supabase';
import { BUSINESS_HOURS } from '@/lib/constants';

interface ScheduleState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  updateEmployeeSettings: (
    employeeId: string, 
    updates: {
      dailyCapacity?: number;
      shiftStart?: string;
      shiftEnd?: string;
    }
  ) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Changed from inner join to left join
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select(`
          *,
          shifts (
            start_time,
            end_time,
            date
          )
        `)
        .order('name');

      if (teachersError) throw teachersError;

      const employees = teachers.map(teacher => {
        const schedule = Array.from(
          { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
          (_, index) => ({
            hour: BUSINESS_HOURS.START + index,
            isActive: false
          })
        );

        // Filter shifts for today and mark active hours
        const todayShifts = teacher.shifts?.filter(shift => shift.date === today) || [];
        
        todayShifts.forEach(shift => {
          const startHour = parseInt(shift.start_time.split(':')[0]);
          const endHour = parseInt(shift.end_time.split(':')[0]);
          
          for (let hour = startHour; hour < endHour; hour++) {
            const scheduleIndex = hour - BUSINESS_HOURS.START;
            if (scheduleIndex >= 0 && scheduleIndex < schedule.length) {
              schedule[scheduleIndex].isActive = true;
            }
          }
        });

        return {
          id: teacher.id,
          name: teacher.name,
          role: teacher.role || 'Teacher', // Provide default role if none exists
          schedule: schedule,
          availability: [],
          dailyCapacity: teacher.daily_capacity,
          shiftStart: teacher.shift_start,
          shiftEnd: teacher.shift_end
        };
      });

      set({ employees, loading: false });
    } catch (error) {
      console.error('Error fetching employees:', error);
      set({ error: 'Failed to fetch employees', loading: false });
    }
  },

  updateEmployeeSettings: async (employeeId, updates) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          daily_capacity: updates.dailyCapacity,
          shift_start: updates.shiftStart,
          shift_end: updates.shiftEnd
        })
        .eq('id', employeeId);

      if (error) throw error;

      // Update local state
      set(state => ({
        employees: state.employees.map(emp =>
          emp.id === employeeId
            ? { ...emp, ...updates }
            : emp
        )
      }));
    } catch (error) {
      console.error('Error updating employee settings:', error);
    }
  },
}));