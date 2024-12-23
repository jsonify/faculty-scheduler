// app/api/para-educators/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Get all para-educators with their assignments and availability
export async function GET() {
  try {
    const { data: paraEducators, error } = await supabase
      .from('employees')
      .select(`
        *,
        shifts (
          date,
          start_time,
          end_time
        ),
        student_schedules (
          id,
          student_id,
          requires_support,
          start_time,
          end_time,
          location
        )
      `)
      .eq('role', 'para-educator');

    if (error) throw error;

    return NextResponse.json(paraEducators);
  } catch (error) {
    console.error('Error fetching para-educators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch para-educators' },
      { status: 500 }
    );
  }
}

// Create new para-educator
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, dailyCapacity, shiftStart, shiftEnd } = body;

    const { data, error } = await supabase
      .from('employees')
      .insert([
        {
          name,
          role: 'para-educator',
          shift_start: shiftStart,
          shift_end: shiftEnd,
          daily_capacity: dailyCapacity
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating para-educator:', error);
    return NextResponse.json(
      { error: 'Failed to create para-educator' },
      { status: 500 }
    );
  }
}



