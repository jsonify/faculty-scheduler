// lib/stores/schedule-store.ts

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Employee, EmployeeAvailability, TemporarySchedule } from '@/types/database';

interface TimeBlock {
  id?: string;
  employee_id: string;
  date: string;
  start_time: string; // "HH:mm" format
  end_time: string; // "HH:mm" format
  type: 'work' | 'break' | 'lunch';
}

interface ScheduleState {
  employees: Employee[];
  timeBlocks: TimeBlock[];
  loading: boolean;
  error: string | null;
  availabilities: EmployeeAvailability[];
  temporarySchedules: TemporarySchedule[];
  
  fetchEmployees: () => Promise<void>;
  initializeTimeBlocks: (date: Date) => Promise<void>;
  moveTimeBlock: (
    blockId: string,
    newStartTime: string,
    newEndTime: string
  ) => Promise<void>;
  addBreak: (
    employeeId: string,
    startTime: string,
    endTime: string
  ) => Promise<void>;
  addLunch: (
    employeeId: string,
    startTime: string,
    endTime: string
  ) => Promise<void>;
  removeTimeBlock: (blockId: string) => Promise<void>;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
 employees: [],
 timeBlocks: [],
 availabilities: [],
 temporarySchedules: [],
 loading: false,
 error: null,

 initializeTimeBlocks: async (date: Date) => {
   set({ loading: true, error: null });
   try {
     const dateStr = date.toISOString().split('T')[0];
     console.log('Initializing time blocks for date:', dateStr);
     
     // First ensure we have employees
     if (!get().employees.length) {
       await get().fetchEmployees();
     }

     // Check if we have any time blocks for this date
     const { data: existingBlocks, error: fetchError } = await supabase
       .from('time_blocks')
       .select('*')
       .eq('date', dateStr);

     if (fetchError) throw fetchError;

     // If no time blocks exist, create default ones based on employee availability
     if (!existingBlocks?.length) {
       console.log('No time blocks found, creating default ones');
       
       // Get availability for this day of week
       const dayOfWeek = date.getDay();
       const { data: availabilities, error: availError } = await supabase
         .from('employee_availability')
         .select('*')
         .eq('day_of_week', dayOfWeek);

       if (availError) throw availError;

       // Create time blocks for each employee based on their availability
       const defaultBlocks = get().employees.flatMap(employee => {
         const employeeAvailability = availabilities?.filter(a => a.employee_id === employee.id);
         
         // If no specific availability, use default 9-5
         if (!employeeAvailability?.length) {
           return [{
             employeeId: employee.id,
             date: dateStr,
             startTime: '09:00',
             endTime: '17:00',
             type: 'work'
           }];
         }

         // Create blocks for each availability slot
         return employeeAvailability.map(avail => ({
           employeeId: employee.id,
           date: dateStr,
           startTime: avail.start_time,
           endTime: avail.end_time,
           type: 'work'
         }));
       });

       // Insert the blocks
       const { data: newBlocks, error: insertError } = await supabase
         .from('time_blocks')
         .insert(defaultBlocks)
         .select();

       if (insertError) throw insertError;
       set({ timeBlocks: newBlocks || [] });
     } else {
       console.log(`Found ${existingBlocks.length} time blocks`);
       set({ timeBlocks: existingBlocks });
     }
   } catch (error: any) {
     console.error('Error initializing time blocks:', error);
     set({ error: error.message || 'Failed to initialize time blocks' });
   } finally {
     set({ loading: false });
   }
 },

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
     set({ 
       employees: data || [],
       // Initialize time blocks if we have employees but no blocks
       timeBlocks: get().timeBlocks.length ? get().timeBlocks : []
     });
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
     let tempSchedules = [];
     try {
       const { data, error } = await supabase
         .from('temporary_schedules')
         .select(`
           *,
           employee:employee_id (id, name, role)
         `)
         .eq('date', dateStr)
         .order('hour', { ascending: true });

       if (error) {
         console.warn('Error fetching temporary schedules:', error);
       } else {
         tempSchedules = data || [];
       }
     } catch (error) {
       console.warn('Error fetching temporary schedules:', error);
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
     
     // First clear any existing schedule for this hour
     const { error: deleteError } = await supabase
       .from('temporary_schedules')
       .delete()
       .eq('employee_id', employeeId)
       .eq('date', date)
       .eq('hour', hour);

     if (deleteError) {
       console.error('Error clearing existing schedule:', deleteError);
       throw deleteError;
     }

     // If we're setting the schedule to active, create new record
     if (isActive) {
       const { error } = await supabase
         .from('temporary_schedules')
         .insert({
           employee_id: employeeId,
           date,
           hour,
           is_active: true
         });

       if (error) {
         console.error('Error creating temporary schedule:', error);
         throw error;
       }
     }

     console.log('Temporary schedule updated successfully');
     
     // Refresh schedules after update
     await get().fetchAvailability(new Date(date));

   } catch (error: any) {
     console.error('Error in updateTemporarySchedule:', error);
     set({ error: error.message || 'Failed to update temporary schedule' });
   }
 },

 // New method to handle block moves
 moveTemporaryScheduleBlock: async (employeeId: string, date: string, fromHour: number, toHour: number, duration: number) => {
   set({ error: null });
   try {
     console.log(`Moving schedule block for employee ${employeeId} from ${fromHour} to ${toHour} on ${date}`);

     // First clear the destination hours
     for (let i = 0; i < duration; i++) {
       const { error: deleteError } = await supabase
         .from('temporary_schedules')
         .delete()
         .eq('employee_id', employeeId)
         .eq('date', date)
         .eq('hour', toHour + i);

       if (deleteError) {
         console.error('Error clearing destination hours:', deleteError);
         throw deleteError;
       }
     }

     // Create new records for the moved block
     const newSchedules = [];
     for (let i = 0; i < duration; i++) {
       newSchedules.push({
         employee_id: employeeId,
         date,
         hour: toHour + i,
         is_active: true
       });
     }

     const { error } = await supabase
       .from('temporary_schedules')
       .insert(newSchedules);

     if (error) {
       console.error('Error creating moved schedules:', error);
       throw error;
     }

     console.log('Schedule block moved successfully');
     
     // Refresh schedules after update
     await get().fetchAvailability(new Date(date));

   } catch (error: any) {
     console.error('Error in moveTemporaryScheduleBlock:', error);
     set({ error: error.message || 'Failed to move schedule block' });
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
