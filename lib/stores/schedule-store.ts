import { create } from 'zustand';
import { Employee } from '@/types/schedule';
import { supabase } from '@/lib/supabase';
import { BUSINESS_HOURS } from '@/lib/constants';

interface ScheduleState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
  updateEmployeeSettings: (employeeId: string, updates: Partial<Employee>) => Promise<void>;
  updateEmployeeSchedule: (employeeId: string, currentHour: number, newHour: number) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { data: employees, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform the data to match our Employee type
      const transformedEmployees: Employee[] = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        role: emp.role || "Teacher", // Default to "Teacher" if role is not set
        schedule: [], // We'll populate this from shifts later
        availability: [], // We'll populate this from availability table
        isAvailable: emp.is_available ?? true,
        dailyCapacity: emp.daily_capacity,
        shiftStart: emp.shift_start,
        shiftEnd: emp.shift_end
      }));

      // Now fetch schedules for each employee
      const today = new Date().toISOString().split('T')[0];
      const { data: shifts, error: shiftsError } = await supabase
        .from('shifts')
        .select('*')
        .eq('date', today);

      if (shiftsError) throw shiftsError;

      // Convert shifts to schedule blocks
      transformedEmployees.forEach(employee => {
        const employeeShifts = shifts.filter(shift => shift.teacher_id === employee.id);
        employee.schedule = Array.from(
          { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
          (_, index) => {
            const hour = BUSINESS_HOURS.START + index;
            const isActive = employeeShifts.some(shift => {
              const startHour = parseInt(shift.start_time.split(':')[0]);
              const endHour = parseInt(shift.end_time.split(':')[0]);
              return hour >= startHour && hour < endHour;
            });
            return {
              hour,
              isActive
            };
          }
        );
      });

      set({ employees: transformedEmployees, loading: false });
    } catch (error) {
      console.error('Error fetching employees:', error);
      set({ error: 'Failed to fetch employees', loading: false });
    }
  },

  updateEmployeeSettings: async (employeeId: string, updates: Partial<Employee>) => {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          daily_capacity: updates.dailyCapacity,
          shift_start: updates.shiftStart,
          shift_end: updates.shiftEnd,
          is_available: updates.isAvailable,
          role: updates.role
        })
        .eq('id', employeeId);

      if (error) throw error;

      set(state => ({
        employees: state.employees.map(emp =>
          emp.id === employeeId ? { ...emp, ...updates } : emp
        )
      }));
    } catch (error) {
      console.error('Error updating employee settings:', error);
      set({ error: 'Failed to update employee settings' });
    }
  },

  updateEmployeeSchedule: async (employeeId: string, currentHour: number, newHour: number) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('shifts')
        .upsert({
          teacher_id: employeeId,
          date,
          start_time: `${newHour}:00`,
          end_time: `${newHour + 1}:00`
        });

      if (error) throw error;

      set(state => ({
        employees: state.employees.map(emp => {
          if (emp.id !== employeeId) return emp;
          
          const newSchedule = [...emp.schedule];
          const currentBlock = newSchedule.find(block => block.hour === currentHour);
          const newBlock = newSchedule.find(block => block.hour === newHour);
          
          if (currentBlock) currentBlock.isActive = false;
          if (newBlock) newBlock.isActive = true;
          
          return {
            ...emp,
            schedule: newSchedule
          };
        })
      }));
    } catch (error) {
      console.error('Error updating schedule:', error);
      set({ error: 'Failed to update schedule' });
    }
  }
}));