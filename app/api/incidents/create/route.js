import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const body = await request.json();
    const { category, location, note } = body;

    if (!category || !location) {
      return NextResponse.json(
        { error: 'Category and location are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('incidents')
      .insert([
        {
          category,
          location,
          note: note || null,
          status: 'reported',
        },
      ])
      .select('id, reference_code')
      .single();

    if (error) {
      console.error('Supabase insertion error:', error);
      return NextResponse.json(
        { error: 'Failed to create incident' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
