/*
  # Fix player ordering and investment processing

  1. Changes
    - Add player_number column if not exists
    - Update existing records with sequential numbers
    - Add unique constraint for player numbers per game
    - Add trigger to maintain player order
*/

-- Add player_number column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'players' AND column_name = 'player_number'
  ) THEN
    ALTER TABLE players ADD COLUMN player_number integer;
  END IF;
END $$;

-- Update existing records with sequential numbers based on creation order
WITH numbered_players AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY game_id ORDER BY created_at) as row_num
  FROM players
)
UPDATE players
SET player_number = numbered_players.row_num
FROM numbered_players
WHERE players.id = numbered_players.id
  AND players.player_number IS NULL;

-- Make player_number NOT NULL
ALTER TABLE players 
  ALTER COLUMN player_number SET NOT NULL;

-- Add unique constraint per game if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_player_number_per_game'
  ) THEN
    ALTER TABLE players 
      ADD CONSTRAINT unique_player_number_per_game 
      UNIQUE (game_id, player_number);
  END IF;
END $$;

-- Create function to maintain player order
CREATE OR REPLACE FUNCTION maintain_player_order()
RETURNS TRIGGER AS $$
BEGIN
  -- For new players, assign the next available number
  IF TG_OP = 'INSERT' THEN
    SELECT COALESCE(MAX(player_number), 0) + 1
    INTO NEW.player_number
    FROM players
    WHERE game_id = NEW.game_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'trigger_maintain_player_order'
  ) THEN
    CREATE TRIGGER trigger_maintain_player_order
      BEFORE INSERT ON players
      FOR EACH ROW
      EXECUTE FUNCTION maintain_player_order();
  END IF;
END $$;