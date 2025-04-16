/*
  # Add player_number column to players table

  1. Changes
    - Add player_number column to players table
    - Update existing records with sequential numbers
    - Make player_number NOT NULL
*/

-- Add player_number column
ALTER TABLE players ADD COLUMN IF NOT EXISTS player_number integer;

-- Update existing records with sequential numbers based on creation order
WITH numbered_players AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY game_id ORDER BY created_at) as row_num
  FROM players
)
UPDATE players
SET player_number = numbered_players.row_num
FROM numbered_players
WHERE players.id = numbered_players.id;

-- Make player_number NOT NULL after setting initial values
ALTER TABLE players ALTER COLUMN player_number SET NOT NULL;

-- Add unique constraint per game
ALTER TABLE players ADD CONSTRAINT unique_player_number_per_game UNIQUE (game_id, player_number);