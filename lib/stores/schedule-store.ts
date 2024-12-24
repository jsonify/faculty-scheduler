// lib/stores/schedule-store.ts

import { create } from 'zustand';
import { format } from 'date-fns';
import { Employee, EmployeeRole } from '@/types/database';
import { supabase } from '@/lib/supabase';

interface Assignment {
  id: string;
  employee_id: string;
  student_id: string;
  date: string;
  start_time: string;
  end_time: string;
}

interface ScheduleState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  assignments: Assignment[];
  fetchEmployees: (options?: {
    role?: EmployeeRole, 
    activeOnly?: boolean
  }) => Promise<void>;
  fetchAssignments: (date: Date) => Promise<void>;
  createAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  updateEmployeeStatus: (
    employeeId: string, 
    updates: Partial<Pick<Employee, 'is_active' | 'role'>>
  ) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  employees: [],
  loading: false,
  error: null,
  assignments: [],

  fetchEmployees: async (options = {}) => {
    set({ loading: true, error: null });
    try {
      // Build dynamic query
      let query = supabase
        .from('employees')
        .select(`
          *,
          shifts(*),
          schedules(*)
        `)
        .order('name');

      // Apply role filter if specified
      if (options.role) {
        query = query.eq('role', options.role);
      }

      // Apply active status filter if specified
      if (options.activeOnly !== undefined) {
        query = query.eq('is_active', options.activeOnly);
      }

      const { data, error } = await query;

      if (error) throw error;
      set({ employees: data || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to fetch employees', 
        loading: false 
      });
    }
  },
  
  fetchAssignments: async (date) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('*')
        .eq('date', format(date, 'yyyy-MM-dd'));
        
      if (error) throw error;
      set({ assignments: data || [] });
    } catch (error) {
      set({ error: 'Failed to fetch assignments' });
    }
  },
  
  createAssignment: async (assignment) => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .insert([assignment])
        .select()
        .single();
        
      if (error) throw error;
      set(state => ({ 
        assignments: [...state.assignments, data]
      }));
    } catch (error) {
      set({ error: 'Failed to create assignment' });
    }
  },

  updateAssignment: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        assignments: state.assignments.map(a => 
          a.id === id ? { ...a, ...updates } : a
        )
      }));
    } catch (error) {
      set({ error: 'Failed to update assignment' });
    }
  },

  deleteAssignment: async (id) => {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      set(state => ({
        assignments: state.assignments.filter(a => a.id !== id)
      }));
    } catch (error) {
      set({ error: 'Failed to delete assignment' });
    }
  },

  updateEmployeeStatus: async (employeeId, updates): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employeeId)
        .select();

      if (error) throw error;

      // Update local state
      set(state => ({
        employees: state.employees.map(employee => 
          employee.id === employeeId 
            ? { ...employee, ...updates } 
            : employee
        )
      }));

      // No need to return data as the function should return void
    } catch (error) {
      set({ 
        error: error instanceof Error 
          ? error.message 
          : 'Failed to update employee status' 
      });
    }
  }
}));