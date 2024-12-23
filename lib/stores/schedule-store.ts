import { create } from 'zustand';
import { Employee } from '@/types/schedule';
import { supabase } from '@/lib/supabase';

interface ScheduleState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  fetchEmployees: () => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  employees: [],
  loading: false,
  error: null,

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { data: employees, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;

      set({ employees, loading: false });
    } catch (error) {
      console.error('Error fetching employees:', error);
      set({ error: 'Failed to fetch employees', loading: false });
    }
  }
}));