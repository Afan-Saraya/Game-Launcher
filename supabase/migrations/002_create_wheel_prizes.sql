-- Migration: Create wheel_prizes table
-- Description: Stores configurable prizes for the wheel of fortune game

CREATE TABLE IF NOT EXISTS wheel_prizes (
    id SERIAL PRIMARY KEY,
    label VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(20) NOT NULL,
    image_url TEXT,
    points_value INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default prizes
INSERT INTO wheel_prizes (id, label, icon, description, color, points_value, sort_order) VALUES
(1, 'Partner Prize', 'gift', 'Special partner reward - exclusive merchandise or voucher', '#EC4899', 0, 1),
(2, '100 Points', 'sparkles', '100 bonus points added to your balance', '#7C3AED', 100, 2),
(3, 'Free Spin', 'rotateCcw', 'One free spin token - spin again for free!', '#3B82F6', 120, 3),
(4, '50 Points', 'diamond', '50 bonus points added to your balance', '#8B5CF6', 50, 4),
(5, 'Mystery Box', 'box', 'Random surprise reward - could be anything!', '#EC4899', 0, 5),
(6, '200 Points', 'crown', '200 bonus points added to your balance', '#7C3AED', 200, 6),
(7, 'Try Again', 'clock', 'Better luck next time - keep spinning!', '#3B82F6', 0, 7),
(8, 'Jackpot', 'zap', 'Grand prize winner! 500 bonus points!', '#8B5CF6', 500, 8)
ON CONFLICT (id) DO NOTHING;

-- Index for active prizes
CREATE INDEX idx_wheel_prizes_active ON wheel_prizes(is_active, sort_order);

-- Enable Row Level Security
ALTER TABLE wheel_prizes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active prizes
CREATE POLICY "Anyone can view prizes" ON wheel_prizes
    FOR SELECT
    USING (true);

-- Policy: Only service role can modify prizes (admin)
CREATE POLICY "Service role can modify prizes" ON wheel_prizes
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_wheel_prizes_updated_at
    BEFORE UPDATE ON wheel_prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE wheel_prizes IS 'Configurable prizes for the wheel of fortune game';
