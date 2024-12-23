// app/api/para-educators/[id]/assignments/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get para-educator assignments
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('student_schedules')
      .select(`
        *,
        students (
          id,
          name,
          grade,
          support_level
        )
      `)
      .eq('employee_id', id)
      .eq('requires_support', true)
      .gte('start_time', `${date}T00:00:00`)
      .lte('end_time', `${date}T23:59:59`);

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// Create new assignment
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { id } = params;
    const { studentId, startTime, endTime, location } = body;

    // First check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from('student_schedules')
      .select()
      .eq('employee_id', id)
      .overlaps('start_time', 'end_time', startTime, endTime);

    if (conflictError) throw conflictError;
    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        { error: 'Time slot conflicts with existing assignment' },
        { status: 409 }
      );
    }

    // Create assignment if no conflicts
    const { data, error } = await supabase
      .from('student_schedules')
      .insert([
        {
          employee_id: id,
          student_id: studentId,
          start_time: startTime,
          end_time: endTime,
          location,
          requires_support: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}