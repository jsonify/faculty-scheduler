// lib/data/schedule-data.ts

import { supabase } from '@/lib/supabase';
import { Employee, TimeBlock, Shift } from '@/types/schedule';
import { BUSINESS_HOURS } from '@/lib/constants';

export async function getEmployees(): Promise<{
  data: Employee[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select(`
        id,
        name,
        role,
        shifts (
          date,
          start_time,
          end_time
        )
      `)
      .order('name');

    if (error) throw error;

    const employees: Employee[] = data.map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      role: teacher.role,
      schedule: generateScheduleBlocks(teacher.shifts || []),
      availability: []
    }));

    return { data: employees, error: null };
  } catch (error) {
    console.error('Error in getEmployees:', error);
    return { data: null, error: error as Error };
  }
}

export async function updateEmployeeSchedule(
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('shifts')
      .upsert({
        teacher_id: employeeId,
        date,
        start_time: startTime,
        end_time: endTime
      });

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error('Error in updateEmployeeSchedule:', error);
    return { success: false, error: error as Error };
  }
}

function generateScheduleBlocks(shifts: any[]): TimeBlock[] {
  const schedule = Array.from(
    { length: BUSINESS_HOURS.END - BUSINESS_HOURS.START },
    (_, index) => ({
      hour: BUSINESS_HOURS.START + index,
      isActive: false
    })
  );

  shifts.forEach(shift => {
    const startHour = parseInt(shift.start_time.split(':')[0]);
    const endHour = parseInt(shift.end_time.split(':')[0]);
    
    for (let hour = startHour; hour < endHour; hour++) {
      const scheduleIndex = hour - BUSINESS_HOURS.START;
      if (scheduleIndex >= 0 && scheduleIndex < schedule.length) {
        schedule[scheduleIndex].isActive = true;
      }
    }
  });

  return schedule;
}