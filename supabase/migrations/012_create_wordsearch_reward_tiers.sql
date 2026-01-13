-- Word Search Reward Tiers Table
-- Migration: 012_create_wordsearch_reward_tiers.sql

-- Table for time-based reward tiers per difficulty
CREATE TABLE public.wordsearch_reward_tiers (
    id serial NOT NULL,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    max_time_seconds integer NOT NULL,
    coins_reward integer NOT NULL DEFAULT 0,
    xp_reward integer NOT NULL DEFAULT 0,
    tier_name character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wordsearch_reward_tiers_pkey PRIMARY KEY (id)
);

-- Create indexes
CREATE INDEX idx_wordsearch_reward_tiers_difficulty ON public.wordsearch_reward_tiers(difficulty);
CREATE INDEX idx_wordsearch_reward_tiers_time ON public.wordsearch_reward_tiers(difficulty, max_time_seconds ASC);

-- Enable RLS
ALTER TABLE public.wordsearch_reward_tiers ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all reads on wordsearch_reward_tiers" ON public.wordsearch_reward_tiers FOR SELECT USING (true);
CREATE POLICY "Allow all inserts on wordsearch_reward_tiers" ON public.wordsearch_reward_tiers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates on wordsearch_reward_tiers" ON public.wordsearch_reward_tiers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow all deletes on wordsearch_reward_tiers" ON public.wordsearch_reward_tiers FOR DELETE USING (true);

-- Insert default reward tiers for each difficulty
-- Easy: 8x8 grid, 5 words, 180s limit
INSERT INTO public.wordsearch_reward_tiers (difficulty, max_time_seconds, coins_reward, xp_reward, tier_name) VALUES
    ('easy', 60, 100, 50, 'Lightning Fast'),
    ('easy', 120, 75, 35, 'Quick'),
    ('easy', 180, 50, 25, 'Normal'),
    ('easy', 999999, 25, 10, 'Completed');

-- Medium: 10x10 grid, 8 words, 240s limit
INSERT INTO public.wordsearch_reward_tiers (difficulty, max_time_seconds, coins_reward, xp_reward, tier_name) VALUES
    ('medium', 90, 200, 100, 'Lightning Fast'),
    ('medium', 150, 150, 75, 'Quick'),
    ('medium', 240, 100, 50, 'Normal'),
    ('medium', 999999, 50, 25, 'Completed');

-- Hard: 12x12 grid, 12 words, 300s limit
INSERT INTO public.wordsearch_reward_tiers (difficulty, max_time_seconds, coins_reward, xp_reward, tier_name) VALUES
    ('hard', 150, 400, 200, 'Lightning Fast'),
    ('hard', 220, 300, 150, 'Quick'),
    ('hard', 300, 200, 100, 'Normal'),
    ('hard', 999999, 100, 50, 'Completed');
