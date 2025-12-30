'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Prize } from './types';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  if (typeof window === 'undefined') return null;
  
  if (supabaseInstance) return supabaseInstance;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables');
    return null;
  }
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};

export const STORAGE_BUCKET = 'bucket';

export interface DbAward {
  id: string;
  user_id: string;
  user_name: string | null;
  prize_id: number;
  prize_label: string;
  prize_icon: string;
  prize_color: string;
  points_awarded: number;
  coins_awarded: number;
  xp_awarded: number;
  created_at: string;
}

export interface DbPrize {
  id: number;
  label: string;
  icon: string;
  description: string;
  color: string;
  image_url: string | null;
  points_value: number;
  coins_reward: number;
  xp_reward: number;
  is_active: boolean;
  sort_order: number;
}

export const fetchPrizes = async (): Promise<Prize[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('wheel_prizes')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    
    return (data || []).map((p: DbPrize) => ({
      id: p.id,
      label: p.label,
      icon: p.icon,
      description: p.description || '',
      color: p.color,
      image_url: p.image_url,
      points_value: p.points_value,
      coins_reward: p.coins_reward || 0,
      xp_reward: p.xp_reward || 0,
    }));
  } catch (error) {
    console.error('Error fetching prizes:', error);
    return [];
  }
};

export const fetchRecentWinners = async (limit = 20): Promise<DbAward[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('wheel_awards')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching winners:', error);
    return [];
  }
};

export const saveAward = async (award: {
  visitorId: string;
  userName?: string;
  prizeId: number;
  prizeLabel: string;
  prizeIcon: string;
  prizeColor: string;
  coinsAwarded: number;
  xpAwarded: number;
}): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('wheel_awards')
      .insert({
        user_id: award.visitorId,
        user_name: award.userName || null,
        prize_id: award.prizeId,
        prize_label: award.prizeLabel,
        prize_icon: award.prizeIcon,
        prize_color: award.prizeColor,
        points_awarded: award.coinsAwarded,
        coins_awarded: award.coinsAwarded,
        xp_awarded: award.xpAwarded,
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving award:', error);
    return false;
  }
};

export const getVisitorId = (): string => {
  if (typeof window === 'undefined') return 'anonymous';
  
  let visitorId = localStorage.getItem('wheel_visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('wheel_visitor_id', visitorId);
  }
  return visitorId;
};

// Get CET midnight timestamp for today
export const getCETMidnight = (): Date => {
  const now = new Date();
  // CET is UTC+1 (or CEST UTC+2 in summer, but we'll use CET)
  const cetOffset = 1; // hours
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  // Subtract CET offset to get CET midnight in UTC
  utcMidnight.setUTCHours(utcMidnight.getUTCHours() - cetOffset);
  return utcMidnight;
};

// Count spins for a user today (resets at 00:00 CET)
export const getTodaySpinCount = async (userId: string): Promise<number> => {
  const supabase = getSupabase();
  if (!supabase) return 0;
  
  try {
    const cetMidnight = getCETMidnight();
    
    const { count, error } = await supabase
      .from('wheel_awards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', cetMidnight.toISOString());
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting spins:', error);
    return 0;
  }
};

// Get time until next reset (00:00 CET)
export const getTimeUntilReset = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const cetOffset = 1;
  
  // Calculate next CET midnight
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  tomorrow.setUTCHours(tomorrow.getUTCHours() - cetOffset);
  
  // If we're past today's CET midnight, use tomorrow's
  const cetMidnight = getCETMidnight();
  const targetTime = now >= cetMidnight ? tomorrow : cetMidnight;
  
  const diff = targetTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};


// ============ MEMORY GAME FUNCTIONS ============

export interface MemoryConfigDb {
  id: number;
  difficulty: string;
  grid_cols: number;
  grid_rows: number;
  time_limit_seconds: number;
  preview_seconds: number;
  coins_reward: number;
  xp_reward: number;
  is_active: boolean;
}

export interface MemoryAwardDb {
  id: string;
  user_id: string;
  user_name: string | null;
  difficulty: string;
  moves: number;
  time_seconds: number;
  pairs_matched: number;
  total_pairs: number;
  is_win: boolean;
  coins_awarded: number;
  xp_awarded: number;
  created_at: string;
}

export const fetchMemoryConfig = async (): Promise<MemoryConfigDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('memory_config')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching memory config:', error);
    return [];
  }
};

export const saveMemoryAward = async (award: {
  userId: string;
  userName?: string;
  difficulty: string;
  moves: number;
  timeSeconds: number;
  pairsMatched: number;
  totalPairs: number;
  isWin: boolean;
  coinsAwarded: number;
  xpAwarded: number;
}): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('memory_awards')
      .insert({
        user_id: award.userId,
        user_name: award.userName || null,
        difficulty: award.difficulty,
        moves: award.moves,
        time_seconds: award.timeSeconds,
        pairs_matched: award.pairsMatched,
        total_pairs: award.totalPairs,
        is_win: award.isWin,
        coins_awarded: award.coinsAwarded,
        xp_awarded: award.xpAwarded,
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving memory award:', error);
    return false;
  }
};


// ============ MEMORY CARDS ============

export interface MemoryCardDb {
  id: number;
  name: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export const fetchMemoryCards = async (featuredOnly = true): Promise<MemoryCardDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    let query = supabase
      .from('memory_cards')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching memory cards:', error);
    return [];
  }
};

export const fetchAllMemoryCards = async (): Promise<MemoryCardDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('memory_cards')
      .select('*')
      .order('sort_order');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all memory cards:', error);
    return [];
  }
};
