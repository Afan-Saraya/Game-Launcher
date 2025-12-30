-- Migration: Add coins and XP rewards to wheel_prizes
-- Description: Adds separate columns for coins and XP rewards instead of generic points

-- Add new columns for coins and XP
ALTER TABLE wheel_prizes 
ADD COLUMN IF NOT EXISTS coins_reward INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 0;

-- Update existing prizes with coins/XP values (migrate from points_value)
UPDATE wheel_prizes SET coins_reward = 0, xp_reward = 0 WHERE id = 1; -- Partner Prize
UPDATE wheel_prizes SET coins_reward = 100, xp_reward = 50 WHERE id = 2; -- 100 Points -> 100 coins, 50 XP
UPDATE wheel_prizes SET coins_reward = 120, xp_reward = 0 WHERE id = 3; -- Free Spin -> refund 120 coins
UPDATE wheel_prizes SET coins_reward = 50, xp_reward = 25 WHERE id = 4; -- 50 Points -> 50 coins, 25 XP
UPDATE wheel_prizes SET coins_reward = 0, xp_reward = 100 WHERE id = 5; -- Mystery Box -> 100 XP
UPDATE wheel_prizes SET coins_reward = 200, xp_reward = 100 WHERE id = 6; -- 200 Points -> 200 coins, 100 XP
UPDATE wheel_prizes SET coins_reward = 0, xp_reward = 10 WHERE id = 7; -- Try Again -> 10 XP consolation
UPDATE wheel_prizes SET coins_reward = 500, xp_reward = 250 WHERE id = 8; -- Jackpot -> 500 coins, 250 XP

-- Also update wheel_awards table to track coins and XP separately
ALTER TABLE wheel_awards
ADD COLUMN IF NOT EXISTS coins_awarded INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp_awarded INTEGER DEFAULT 0;

-- Migrate existing points_awarded to coins_awarded (assuming points were coins)
UPDATE wheel_awards SET coins_awarded = points_awarded WHERE coins_awarded = 0 AND points_awarded > 0;

-- Add comments
COMMENT ON COLUMN wheel_prizes.coins_reward IS 'Number of coins awarded for this prize';
COMMENT ON COLUMN wheel_prizes.xp_reward IS 'Amount of XP awarded for this prize';
COMMENT ON COLUMN wheel_awards.coins_awarded IS 'Coins awarded for this spin';
COMMENT ON COLUMN wheel_awards.xp_awarded IS 'XP awarded for this spin';
