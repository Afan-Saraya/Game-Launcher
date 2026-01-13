-- Pac-Man Game Tables
-- Migration: 013_create_pacman_tables.sql

-- Table for storing pac-man game results/awards
CREATE TABLE public.pacman_awards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    user_name character varying,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    score integer NOT NULL DEFAULT 0,
    dots_eaten integer NOT NULL DEFAULT 0,
    total_dots integer NOT NULL DEFAULT 0,
    ghosts_eaten integer NOT NULL DEFAULT 0,
    time_seconds integer NOT NULL DEFAULT 0,
    is_win boolean NOT NULL DEFAULT false,
    coins_awarded integer DEFAULT 0,
    xp_awarded integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pacman_awards_pkey PRIMARY KEY (id)
);

-- Table for pac-man game configuration (settings per difficulty)
CREATE TABLE public.pacman_config (
    id serial NOT NULL,
    difficulty character varying NOT NULL UNIQUE CHECK (difficulty IN ('easy', 'medium', 'hard')),
    ghost_count integer NOT NULL DEFAULT 2,
    ghost_speed integer NOT NULL DEFAULT 300,
    pacman_speed integer NOT NULL DEFAULT 120,
    time_limit_seconds integer NOT NULL DEFAULT 120,
    coins_reward integer NOT NULL DEFAULT 50,
    xp_reward integer NOT NULL DEFAULT 25,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pacman_config_pkey PRIMARY KEY (id)
);

-- Table for pac-man leaderboard (best scores per difficulty)
CREATE TABLE public.pacman_leaderboard (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    user_name character varying,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    best_score integer NOT NULL DEFAULT 0,
    best_time_seconds integer,
    games_played integer NOT NULL DEFAULT 1,
    games_won integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT pacman_leaderboard_pkey PRIMARY KEY (id),
    CONSTRAINT pacman_leaderboard_user_difficulty_unique UNIQUE (user_id, difficulty)
);

-- Create indexes for better query performance
CREATE INDEX idx_pacman_awards_user_id ON public.pacman_awards(user_id);
CREATE INDEX idx_pacman_awards_created_at ON public.pacman_awards(created_at DESC);
CREATE INDEX idx_pacman_awards_difficulty ON public.pacman_awards(difficulty);
CREATE INDEX idx_pacman_awards_is_win ON public.pacman_awards(is_win);
CREATE INDEX idx_pacman_leaderboard_difficulty ON public.pacman_leaderboard(difficulty);
CREATE INDEX idx_pacman_leaderboard_best_score ON public.pacman_leaderboard(difficulty, best_score DESC);

-- Insert default configuration for each difficulty
INSERT INTO public.pacman_config (difficulty, ghost_count, ghost_speed, pacman_speed, time_limit_seconds, coins_reward, xp_reward) VALUES
    ('easy', 2, 450, 120, 120, 50, 25),
    ('medium', 3, 380, 120, 90, 100, 50),
    ('hard', 4, 320, 120, 60, 200, 100);

-- Enable Row Level Security
ALTER TABLE public.pacman_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacman_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacman_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all inserts on pacman_awards" ON public.pacman_awards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all reads on pacman_awards" ON public.pacman_awards FOR SELECT USING (true);

CREATE POLICY "Allow all reads on pacman_config" ON public.pacman_config FOR SELECT USING (true);
CREATE POLICY "Allow all updates on pacman_config" ON public.pacman_config FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on pacman_leaderboard" ON public.pacman_leaderboard FOR ALL USING (true) WITH CHECK (true);
