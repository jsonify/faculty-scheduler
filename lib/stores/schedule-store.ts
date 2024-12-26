// lib/stores/schedule-store.ts

import { create } from 'zustand';
import { format } from 'date-fns';
import { Employee } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface ScheduleCache {
  [key: string]: {
    timestamp: number;
    data: any;
  }
}

interface ScheduleState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  cache: ScheduleCache;
  initialized: boolean;
  
  fetchEmployees: () => Promise<void>;
  fetchEmployeeSchedules: (employeeIds: string[]) => Promise<void>;
  updateScheduleBlock: (employeeId: string, hour: number, isActive: boolean) => Promise<void>;
  batchUpdateSchedules: (updates: Array<{ employeeId: string, hour: number, isActive: boolean }>) => Promise<void>;
  clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  employees: [],
  loading: false,
  error: null,
  cache: {},
  initialized: false,

  fetchEmployees: async () => {
    if (get().initialized) return;

    set({ loading: true, error: null });
    try {
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) throw employeesError;

      set({ 
        employees: employees || [], 
        initialized: true,
        loading: false 
      });

      // Fetch schedules only if we have employees
      if (employees?.length) {
        await get().fetchEmployeeSchedules(employees.map(e => e.id));
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch employees',
        loading: false 
      });
    }
  },

  fetchEmployeeSchedules: async (employeeIds: string[]) => {
    if (!employeeIds.length) return;

    set({ loading: true });
    
    try {
      // First try to fetch all schedules at once
      const { data: schedules, error } = await supabase
        .from('employee_schedules')
        .select('*')
        .in('employee_id', employeeIds);

      if (error) {
        console.log('Schedule fetch error:', error);
        // If bulk fetch fails, try fetching one by one
        console.warn('Bulk fetch failed, trying individual fetches');
        const individualSchedules = await Promise.all(
          employeeIds.map(async (id) => {
            const { data } = await supabase
              .from('employee_schedules')
              .select('*')
              .eq('employee_id', id);
            return data || [];
          })
        );

        // Combine all the individual results
        const combinedSchedules = individualSchedules.flat();
        
        // Update employees with their schedules
        const updatedEmployees = get().employees.map(emp => ({
          ...emp,
          schedules: combinedSchedules.filter(s => s.employee_id === emp.id)
        }));

        set({ 
          employees: updatedEmployees,
          loading: false,
          cache: {
            ...get().cache,
            [format(new Date(), 'yyyy-MM-dd')]: {
              timestamp: Date.now(),
              data: updatedEmployees
            }
          }
        });
        return;
      }

      // If bulk fetch succeeded, update state
      const updatedEmployees = get().employees.map(emp => ({
        ...emp,
        schedules: (schedules || []).filter(s => s.employee_id === emp.id)
      }));

      set({ 
        employees: updatedEmployees,
        loading: false,
        cache: {
          ...get().cache,
          [format(new Date(), 'yyyy-MM-dd')]: {
            timestamp: Date.now(),
            data: updatedEmployees
          }
        }
      });

    } catch (error) {
      console.error('Error fetching schedules:', error);
      set({ 
        error: 'Failed to fetch schedules',
        loading: false 
      });
    }
  },

  updateScheduleBlock: async (employeeId: string, hour: number, isActive: boolean) => {
    try {
      console.log('Updating schedule block:', { employeeId, hour, isActive });
      const { data: scheduleData, error } = await supabase
        .from('employee_schedules')
        .upsert({
          employee_id: employeeId,
          hour,
          is_active: isActive
        }, {
          onConflict: 'employee_id,hour'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating schedule:', error);
        throw error;
      }
  
      // Update local state
      const employees = get().employees.map(emp => {
        if (emp.id !== employeeId) return emp;
        
        const schedules = emp.schedules || [];
        const updatedSchedules = schedules.map(s => 
          s.hour === hour ? { ...s, is_active: isActive } : s
        );
        
        if (!schedules.some(s => s.hour === hour) && scheduleData) {
          updatedSchedules.push({
            id: scheduleData.id,
            employee_id: scheduleData.employee_id,
            hour: scheduleData.hour,
            is_active: scheduleData.is_active,
            created_at: scheduleData.created_at
          });
        }
  
        return { ...emp, schedules: updatedSchedules };
      });
  
      set({ employees });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update schedule'
      });
    }
  },

  batchUpdateSchedules: async (updates) => {
    try {
      const formattedUpdates = updates.map(update => ({
        employee_id: update.employeeId,
        hour: update.hour,
        is_active: update.isActive
      }));

      const { error } = await supabase
        .from('employee_schedules')
        .upsert(formattedUpdates);

      if (error) throw error;

      // Refresh schedules after batch update
      await get().fetchEmployeeSchedules(
        get().employees.map(e => e.id)
      );
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update schedules'
      });
    }
  },

  clearCache: () => {
    set({ cache: {} });
  }
}));