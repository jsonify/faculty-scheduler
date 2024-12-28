import { supabase } from '@/lib/supabase';
import { Employee, EmployeeAvailability } from '@/types/database';

export async function getEmployeesWithAvailability(role?: 'teacher' | 'para-educator') {
  try {
    let query = supabase
      .from('employees')
      .select(`
        *,
        availability:employee_availability (
          day_of_week,
          start_time,
          end_time
        )
      `)
      .eq('is_active', true);

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as (Employee & { availability: EmployeeAvailability[] })[];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}

export async function getEmployeeAvailability(employeeId: string) {
  try {
    const { data, error } = await supabase
      .from('employee_availability')
      .select('*')
      .eq('employee_id', employeeId);

    if (error) throw error;
    return data as EmployeeAvailability[];
  } catch (error) {
    console.error('Error fetching availability:', error);
    return [];
  }
}
