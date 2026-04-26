import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase.from('incidents').select('id').limit(1);
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      supabase: error ? 'error' : 'connected'
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      supabase: 'disconnected'
    }, { status: 500 });
  }
}
