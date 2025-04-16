/*
  # Update RLS policies for games table

  1. Security
    - Enable RLS on games table if not already enabled
    - Add policies (if they don't exist):
      - Anyone can view available games
      - Authenticated users can create games
      - Players can update their games
      - Host players can delete their games
*/

-- Enable RLS
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'games' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE games ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view available games" ON games;
  DROP POLICY IF EXISTS "Authenticated users can create games" ON games;
  DROP POLICY IF EXISTS "Players can update their games" ON games;
  DROP POLICY IF EXISTS "Players can delete their games" ON games;
END $$;

-- Recreate policies
CREATE POLICY "Anyone can view available games"
ON games
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create games"
ON games
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Players can update their games"
ON games
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.game_id = games.id
    AND players.user_id = auth.uid()
  )
);

CREATE POLICY "Players can delete their games"
ON games
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.game_id = games.id
    AND players.user_id = auth.uid()
    AND players.is_host = true
  )
);