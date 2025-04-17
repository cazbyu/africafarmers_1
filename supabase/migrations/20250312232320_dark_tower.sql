/*
  # Add auto-start functionality
  
  1. Changes
    - Add auto_start_time column to games table
    - Add index for faster querying of games by auto_start_time
*/

-- Add auto_start_time column to games table
ALTER TABLE games
ADD COLUMN IF NOT EXISTS auto_start_time timestamptz;

-- Add index for auto_start_time
CREATE INDEX IF NOT EXISTS idx_games_auto_start_time
ON games (auto_start_time)
WHERE status = 'waiting';