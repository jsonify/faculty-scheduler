// lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    query: {
      // Ensure API key is sent as URL parameter for all requests
      params: {
        apikey: supabaseAnonKey
      }
    }
  }
});

// Employee schedule utility functions
export async function generateSchedulesForEmployee(employee_id: string) {
  try {
    const { data: availability, error: availabilityError } = await supabase
      .from('employee_availability')
      .select('*')
      .eq('employee_id', employee_id);

    if (availabilityError) throw availabilityError;

    if (!availability?.length) {
      return { error: 'No availability found for employee' };
    }

    // Delete existing schedules for the employee
    const { error: deleteError } = await supabase
      .from('employee_schedules')
      .delete()
      .eq('employee_id', employee_id);

    if (deleteError) throw deleteError;

    // Create schedule blocks based on availability
    const scheduleBlocks = availability.flatMap(slot => {
      const startHour = parseInt(slot.start_time.split(':')[0]);
      const endHour = parseInt(slot.end_time.split(':')[0]);
      const hours = Array.from(
        { length: endHour - startHour },
        (_, i) => startHour + i
      );

      return hours.map(hour => ({
        employee_id,
        hour,
        is_active: true
      }));
    });

    const { data, error } = await supabase
      .from('employee_schedules')
      .insert(scheduleBlocks)
      .select();

    if (error) throw error;
    return { data };

  } catch (error) {
    return { error };
  }
}

export async function getEmployeeSchedules(employee_ids: string[]) {
  try {
    const { data, error } = await supabase
      .from('employee_schedules')
      .select('*')
      .in('employee_id', employee_ids);

    if (error) throw error;
    return { data };

  } catch (error) {
    return { error };
  }
}

export async function updateScheduleBlock(
  employee_id: string,
  hour: number,
  is_active: boolean
) {
  try {
    const { data, error } = await supabase
      .from('employee_schedules')
      .upsert({
        employee_id,
        hour,
        is_active
      })
      .select();

    if (error) throw error;
    return { data };

  } catch (error) {
    return { error };
  }
}

export async function getTemporarySchedules(date: string) {
  try {
    console.log('Fetching temporary schedules for date:', date);
    const { data, error } = await supabase
      .from('temporary_schedules')
      .select('*,employee:employee_id(id,name,role)')
      .eq('date', date)
      .order('hour', { ascending: true })
      .auth(supabase.auth.session()?.access_token);

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error('Error fetching temporary schedules:', error);
    return { error };
  }
}

export async function batchUpdateSchedules(schedules: {
  employee_id: string;
  hour: number;
  is_active: boolean;
}[]) {
  try {
    console.log('Updating schedules:', schedules);
    const { data, error } = await supabase
      .from('employee_schedules')
      .upsert(schedules)
      .select();

    if (error) throw error;
    return { data };

  } catch (error) {
    console.error('Error updating schedules:', error);
    return { error };
  }
}
