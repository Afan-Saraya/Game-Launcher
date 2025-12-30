import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const DEFAULT_PRIZES = [
  { id: 1, label: "Partner Prize", icon: "gift", description: "Special partner reward - exclusive merchandise or voucher", color: "#EC4899", points_value: 0, coins_reward: 0, xp_reward: 0, is_active: true, sort_order: 1 },
  { id: 2, label: "100 Coins", icon: "sparkles", description: "100 bonus coins added to your balance", color: "#7C3AED", points_value: 100, coins_reward: 100, xp_reward: 50, is_active: true, sort_order: 2 },
  { id: 3, label: "Free Spin", icon: "rotateCcw", description: "One free spin token - spin again for free!", color: "#3B82F6", points_value: 120, coins_reward: 120, xp_reward: 0, is_active: true, sort_order: 3 },
  { id: 4, label: "50 Coins", icon: "diamond", description: "50 bonus coins added to your balance", color: "#8B5CF6", points_value: 50, coins_reward: 50, xp_reward: 25, is_active: true, sort_order: 4 },
  { id: 5, label: "XP Boost", icon: "box", description: "100 XP boost for your profile!", color: "#EC4899", points_value: 0, coins_reward: 0, xp_reward: 100, is_active: true, sort_order: 5 },
  { id: 6, label: "200 Coins", icon: "crown", description: "200 bonus coins added to your balance", color: "#7C3AED", points_value: 200, coins_reward: 200, xp_reward: 100, is_active: true, sort_order: 6 },
  { id: 7, label: "Try Again", icon: "clock", description: "Better luck next time - keep spinning!", color: "#3B82F6", points_value: 0, coins_reward: 0, xp_reward: 10, is_active: true, sort_order: 7 },
  { id: 8, label: "Jackpot", icon: "zap", description: "Grand prize winner! 500 coins + 250 XP!", color: "#8B5CF6", points_value: 500, coins_reward: 500, xp_reward: 250, is_active: true, sort_order: 8 },
];

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ success: false, error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: existingPrizes, error: selectError } = await supabase
      .from('wheel_prizes')
      .select('*')
      .limit(1);

    if (selectError) {
      return NextResponse.json({ 
        success: false, 
        error: `Database error: ${selectError.message}`,
        hint: 'Make sure you ran migrations 002 and 003'
      }, { status: 500 });
    }

    const { count } = await supabase.from('wheel_prizes').select('*', { count: 'exact', head: true });

    if (count && count > 0) {
      const { data: prizes } = await supabase.from('wheel_prizes').select('*').order('sort_order');
      return NextResponse.json({ success: true, message: `Found ${count} existing prizes.`, prizes, seeded: false });
    }

    const { data: insertedPrizes, error: insertError } = await supabase
      .from('wheel_prizes')
      .upsert(DEFAULT_PRIZES, { onConflict: 'id' })
      .select();

    if (insertError) {
      return NextResponse.json({ success: false, error: `Failed to seed: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Prizes seeded successfully!', prizes: insertedPrizes, seeded: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: `Error: ${error}` }, { status: 500 });
  }
}
