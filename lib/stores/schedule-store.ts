// lib/stores/schedule-store.ts

import { create } from 'zustand';
import { format } from 'date-fns';
import { Employee } from '@/types/database';
import { supabase, generateSchedulesForEmployee, getEmployeeSchedules, batchUpdateSchedules } from '@/lib/supabase';
import { BUSINESS_HOURS } from '@/lib/constants';

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
  
  // Enhanced fetch operations
  fetchEmployees: () => Promise<void>;
  fetchEmployeeSchedules: (date: Date) => Promise<void>;
  generateScheduleFromAvailability: (employeeId: string) => Promise<void>;
  updateScheduleBlock: (employeeId: string, hour: number, isActive: boolean) => Promise<void>;
  batchUpdateSchedules: (updates: Array<{ employeeId: string, hour: number, isActive: boolean }>) => Promise<void>;
  
  // Cache operations
  clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  employees: [],
  loading: false,
  error: null,
  cache: {},

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (employeesError) throw employeesError;
      set({ employees: employees || [], loading: false });
      
      // Fetch schedules for the current date after getting employees
      if (employees?.length) {
        await get().fetchEmployeeSchedules(new Date());
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch employees', 
        loading: false 
      });
    }
  },

  fetchEmployeeSchedules: async (date: Date) => {
    set({ loading: true, error: null });
    const dateKey = format(date, 'yyyy-MM-dd');
    const cachedData = get().cache[dateKey];
    
    // Check cache validity
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      set({ employees: cachedData.data, loading: false });
      return;
    }
  
    try {
      const employees = get().employees;
      const employeeIds = employees.map(emp => emp.id);
  
      // Add this check
      if (employeeIds.length === 0) {
        set({ loading: false });
        return;
      }
      
      const { data: schedules, error } = await getEmployeeSchedules(employeeIds);
      
      if (error) throw error;

      // Update employees with their schedules
      const updatedEmployees = employees.map(emp => ({
        ...emp,
        schedules: schedules?.filter(s => s.employee_id === emp.id) || []
      }));

      // Update state and cache
      set({ 
        employees: updatedEmployees, 
        loading: false,
        cache: {
          ...get().cache,
          [dateKey]: {
            timestamp: Date.now(),
            data: updatedEmployees
          }
        }
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch schedules',
        loading: false 
      });
    }
  },

  generateScheduleFromAvailability: async (employeeId: string) => {
    set({ loading: true, error: null });
    try {
      const { error } = await generateSchedulesForEmployee(employeeId);
      if (error) throw error;
      
      // Refresh schedules after generation
      await get().fetchEmployeeSchedules(new Date());
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate schedule',
        loading: false 
      });
    }
  },

  updateScheduleBlock: async (employeeId: string, hour: number, isActive: boolean) => {
    try {
      const { data: scheduleData, error } = await supabase
        .from('employee_schedules')
        .upsert({
          employee_id: employeeId,
          hour,
          is_active: isActive
        })
        .select()
        .single();
  
      if (error) throw error;
  
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

      const { error } = await batchUpdateSchedules(formattedUpdates);
      if (error) throw error;

      // Refresh schedules after batch update
      await get().fetchEmployeeSchedules(new Date());
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
