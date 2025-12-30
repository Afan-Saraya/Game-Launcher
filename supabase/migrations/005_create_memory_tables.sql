-- Memory Game Tables
-- Migration: 005_create_memory_tables.sql

-- Table for storing memory game results/awards
CREATE TABLE public.memory_awards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    user_name character varying,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    moves integer NOT NULL DEFAULT 0,
    time_seconds integer NOT NULL DEFAULT 0,
    pairs_matched integer NOT NULL DEFAULT 0,
    total_pairs integer NOT NULL DEFAULT 0,
    is_win boolean NOT NULL DEFAULT false,
    coins_awarded integer DEFAULT 0,
    xp_awarded integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT memory_awards_pkey PRIMARY KEY (id)
);

-- Table for memory game configuration (rewards per difficulty)
CREATE TABLE public.memory_config (
    id serial NOT NULL,
    difficulty character varying NOT NULL UNIQUE CHECK (difficulty IN ('easy', 'medium', 'hard')),
    grid_cols integer NOT NULL DEFAULT 4,
    grid_rows integer NOT NULL DEFAULT 4,
    time_limit_seconds integer NOT NULL DEFAULT 30,
    preview_seconds integer NOT NULL DEFAULT 5,
    coins_reward integer NOT NULL DEFAULT 50,
    xp_reward integer NOT NULL DEFAULT 25,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT memory_config_pkey PRIMARY KEY (id)
);

-- Table for memory game leaderboard (best times per difficulty)
CREATE TABLE public.memory_leaderboard (
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
    CONSTRAINT memory_leaderboard_pkey PRIMARY KEY (id),
    CONSTRAINT memory_leaderboard_user_difficulty_unique UNIQUE (user_id, difficulty)
);

-- Create indexes for better query performance
CREATE INDEX idx_memory_awards_user_id ON public.memory_awards(user_id);
CREATE INDEX idx_memory_awards_created_at ON public.memory_awards(created_at DESC);
CREATE INDEX idx_memory_awards_difficulty ON public.memory_awards(difficulty);
CREATE INDEX idx_memory_awards_is_win ON public.memory_awards(is_win);
CREATE INDEX idx_memory_leaderboard_difficulty ON public.memory_leaderboard(difficulty);
CREATE INDEX idx_memory_leaderboard_best_time ON public.memory_leaderboard(difficulty, best_time_seconds ASC);

-- Insert default configuration for each difficulty
INSERT INTO public.memory_config (difficulty, grid_cols, grid_rows, time_limit_seconds, preview_seconds, coins_reward, xp_reward) VALUES
    ('easy', 4, 4, 30, 5, 50, 25),
    ('medium', 5, 4, 45, 5, 100, 50),
    ('hard', 6, 6, 60, 5, 200, 100);

-- Enable Row Level Security (optional - allow all for now)
ALTER TABLE public.memory_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all inserts on memory_awards" ON public.memory_awards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all reads on memory_awards" ON public.memory_awards FOR SELECT USING (true);

CREATE POLICY "Allow all reads on memory_config" ON public.memory_config FOR SELECT USING (true);

CREATE POLICY "Allow all operations on memory_leaderboard" ON public.memory_leaderboard FOR ALL USING (true) WITH CHECK (true);
