import { supabase } from '@/lib/supabase';
import { Employee } from '@/types/database';

export async function getEmployees(role?: 'teacher' | 'para-educator') {
  try {
    let query = supabase
      .from('employees')
      .select('*')
      .eq('is_active', true);

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Employee[];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
}
