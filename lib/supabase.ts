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


// ============ PUZZLE GAME FUNCTIONS ============

export interface PuzzleConfigDb {
  id: number;
  difficulty: string;
  grid_size: number;
  preview_seconds: number;
  coins_reward: number;
  xp_reward: number;
  is_active: boolean;
}

export interface PuzzleAwardDb {
  id: string;
  user_id: string;
  user_name: string | null;
  difficulty: string;
  grid_size: number;
  moves: number;
  time_seconds: number;
  puzzle_image_id: number | null;
  is_win: boolean;
  coins_awarded: number;
  xp_awarded: number;
  created_at: string;
}

export interface PuzzleImageDb {
  id: number;
  name: string;
  image_url: string;
  description: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  times_played: number;
  times_solved: number;
}

export const fetchPuzzleConfig = async (): Promise<PuzzleConfigDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('puzzle_config')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching puzzle config:', error);
    return [];
  }
};

export const fetchPuzzleImages = async (featuredOnly = false): Promise<PuzzleImageDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    let query = supabase
      .from('puzzle_images')
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
    console.error('Error fetching puzzle images:', error);
    return [];
  }
};

export const getRandomPuzzleImage = async (): Promise<PuzzleImageDb | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('puzzle_images')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    if (!data || data.length === 0) return null;
    
    // Return a random image
    const randomIndex = Math.floor(Math.random() * data.length);
    return data[randomIndex];
  } catch (error) {
    console.error('Error fetching random puzzle image:', error);
    return null;
  }
};

export const savePuzzleAward = async (award: {
  userId: string;
  userName?: string;
  difficulty: string;
  gridSize: number;
  moves: number;
  timeSeconds: number;
  puzzleImageId?: number;
  isWin: boolean;
  coinsAwarded: number;
  xpAwarded: number;
}): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('puzzle_awards')
      .insert({
        user_id: award.userId,
        user_name: award.userName || null,
        difficulty: award.difficulty,
        grid_size: award.gridSize,
        moves: award.moves,
        time_seconds: award.timeSeconds,
        puzzle_image_id: award.puzzleImageId || null,
        is_win: award.isWin,
        coins_awarded: award.coinsAwarded,
        xp_awarded: award.xpAwarded,
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving puzzle award:', error);
    return false;
  }
};

export const updatePuzzleImageStats = async (imageId: number, solved: boolean): Promise<void> => {
  const supabase = getSupabase();
  if (!supabase) return;
  
  try {
    // Increment times_played, and times_solved if solved
    const { data: current } = await supabase
      .from('puzzle_images')
      .select('times_played, times_solved')
      .eq('id', imageId)
      .single();
    
    if (current) {
      await supabase
        .from('puzzle_images')
        .update({
          times_played: (current.times_played || 0) + 1,
          times_solved: solved ? (current.times_solved || 0) + 1 : current.times_solved,
        })
        .eq('id', imageId);
    }
  } catch (error) {
    console.error('Error updating puzzle image stats:', error);
  }
};


// ============ PUZZLE REWARD TIERS ============

export interface PuzzleRewardTierDb {
  id: number;
  difficulty: string;
  max_time_seconds: number;
  coins_reward: number;
  xp_reward: number;
  tier_name: string | null;
  is_active: boolean;
}

export const fetchPuzzleRewardTiers = async (difficulty?: string): Promise<PuzzleRewardTierDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    let query = supabase
      .from('puzzle_reward_tiers')
      .select('*')
      .eq('is_active', true)
      .order('max_time_seconds', { ascending: true });
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching puzzle reward tiers:', error);
    return [];
  }
};

export const getRewardForTime = (tiers: PuzzleRewardTierDb[], timeSeconds: number): { coins: number; xp: number; tierName: string } => {
  // Find the first tier where time is less than or equal to max_time_seconds
  const tier = tiers.find(t => timeSeconds <= t.max_time_seconds);
  
  if (tier) {
    return {
      coins: tier.coins_reward,
      xp: tier.xp_reward,
      tierName: tier.tier_name || 'Completed',
    };
  }
  
  // Fallback to last tier or default
  const lastTier = tiers[tiers.length - 1];
  return {
    coins: lastTier?.coins_reward || 25,
    xp: lastTier?.xp_reward || 10,
    tierName: lastTier?.tier_name || 'Completed',
  };
};


// ============ PUZZLE DAILY LIMITS ============

// Get CET midnight timestamp for today (reusing the wheel logic)
export const getPuzzleCETMidnight = (): Date => {
  const now = new Date();
  const cetOffset = 1; // CET is UTC+1
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  utcMidnight.setUTCHours(utcMidnight.getUTCHours() - cetOffset);
  return utcMidnight;
};

// Count puzzle plays for a user today (resets at 00:00 CET)
export const getTodayPuzzlePlayCount = async (userId: string): Promise<number> => {
  const supabase = getSupabase();
  if (!supabase) return 0;
  
  try {
    const cetMidnight = getPuzzleCETMidnight();
    
    const { count, error } = await supabase
      .from('puzzle_awards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_win', true)
      .gte('created_at', cetMidnight.toISOString());
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting puzzle plays:', error);
    return 0;
  }
};

// Get time until next reset (00:00 CET)
export const getPuzzleTimeUntilReset = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const cetOffset = 1;
  
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  tomorrow.setUTCHours(tomorrow.getUTCHours() - cetOffset);
  
  const cetMidnight = getPuzzleCETMidnight();
  const targetTime = now >= cetMidnight ? tomorrow : cetMidnight;
  
  const diff = targetTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};


// ============ WORD SEARCH GAME FUNCTIONS ============

export interface WordSearchConfigDb {
  id: number;
  difficulty: string;
  grid_size: number;
  word_count: number;
  time_limit_seconds: number;
  coins_reward: number;
  xp_reward: number;
  is_active: boolean;
}

export interface WordSearchAwardDb {
  id: string;
  user_id: string;
  user_name: string | null;
  difficulty: string;
  words_found: number;
  total_words: number;
  time_seconds: number;
  is_win: boolean;
  coins_awarded: number;
  xp_awarded: number;
  created_at: string;
}

export interface WordSearchWordDb {
  id: number;
  word: string;
  difficulty: string;
  category: string | null;
  is_active: boolean;
}

export const fetchWordSearchConfig = async (): Promise<WordSearchConfigDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('wordsearch_config')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching word search config:', error);
    return [];
  }
};

export const fetchWordSearchWords = async (difficulty?: string): Promise<WordSearchWordDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    let query = supabase
      .from('wordsearch_words')
      .select('*')
      .eq('is_active', true)
      .order('word');
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching word search words:', error);
    return [];
  }
};

export const fetchAllWordSearchWords = async (): Promise<WordSearchWordDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('wordsearch_words')
      .select('*')
      .order('difficulty')
      .order('word');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching all word search words:', error);
    return [];
  }
};

export const saveWordSearchAward = async (award: {
  userId: string;
  userName?: string;
  difficulty: string;
  wordsFound: number;
  totalWords: number;
  timeSeconds: number;
  isWin: boolean;
  coinsAwarded: number;
  xpAwarded: number;
}): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('wordsearch_awards')
      .insert({
        user_id: award.userId,
        user_name: award.userName || null,
        difficulty: award.difficulty,
        words_found: award.wordsFound,
        total_words: award.totalWords,
        time_seconds: award.timeSeconds,
        is_win: award.isWin,
        coins_awarded: award.coinsAwarded,
        xp_awarded: award.xpAwarded,
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving word search award:', error);
    return false;
  }
};

export const fetchWordSearchAwards = async (limit = 100): Promise<WordSearchAwardDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('wordsearch_awards')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching word search awards:', error);
    return [];
  }
};


// ============ WORD SEARCH REWARD TIERS ============

export interface WordSearchRewardTierDb {
  id: number;
  difficulty: string;
  max_time_seconds: number;
  coins_reward: number;
  xp_reward: number;
  tier_name: string | null;
  is_active: boolean;
}

export const fetchWordSearchRewardTiers = async (difficulty?: string): Promise<WordSearchRewardTierDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    let query = supabase
      .from('wordsearch_reward_tiers')
      .select('*')
      .eq('is_active', true)
      .order('max_time_seconds', { ascending: true });
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching word search reward tiers:', error);
    return [];
  }
};

export const getWordSearchRewardForTime = (tiers: WordSearchRewardTierDb[], timeSeconds: number): { coins: number; xp: number; tierName: string } => {
  const tier = tiers.find(t => timeSeconds <= t.max_time_seconds);
  
  if (tier) {
    return {
      coins: tier.coins_reward,
      xp: tier.xp_reward,
      tierName: tier.tier_name || 'Completed',
    };
  }
  
  const lastTier = tiers[tiers.length - 1];
  return {
    coins: lastTier?.coins_reward || 25,
    xp: lastTier?.xp_reward || 10,
    tierName: lastTier?.tier_name || 'Completed',
  };
};


// ============ MEMORY DAILY LIMITS ============

export const getMemoryCETMidnight = (): Date => {
  const now = new Date();
  const cetOffset = 1;
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  utcMidnight.setUTCHours(utcMidnight.getUTCHours() - cetOffset);
  return utcMidnight;
};

export const getTodayMemoryPlayCount = async (userId: string): Promise<number> => {
  const supabase = getSupabase();
  if (!supabase) return 0;
  
  try {
    const cetMidnight = getMemoryCETMidnight();
    
    const { count, error } = await supabase
      .from('memory_awards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_win', true)
      .gte('created_at', cetMidnight.toISOString());
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting memory plays:', error);
    return 0;
  }
};

export const getMemoryTimeUntilReset = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const cetOffset = 1;
  
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  tomorrow.setUTCHours(tomorrow.getUTCHours() - cetOffset);
  
  const cetMidnight = getMemoryCETMidnight();
  const targetTime = now >= cetMidnight ? tomorrow : cetMidnight;
  
  const diff = targetTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};


// ============ WORD SEARCH DAILY LIMITS ============

export const getWordSearchCETMidnight = (): Date => {
  const now = new Date();
  const cetOffset = 1;
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  utcMidnight.setUTCHours(utcMidnight.getUTCHours() - cetOffset);
  return utcMidnight;
};

export const getTodayWordSearchPlayCount = async (userId: string): Promise<number> => {
  const supabase = getSupabase();
  if (!supabase) return 0;
  
  try {
    const cetMidnight = getWordSearchCETMidnight();
    
    const { count, error } = await supabase
      .from('wordsearch_awards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_win', true)
      .gte('created_at', cetMidnight.toISOString());
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting word search plays:', error);
    return 0;
  }
};

export const getWordSearchTimeUntilReset = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const cetOffset = 1;
  
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  tomorrow.setUTCHours(tomorrow.getUTCHours() - cetOffset);
  
  const cetMidnight = getWordSearchCETMidnight();
  const targetTime = now >= cetMidnight ? tomorrow : cetMidnight;
  
  const diff = targetTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};


// ============ RECENT WINNERS FETCH FUNCTIONS ============

export const fetchRecentMemoryWinners = async (limit = 15): Promise<MemoryAwardDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('memory_awards')
      .select('*')
      .eq('is_win', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching memory winners:', error);
    return [];
  }
};

export const fetchRecentPuzzleWinners = async (limit = 15): Promise<PuzzleAwardDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('puzzle_awards')
      .select('*')
      .eq('is_win', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching puzzle winners:', error);
    return [];
  }
};

export const fetchRecentWordSearchWinners = async (limit = 15): Promise<WordSearchAwardDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('wordsearch_awards')
      .select('*')
      .eq('is_win', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching word search winners:', error);
    return [];
  }
};


// ============ PACMAN GAME ============

export interface PacmanConfigDb {
  id: number;
  difficulty: string;
  ghost_count: number;
  ghost_speed: number;
  pacman_speed: number;
  time_limit_seconds: number;
  coins_reward: number;
  xp_reward: number;
  is_active: boolean;
}

export interface PacmanAwardDb {
  id: string;
  user_id: string;
  user_name?: string;
  difficulty: string;
  score: number;
  dots_eaten: number;
  total_dots: number;
  ghosts_eaten: number;
  time_seconds: number;
  is_win: boolean;
  coins_awarded: number;
  xp_awarded: number;
  created_at: string;
}

export const fetchPacmanConfig = async (): Promise<PacmanConfigDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('pacman_config')
      .select('*')
      .eq('is_active', true)
      .order('difficulty');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pacman config:', error);
    return [];
  }
};

export const savePacmanAward = async (award: {
  userId: string;
  userName?: string;
  difficulty: string;
  score: number;
  dotsEaten: number;
  totalDots: number;
  ghostsEaten: number;
  timeSeconds: number;
  isWin: boolean;
  coinsAwarded: number;
  xpAwarded: number;
}): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;
  
  try {
    const { error } = await supabase
      .from('pacman_awards')
      .insert({
        user_id: award.userId,
        user_name: award.userName || null,
        difficulty: award.difficulty,
        score: award.score,
        dots_eaten: award.dotsEaten,
        total_dots: award.totalDots,
        ghosts_eaten: award.ghostsEaten,
        time_seconds: award.timeSeconds,
        is_win: award.isWin,
        coins_awarded: award.coinsAwarded,
        xp_awarded: award.xpAwarded,
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving pacman award:', error);
    return false;
  }
};

export const fetchRecentPacmanWinners = async (limit = 15): Promise<PacmanAwardDb[]> => {
  const supabase = getSupabase();
  if (!supabase) return [];
  
  try {
    const { data, error } = await supabase
      .from('pacman_awards')
      .select('*')
      .eq('is_win', true)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching pacman winners:', error);
    return [];
  }
};

const getPacmanCETMidnight = (): Date => {
  const now = new Date();
  const cetOffset = 1;
  const utcMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  utcMidnight.setUTCHours(utcMidnight.getUTCHours() - cetOffset);
  return utcMidnight;
};

export const getTodayPacmanPlayCount = async (userId: string): Promise<number> => {
  const supabase = getSupabase();
  if (!supabase) return 0;
  
  try {
    const cetMidnight = getPacmanCETMidnight();
    
    const { count, error } = await supabase
      .from('pacman_awards')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', cetMidnight.toISOString());
    
    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error counting pacman plays:', error);
    return 0;
  }
};

export const getPacmanTimeUntilReset = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const cetOffset = 1;
  
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  tomorrow.setUTCHours(tomorrow.getUTCHours() - cetOffset);
  
  const cetMidnight = getPacmanCETMidnight();
  const targetTime = now >= cetMidnight ? tomorrow : cetMidnight;
  
  const diff = targetTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds };
};
