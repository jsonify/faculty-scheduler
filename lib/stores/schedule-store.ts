// lib/stores/schedule-store.ts

import { create } from 'zustand';
import { format } from 'date-fns';
import { Employee } from '@/types/schedule';
import { supabase } from '@/lib/supabase';

interface Assignment {
  id: string;
  employeeId: string;
  studentId: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface ScheduleState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
  assignments: Assignment[];
  fetchEmployees: () => Promise<void>;
  fetchAssignments: (date: Date) => Promise<void>;
  createAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, updates: Partial<Assignment>) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  employees: [],
  loading: false,
  error: null,
  assignments: [],

  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ employees: data || [], loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch employees', loading: false });
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
  }
}));