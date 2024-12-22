import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch all students with their support requirements and schedules
export async function GET(request: Request) {
  try {
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        support_requirements (
          support_level,
          notes
        ),
        student_schedules (
          employee_id,
          requires_support,
          start_time,
          end_time,
          location
        )
      `)
      .order('name');

    if (error) throw error;

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST: Create a new student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, grade, support_level } = body;

    // Validate required fields
    if (!name || !grade || !support_level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate support level
    if (![1, 2, 3].includes(support_level)) {
      return NextResponse.json(
        { error: 'Invalid support level' },
        { status: 400 }
      );
    }

    // Insert student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({ name, grade })
      .select()
      .single();

    if (studentError) throw studentError;

    // Create support requirement
    if (student) {
      const { error: supportError } = await supabase
        .from('support_requirements')
        .insert({
          student_id: student.id,
          support_level
        });

      if (supportError) throw supportError;
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

// PATCH: Update student details
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, grade, support_level } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (grade) updates.grade = grade;

    // Update student details
    const { data: student, error: studentError } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (studentError) throw studentError;

    // Update support level if provided
    if (support_level) {
      if (![1, 2, 3].includes(support_level)) {
        return NextResponse.json(
          { error: 'Invalid support level' },
          { status: 400 }
        );
      }

      const { error: supportError } = await supabase
        .from('support_requirements')
        .upsert({
          student_id: id,
          support_level
        });

      if (supportError) throw supportError;
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a student
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Delete student (cascading deletes will handle related records)
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}