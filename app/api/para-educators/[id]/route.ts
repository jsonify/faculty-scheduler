// app/api/para-educators/[id]/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: { id: string };
}

// Update para-educator availability or details
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const { id } = params;

    const { data, error } = await supabase
      .from('employees')
      .update(body)
      .eq('id', id)
      .eq('role', 'para-educator')
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating para-educator:', error);
    return NextResponse.json(
      { error: 'Failed to update para-educator' },
      { status: 500 }
    );
  }
}

// Delete para-educator
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)
      .eq('role', 'para-educator');

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting para-educator:', error);
    return NextResponse.json(
      { error: 'Failed to delete para-educator' },
      { status: 500 }
    );
  }
}