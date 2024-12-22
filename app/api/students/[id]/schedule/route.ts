import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch student schedule
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: schedules, error } = await supabase
      .from('student_schedules')
      .select(`
        *,
        employee:employees (
          id,
          name,
          role
        )
      `)
      .eq('student_id', params.id);

    if (error) throw error;

    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student schedule' },
      { status: 500 }
    );
  }
}

// POST: Add schedule entry
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { employee_id, start_time, end_time, requires_support, location } = body;

    if (!employee_id || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: schedule, error } = await supabase
      .from('student_schedules')
      .insert({
        student_id: params.id,
        employee_id,
        start_time,
        end_time,
        requires_support,
        location
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error creating student schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create student schedule' },
      { status: 500 }
    );
  }
}