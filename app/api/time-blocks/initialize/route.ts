import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);
import { Employee } from '@/types/database';

export const dynamic = 'force-dynamic'; // Ensure this route is not statically optimized

export async function POST(request: Request) {
  console.log('POST request received at /api/time-blocks/initialize');
  try {
    const { date } = await request.json();
    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      );
    }

    // Fetch active employees
    const { data: employees, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('is_active', true);

    if (employeeError) throw employeeError;

    // Get day of week (0-6)
    const dayOfWeek = new Date(date).getDay();

    // Fetch availability for this day
    const { data: availabilities, error: availError } = await supabaseAdmin
      .from('employee_availability')
      .select('*')
      .eq('day_of_week', dayOfWeek);

    if (availError) throw availError;

    // Create time blocks for each employee
    const timeBlocks = employees.flatMap((employee: Employee) => {
      const employeeAvailability = availabilities?.filter(
        a => a.employee_id === employee.id
      );

      // If no availability, create default 9-5 block
      if (!employeeAvailability?.length) {
        return [{
          employee_id: employee.id,
          date,
          start_time: '09:00',
          end_time: '17:00',
          type: 'work'
        }];
      }

      // Create blocks for each availability slot
      return employeeAvailability.map(avail => ({
        employee_id: employee.id,
        date,
        start_time: avail.start_time,
        end_time: avail.end_time,
        type: 'work'
      }));
    });

    // Insert the blocks
    const { data, error } = await supabaseAdmin
      .from('time_blocks')
      .insert(timeBlocks)
      .select();

    if (error) throw error;

    console.log('Successfully initialized time blocks:', data);
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Error initializing time blocks:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to initialize time blocks',
        details: error.details || null
      },
      { status: 500 }
    );
  }
}
