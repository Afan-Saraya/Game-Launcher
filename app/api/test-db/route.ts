import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : 'NOT SET',
    }
  };

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ 
      ...results,
      success: false, 
      error: 'Missing required environment variables'
    }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check wheel_awards table
    const { data: awards, error: awardsError } = await supabase
      .from('wheel_awards')
      .select('*')
      .limit(5);

    results.wheel_awards = {
      success: !awardsError,
      error: awardsError?.message,
      count: awards?.length || 0,
      sample: awards?.slice(0, 2)
    };

    // Test 2: Check wheel_prizes table
    const { data: prizes, error: prizesError } = await supabase
      .from('wheel_prizes')
      .select('*')
      .order('sort_order');

    results.wheel_prizes = {
      success: !prizesError,
      error: prizesError?.message,
      count: prizes?.length || 0,
      data: prizes
    };

    // Overall status
    results.success = !awardsError && !prizesError;
    results.message = results.success 
      ? 'Database connection successful!' 
      : 'Some tables have errors - check individual results';

  } catch (error) {
    results.success = false;
    results.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return NextResponse.json(results);
}
