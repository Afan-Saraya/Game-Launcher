-- Puzzle Reward Tiers Table
-- Migration: 009_create_puzzle_reward_tiers.sql

-- Table for time-based reward tiers per difficulty
CREATE TABLE public.puzzle_reward_tiers (
    id serial NOT NULL,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    max_time_seconds integer NOT NULL,
    coins_reward integer NOT NULL DEFAULT 0,
    xp_reward integer NOT NULL DEFAULT 0,
    tier_name character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT puzzle_reward_tiers_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX idx_puzzle_reward_tiers_difficulty ON public.puzzle_reward_tiers(difficulty);
CREATE INDEX idx_puzzle_reward_tiers_time ON public.puzzle_reward_tiers(difficulty, max_time_seconds ASC);

-- Enable RLS
ALTER TABLE public.puzzle_reward_tiers ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all reads on puzzle_reward_tiers" ON public.puzzle_reward_tiers FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on puzzle_reward_tiers" ON public.puzzle_reward_tiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on puzzle_reward_tiers" ON public.puzzle_reward_tiers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all deletes on puzzle_reward_tiers" ON public.puzzle_reward_tiers FOR DELETE USING (true);

-- Insert default reward tiers for each difficulty
-- Easy: 3x3 puzzle
INSERT INTO public.puzzle_reward_tiers (difficulty, max_time_seconds, coins_reward, xp_reward, tier_name) VALUES
    ('easy', 30, 100, 50, 'Lightning Fast'),
    ('easy', 60, 75, 35, 'Quick'),
    ('easy', 120, 50, 25, 'Normal'),
    ('easy', 999999, 25, 10, 'Completed');

-- Medium: 4x4 puzzle
INSERT INTO public.puzzle_reward_tiers (difficulty, max_time_seconds, coins_reward, xp_reward, tier_name) VALUES
    ('medium', 60, 200, 100, 'Lightning Fast'),
    ('medium', 120, 150, 75, 'Quick'),
    ('medium', 180, 100, 50, 'Normal'),
    ('medium', 999999, 50, 25, 'Completed');

-- Hard: 5x5 puzzle
INSERT INTO public.puzzle_reward_tiers (difficulty, max_time_seconds, coins_reward, xp_reward, tier_name) VALUES
    ('hard', 120, 400, 200, 'Lightning Fast'),
    ('hard', 180, 300, 150, 'Quick'),
    ('hard', 300, 200, 100, 'Normal'),
    ('hard', 999999, 100, 50, 'Completed');
