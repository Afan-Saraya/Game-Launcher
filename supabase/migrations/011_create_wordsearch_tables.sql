-- Word Search Game Tables
-- Migration: 011_create_wordsearch_tables.sql

-- Table for storing word search game results/awards
CREATE TABLE public.wordsearch_awards (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    user_name character varying,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    words_found integer NOT NULL DEFAULT 0,
    total_words integer NOT NULL DEFAULT 0,
    time_seconds integer NOT NULL DEFAULT 0,
    is_win boolean NOT NULL DEFAULT false,
    coins_awarded integer DEFAULT 0,
    xp_awarded integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wordsearch_awards_pkey PRIMARY KEY (id)
);

-- Table for word search game configuration (settings per difficulty)
CREATE TABLE public.wordsearch_config (
    id serial NOT NULL,
    difficulty character varying NOT NULL UNIQUE CHECK (difficulty IN ('easy', 'medium', 'hard')),
    grid_size integer NOT NULL DEFAULT 8,
    word_count integer NOT NULL DEFAULT 5,
    time_limit_seconds integer NOT NULL DEFAULT 180,
    coins_reward integer NOT NULL DEFAULT 50,
    xp_reward integer NOT NULL DEFAULT 25,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wordsearch_config_pkey PRIMARY KEY (id)
);

-- Table for custom word lists (CMS managed)
CREATE TABLE public.wordsearch_words (
    id serial NOT NULL,
    word character varying(50) NOT NULL,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category character varying(50),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wordsearch_words_pkey PRIMARY KEY (id)
);

-- Table for word search leaderboard (best times per difficulty)
CREATE TABLE public.wordsearch_leaderboard (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    user_name character varying,
    difficulty character varying NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    best_time_seconds integer NOT NULL,
    games_played integer NOT NULL DEFAULT 1,
    games_won integer NOT NULL DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wordsearch_leaderboard_pkey PRIMARY KEY (id),
    CONSTRAINT wordsearch_leaderboard_user_difficulty_unique UNIQUE (user_id, difficulty)
);

-- Create indexes for better query performance
CREATE INDEX idx_wordsearch_awards_user_id ON public.wordsearch_awards(user_id);
CREATE INDEX idx_wordsearch_awards_created_at ON public.wordsearch_awards(created_at DESC);
CREATE INDEX idx_wordsearch_awards_difficulty ON public.wordsearch_awards(difficulty);
CREATE INDEX idx_wordsearch_awards_is_win ON public.wordsearch_awards(is_win);
CREATE INDEX idx_wordsearch_words_difficulty ON public.wordsearch_words(difficulty);
CREATE INDEX idx_wordsearch_words_active ON public.wordsearch_words(is_active) WHERE is_active = true;
CREATE INDEX idx_wordsearch_leaderboard_difficulty ON public.wordsearch_leaderboard(difficulty);
CREATE INDEX idx_wordsearch_leaderboard_best_time ON public.wordsearch_leaderboard(difficulty, best_time_seconds ASC);

-- Insert default configuration for each difficulty
INSERT INTO public.wordsearch_config (difficulty, grid_size, word_count, time_limit_seconds, coins_reward, xp_reward) VALUES
    ('easy', 8, 5, 180, 50, 25),
    ('medium', 10, 8, 240, 100, 50),
    ('hard', 12, 12, 300, 200, 100);

-- Insert default words for each difficulty
-- Easy words (3-4 letters)
INSERT INTO public.wordsearch_words (word, difficulty, category) VALUES
    ('CAT', 'easy', 'animals'),
    ('DOG', 'easy', 'animals'),
    ('SUN', 'easy', 'nature'),
    ('HAT', 'easy', 'clothing'),
    ('RUN', 'easy', 'actions'),
    ('FUN', 'easy', 'emotions'),
    ('BIG', 'easy', 'adjectives'),
    ('RED', 'easy', 'colors'),
    ('TOP', 'easy', 'positions'),
    ('CUP', 'easy', 'objects'),
    ('BOX', 'easy', 'objects'),
    ('PEN', 'easy', 'objects'),
    ('MAP', 'easy', 'objects'),
    ('BUS', 'easy', 'vehicles'),
    ('NET', 'easy', 'objects');

-- Medium words (5-6 letters)
INSERT INTO public.wordsearch_words (word, difficulty, category) VALUES
    ('APPLE', 'medium', 'food'),
    ('BEACH', 'medium', 'places'),
    ('CLOUD', 'medium', 'nature'),
    ('DANCE', 'medium', 'actions'),
    ('EAGLE', 'medium', 'animals'),
    ('FLAME', 'medium', 'nature'),
    ('GRAPE', 'medium', 'food'),
    ('HOUSE', 'medium', 'places'),
    ('JUICE', 'medium', 'food'),
    ('KITES', 'medium', 'objects'),
    ('LEMON', 'medium', 'food'),
    ('MUSIC', 'medium', 'arts'),
    ('NIGHT', 'medium', 'time'),
    ('OCEAN', 'medium', 'nature'),
    ('PIANO', 'medium', 'music');

-- Hard words (7+ letters)
INSERT INTO public.wordsearch_words (word, difficulty, category) VALUES
    ('ADVENTURE', 'hard', 'concepts'),
    ('BUTTERFLY', 'hard', 'animals'),
    ('CHOCOLATE', 'hard', 'food'),
    ('DISCOVERY', 'hard', 'concepts'),
    ('ELEPHANT', 'hard', 'animals'),
    ('FANTASTIC', 'hard', 'adjectives'),
    ('GORGEOUS', 'hard', 'adjectives'),
    ('HAPPINESS', 'hard', 'emotions'),
    ('IMPORTANT', 'hard', 'adjectives'),
    ('JELLYFISH', 'hard', 'animals'),
    ('KNOWLEDGE', 'hard', 'concepts'),
    ('LIGHTNING', 'hard', 'nature');

-- Enable Row Level Security
ALTER TABLE public.wordsearch_awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wordsearch_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wordsearch_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wordsearch_leaderboard ENABLE ROW LEVEL SECURITY;

-- Create permissive policies
CREATE POLICY "Allow all inserts on wordsearch_awards" ON public.wordsearch_awards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all reads on wordsearch_awards" ON public.wordsearch_awards FOR SELECT USING (true);

CREATE POLICY "Allow all reads on wordsearch_config" ON public.wordsearch_config FOR SELECT USING (true);
CREATE POLICY "Allow all updates on wordsearch_config" ON public.wordsearch_config FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on wordsearch_words" ON public.wordsearch_words FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on wordsearch_leaderboard" ON public.wordsearch_leaderboard FOR ALL USING (true) WITH CHECK (true);
