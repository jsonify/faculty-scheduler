// lib/stores/schedule-store.ts
import { create } from 'zustand';
import { Employee } from '@/types/schedule';
import { supabase } from '@/lib/supabase';

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
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('name');

      if (error) throw error;

      set({ 
        employees: data.map(teacher => ({
          id: teacher.id,
          name: teacher.name,
          role: teacher.role,
          schedule: [],
          availability: [],
          dailyCapacity: teacher.daily_capacity,
          shiftStart: teacher.shift_start,
          shiftEnd: teacher.shift_end
        })), 
        loading: false 
      });
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