-- Puzzle Game Tables
-- Migration: 007_create_puzzle_tables.sql

-- Table for storing puzzle game results/awards
CREATE TABLE public.puzzle_awards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    user_name character varying,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    grid_size integer NOT NULL DEFAULT 3,
    moves integer NOT NULL DEFAULT 0,
    time_seconds integer NOT NULL DEFAULT 0,
    puzzle_image_id integer,
    is_win boolean NOT NULL DEFAULT false,
    coins_awarded integer DEFAULT 0,
    xp_awarded integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT puzzle_awards_pkey PRIMARY KEY (id)
);

-- Table for puzzle game configuration (rewards per difficulty)
CREATE TABLE public.puzzle_config (
    id serial NOT NULL,
    difficulty character varying NOT NULL UNIQUE CHECK (difficulty IN ('easy', 'medium', 'hard')),
    grid_size integer NOT NULL DEFAULT 3,
    preview_seconds integer NOT NULL DEFAULT 3,
    coins_reward integer NOT NULL DEFAULT 50,
    xp_reward integer NOT NULL DEFAULT 25,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT puzzle_config_pkey PRIMARY KEY (id)
);

-- Table for puzzle game leaderboard (best times per difficulty)
CREATE TABLE public.puzzle_leaderboard (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    user_name character varying,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    best_time_seconds integer NOT NULL,
    best_moves integer NOT NULL,
    games_played integer NOT NULL DEFAULT 1,
    games_won integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT puzzle_leaderboard_pkey PRIMARY KEY (id),
    CONSTRAINT puzzle_leaderboard_user_difficulty_unique UNIQUE (user_id, difficulty)
);

-- Create indexes for better query performance
CREATE INDEX idx_puzzle_awards_user_id ON public.puzzle_awards(user_id);
CREATE INDEX idx_puzzle_awards_created_at ON public.puzzle_awards(created_at DESC);
CREATE INDEX idx_puzzle_awards_difficulty ON public.puzzle_awards(difficulty);
CREATE INDEX idx_puzzle_awards_is_win ON public.puzzle_awards(is_win);
CREATE INDEX idx_puzzle_awards_time ON public.puzzle_awards(difficulty, time_seconds ASC) WHERE is_win = true;
CREATE INDEX idx_puzzle_leaderboard_difficulty ON public.puzzle_leaderboard(difficulty);
CREATE INDEX idx_puzzle_leaderboard_best_time ON public.puzzle_leaderboard(difficulty, best_time_seconds ASC);

-- Insert default configuration for each difficulty
INSERT INTO public.puzzle_config (difficulty, grid_size, preview_seconds, coins_reward, xp_reward) VALUES
    ('easy', 3, 5, 50, 25),
    ('medium', 4, 4, 100, 50),
    ('hard', 5, 3, 200, 100);

-- Enable Row Level Security
ALTER TABLE public.puzzle_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all inserts on puzzle_awards" ON public.puzzle_awards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all reads on puzzle_awards" ON public.puzzle_awards FOR SELECT USING (true);

CREATE POLICY "Allow all reads on puzzle_config" ON public.puzzle_config FOR SELECT USING (true);
CREATE POLICY "Allow all updates on puzzle_config" ON public.puzzle_config FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on puzzle_leaderboard" ON public.puzzle_leaderboard FOR ALL USING (true) WITH CHECK (true);
