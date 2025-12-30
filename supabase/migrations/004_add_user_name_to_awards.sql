-- Add user_name column to wheel_awards for displaying actual names
ALTER TABLE wheel_awards ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_wheel_awards_created_at ON wheel_awards(created_at DESC);
