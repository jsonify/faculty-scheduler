// lib/stores/schedule-store.ts

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Employee, EmployeeAvailability, TemporarySchedule } from '@/types/database';

interface ScheduleState {
 employees: Employee[];
 availabilities: EmployeeAvailability[];
 temporarySchedules: TemporarySchedule[];
 loading: boolean;
 error: string | null;

 fetchEmployees: () => Promise<void>;
 fetchAvailability: (date: Date) => Promise<void>;
 updateTemporarySchedule: (
   employeeId: string,
   date: string, 
   hour: number,
   isActive: boolean
 ) => Promise<void>;
 clearTemporarySchedules: (date: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
 employees: [],
 availabilities: [],
 temporarySchedules: [],
 loading: false,
 error: null,

 fetchEmployees: async () => {
   set({ loading: true });
   try {
     const { data, error } = await supabase
       .from('employees')
       .select('*')
       .eq('is_active', true)
       .order('name');

     if (error) throw error;
     set({ employees: data || [] });
   } catch (error) {
     set({ error: error.message });
   } finally {
     set({ loading: false });
   }
 },

 fetchAvailability: async (date: Date) => {
   set({ loading: true });
   try {
     // Get day of week (0-6)
     const dayOfWeek = date.getDay();

     // Fetch recurring availability
     const { data: availabilities, error: availError } = await supabase
       .from('employee_availability')
       .select('*')
       .eq('day_of_week', dayOfWeek);

     if (availError) throw availError;

     // Fetch any temporary schedules for this date
     const { data: tempSchedules, error: tempError } = await supabase
       .from('temporary_schedules')
       .select('*')
       .eq('date', date.toISOString().split('T')[0]);

     if (tempError) throw tempError;

     set({ 
       availabilities: availabilities || [],
       temporarySchedules: tempSchedules || []
     });

   } catch (error) {
     set({ error: error.message });
   } finally {
     set({ loading: false });
   }
 },

 updateTemporarySchedule: async (employeeId, date, hour, isActive) => {
   try {
     const { error } = await supabase
       .from('temporary_schedules')
       .upsert({
         employee_id: employeeId,
         date,
         hour,
         is_active: isActive
       }, {
         onConflict: 'employee_id,date,hour'
       });

     if (error) throw error;

     // Refresh schedules after update
     get().fetchAvailability(new Date(date));

   } catch (error) {
     set({ error: error.message });
   }
 },

 clearTemporarySchedules: async (date) => {
   try {
     const { error } = await supabase
       .from('temporary_schedules')
       .delete()
       .eq('date', date);

     if (error) throw error;
   } catch (error) {
     set({ error: error.message });
   }
 }
}));