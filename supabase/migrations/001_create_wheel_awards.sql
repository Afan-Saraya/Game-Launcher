-- Migration: Create wheel_awards table
-- Description: Stores all prize wins from the wheel of fortune game

CREATE TABLE IF NOT EXISTS wheel_awards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prize_id INTEGER NOT NULL,
    prize_label VARCHAR(100) NOT NULL,
    prize_icon VARCHAR(50) NOT NULL,
    prize_color VARCHAR(20) NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Index for faster queries
    CONSTRAINT wheel_awards_prize_id_check CHECK (prize_id > 0)
);

-- Index for fetching user's awards
CREATE INDEX idx_wheel_awards_user_id ON wheel_awards(user_id);

-- Index for fetching recent awards (for the winners sidebar)
CREATE INDEX idx_wheel_awards_created_at ON wheel_awards(created_at DESC);

-- Enable Row Level Security
ALTER TABLE wheel_awards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all awards (for the public winners list)
CREATE POLICY "Anyone can view awards" ON wheel_awards
    FOR SELECT
    USING (true);

-- Policy: Users can only insert their own awards
CREATE POLICY "Users can insert own awards" ON wheel_awards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Comment on table
COMMENT ON TABLE wheel_awards IS 'Stores wheel of fortune prize wins';
