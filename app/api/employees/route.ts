import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select(`
        *,
        availability:employee_availability(*)
      `)
      .order('name');

    if (error) throw error;
    
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      role, 
      scheduleType,
      defaultStartTime,
      defaultEndTime,
      availability 
    } = body;

    // Validate required fields
    if (!name || !role || !scheduleType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create employee record
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .insert({
        name,
        role,
        schedule_type: scheduleType,
        default_start_time: defaultStartTime,
        default_end_time: defaultEndTime
      })
      .select()
      .single();

    if (employeeError) throw employeeError;

    // Insert availability if schedule is flexible
    if (scheduleType === 'flexible' && availability && availability.length > 0) {
      const { error: availabilityError } = await supabase
        .from('employee_availability')
        .insert(
          availability
            .filter(day => day.enabled)
            .map(day => ({
              employee_id: employee.id,
              day_of_week: day.dayOfWeek,
              start_time: day.startTime,
              end_time: day.endTime
            }))
        );

      if (availabilityError) throw availabilityError;
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { 
      id,
      name, 
      role, 
      scheduleType,
      defaultStartTime,
      defaultEndTime,
      availability 
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    // Update employee record
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .update({
        name,
        role,
        schedule_type: scheduleType,
        default_start_time: defaultStartTime,
        default_end_time: defaultEndTime
      })
      .eq('id', id)
      .select()
      .single();

    if (employeeError) throw employeeError;

    // Update availability if schedule is flexible
    if (scheduleType === 'flexible' && availability) {
      // First delete existing availability
      await supabase
        .from('employee_availability')
        .delete()
        .eq('employee_id', id);

      // Then insert new availability
      if (availability.length > 0) {
        const { error: availabilityError } = await supabase
          .from('employee_availability')
          .insert(
            availability
              .filter(day => day.enabled)
              .map(day => ({
                employee_id: id,
                day_of_week: day.dayOfWeek,
                start_time: day.startTime,
                end_time: day.endTime
              }))
          );

        if (availabilityError) throw availabilityError;
      }
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}