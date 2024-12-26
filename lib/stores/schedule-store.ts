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
   set({ loading: true, error: null });
   try {
     console.log('Fetching active employees...');
     const { data, error } = await supabase
       .from('employees')
       .select('*')
       .eq('is_active', true)
       .order('name');

     if (error) {
       console.error('Error fetching employees:', error);
       throw error;
     }
     
     console.log(`Successfully fetched ${data?.length || 0} employees`);
     set({ employees: data || [] });
   } catch (error: any) {
     console.error('Error in fetchEmployees:', error);
     set({ error: error.message || 'Failed to fetch employees' });
   } finally {
     set({ loading: false });
   }
 },

 fetchAvailability: async (date: Date) => {
   set({ loading: true, error: null });
   try {
     const dateStr = date.toISOString().split('T')[0];
     console.log(`Fetching availability for ${dateStr}...`);
     
     // Get day of week (0-6)
     const dayOfWeek = date.getDay();

     // Fetch recurring availability with employee details
     const { data: availabilities, error: availError } = await supabase
       .from('employee_availability')
       .select(`
         *,
         employee:employee_id (id, name, role)
       `)
       .eq('day_of_week', dayOfWeek)
       .order('start_time', { ascending: true });

     if (availError) {
       console.error('Error fetching availability:', availError);
       throw availError;
     }

     console.log(`Found ${availabilities?.length || 0} availability records`);

     // Fetch any temporary schedules for this date with employee details
     const { data: tempSchedules, error: tempError } = await supabase
       .from('temporary_schedules')
       .select(`
         *,
         employee:employee_id (id, name, role)
       `)
       .eq('date', dateStr)
       .order('hour', { ascending: true });

     if (tempError) {
       console.error('Error fetching temporary schedules:', tempError);
       throw tempError;
     }

     console.log(`Found ${tempSchedules?.length || 0} temporary schedules`);

     set({ 
       availabilities: availabilities || [],
       temporarySchedules: tempSchedules || []
     });

   } catch (error: any) {
     console.error('Error in fetchAvailability:', error);
     set({ error: error.message || 'Failed to fetch availability data' });
   } finally {
     set({ loading: false });
   }
 },

 updateTemporarySchedule: async (employeeId, date, hour, isActive) => {
   set({ error: null });
   try {
     console.log(`Updating temporary schedule for employee ${employeeId} on ${date} at ${hour}:00`);
     
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

     if (error) {
       console.error('Error updating temporary schedule:', error);
       throw error;
     }

     console.log('Temporary schedule updated successfully');
     
     // Refresh schedules after update
     await get().fetchAvailability(new Date(date));

   } catch (error: any) {
     console.error('Error in updateTemporarySchedule:', error);
     set({ error: error.message || 'Failed to update temporary schedule' });
   }
 },

 clearTemporarySchedules: async (date) => {
   set({ error: null });
   try {
     console.log(`Clearing temporary schedules for ${date}...`);
     
     const { error } = await supabase
       .from('temporary_schedules')
       .delete()
       .eq('date', date);

     if (error) {
       console.error('Error clearing temporary schedules:', error);
       throw error;
     }

     console.log('Temporary schedules cleared successfully');
     
     // Refresh schedules after clearing
     await get().fetchAvailability(new Date(date));

   } catch (error: any) {
     console.error('Error in clearTemporarySchedules:', error);
     set({ error: error.message || 'Failed to clear temporary schedules' });
   }
 }
}));
