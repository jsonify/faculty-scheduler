import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Employee, TimeBlock } from '@/types/database';

interface ScheduleState {
  employees: Employee[];
  timeBlocks: TimeBlock[];
  loading: boolean;
  error: string | null;
  
  fetchEmployees: () => Promise<void>;
  initializeTimeBlocks: (date: Date) => Promise<void>;
  moveTimeBlock: (blockId: string, newStartTime: string) => Promise<void>;
  addBreak: (employeeId: string, startTime: string, duration: number) => Promise<void>;
  addLunch: (employeeId: string, startTime: string) => Promise<void>;
  removeTimeBlock: (blockId: string) => Promise<void>;
  calculateRemainingTime: (employeeId: string, date: string) => number;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  employees: [],
  timeBlocks: [],
  loading: false,
  error: null,

  calculateRemainingTime: (employeeId: string, date: string) => {
    const employee = get().employees.find(e => e.id === employeeId);
    const blocks = get().timeBlocks.filter(b => 
      b.employee_id === employeeId && 
      b.date === date
    );

    if (!employee) return 0;

    const usedMinutes = blocks.reduce((total, block) => {
      const start = new Date(`1970-01-01T${block.start_time}`);
      const end = new Date(`1970-01-01T${block.end_time}`);
      return total + ((end.getTime() - start.getTime()) / 60000);
    }, 0);

    return employee.daily_minutes - usedMinutes;
  },

  initializeTimeBlocks: async (date: Date) => {
    set({ loading: true, error: null });
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      if (!get().employees.length) {
        await get().fetchEmployees();
      }

      const { data: existingBlocks, error: fetchError } = await supabase
        .from('time_blocks')
        .select('*')
        .eq('date', dateStr);

      if (fetchError) throw fetchError;

      if (!existingBlocks?.length) {
        const defaultBlocks = get().employees.map(employee => ({
          employee_id: employee.id,
          date: dateStr,
          start_time: '09:00',
          end_time: '16:00',
          type: 'work' as const
        }));

        const { data: newBlocks, error: insertError } = await supabase
          .from('time_blocks')
          .insert(defaultBlocks)
          .select();

        if (insertError) throw insertError;
        set({ timeBlocks: newBlocks || [] });
      } else {
        set({ timeBlocks: existingBlocks });
      }
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      set({ employees: data || [] });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  moveTimeBlock: async (blockId: string, newStartTime: string) => {
    try {
      const block = get().timeBlocks.find(b => b.id === blockId);
      if (!block) return;

      const duration = (
        new Date(`1970-01-01T${block.end_time}`).getTime() - 
        new Date(`1970-01-01T${block.start_time}`).getTime()
      ) / 60000;

      const newEndTime = new Date(`1970-01-01T${newStartTime}`);
      newEndTime.setMinutes(newEndTime.getMinutes() + duration);

      const { error } = await supabase
        .from('time_blocks')
        .update({
          start_time: newStartTime,
          end_time: newEndTime.toTimeString().slice(0, 5)
        })
        .eq('id', blockId);

      if (error) throw error;
      await get().initializeTimeBlocks(new Date(block.date));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addBreak: async (employeeId: string, startTime: string, duration: number) => {
    try {
      const endTime = new Date(`1970-01-01T${startTime}`);
      endTime.setMinutes(endTime.getMinutes() + duration);

      const { error } = await supabase
        .from('time_blocks')
        .insert({
          employee_id: employeeId,
          start_time: startTime,
          end_time: endTime.toTimeString().slice(0, 5),
          type: 'break'
        });

      if (error) throw error;
      await get().initializeTimeBlocks(new Date());
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addLunch: async (employeeId: string, startTime: string) => {
    try {
      const endTime = new Date(`1970-01-01T${startTime}`);
      endTime.setMinutes(endTime.getMinutes() + 30); // 30-minute lunch

      const { error } = await supabase
        .from('time_blocks')
        .insert({
          employee_id: employeeId,
          start_time: startTime,
          end_time: endTime.toTimeString().slice(0, 5),
          type: 'lunch'
        });

      if (error) throw error;
      await get().initializeTimeBlocks(new Date());
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  removeTimeBlock: async (blockId: string) => {
    try {
      const { error } = await supabase
        .from('time_blocks')
        .delete()
        .eq('id', blockId);

      if (error) throw error;
      await get().initializeTimeBlocks(new Date());
    } catch (error: any) {
      set({ error: error.message });
    }
  }
}));