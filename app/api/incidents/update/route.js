import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request) {
  try {
    const { id, status, staff_notes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Incident ID required' }, { status: 400 });
    }

    const updates = {};
    if (status) {
      updates.status = status;
      if (status === 'acknowledged') updates.acknowledged_at = new Date().toISOString();
      if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    }
    
    // Accept empty string to clear notes if needed
    if (staff_notes !== undefined) {
      updates.staff_notes = staff_notes;
    }

    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ error: 'Failed to update incident' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
