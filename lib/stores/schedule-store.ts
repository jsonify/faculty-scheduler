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
  updateEmployeeSchedule: (employeeId: string, currentHour: number, newHour: number) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    // Don't fetch if we're already loading
    if (get().loading) return;
    
    set({ loading: true, error: null });
    try {
      // Fetch teachers and their schedules for today only
      const today = new Date().toISOString().split('T')[0];
      const { data: teachers, error: teachersError } = await supabase
        .from('teachers')
        .select(`
          id,
          name,
          role,
          shifts!inner (
            date,
            start_time,
            end_time
          )
        `)
        .eq('shifts.date', today)
        .order('name');

      if (teachersError) throw teachersError;

      // Transform the data to match our Employee type
      const employees: Employee[] = teachers.map(teacher => {
        // Create schedule blocks for business hours
        const schedule = Array.from(
          { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
          (_, index) => ({
            hour: BUSINESS_HOURS.START + index,
            isActive: false
          })
        );

        // Mark hours as active based on shifts
        if (teacher.shifts) {
          teacher.shifts.forEach(shift => {
            const startHour = parseInt(shift.start_time.split(':')[0]);
            const endHour = parseInt(shift.end_time.split(':')[0]);
            
            for (let hour = startHour; hour < endHour; hour++) {
              const scheduleIndex = hour - BUSINESS_HOURS.START;
              if (scheduleIndex >= 0 && scheduleIndex < schedule.length) {
                schedule[scheduleIndex].isActive = true;
              }
            }
          });
        }

        return {
          id: teacher.id,
          name: teacher.name,
          role: teacher.role,
          schedule,
          availability: []
        };
      });

      set({ employees, loading: false });
    } catch (error) {
      console.error('Error fetching employees:', error);
      set({ error: 'Failed to fetch employees', loading: false });
    }
  },

  updateEmployeeSchedule: async (employeeId, currentHour, newHour) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('shifts')
        .upsert({
          teacher_id: employeeId,
          date,
          start_time: `${newHour}:00`,
          end_time: `${newHour + 1}:00`
        })
        .select();

      if (error) throw error;

      // Refresh the employees data
      await get().fetchEmployees();
    } catch (error) {
      console.error('Error updating schedule:', error);
      set({ error: 'Failed to update schedule' });
    }
  }
}));