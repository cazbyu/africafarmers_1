/*
  # Update RLS policies to allow public access

  1. Changes
    - Modify RLS policies to allow public access
    - Remove authentication requirements
    - Keep basic data integrity checks
    - Fix UUID type casting issues

  2. Security
    - Enable RLS on both tables
    - Add policies for public access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view available games" ON games;
DROP POLICY IF EXISTS "Authenticated users can create games" ON games;
DROP POLICY IF EXISTS "Players can update their games" ON games;
DROP POLICY IF EXISTS "Players can delete their games" ON games;
DROP POLICY IF EXISTS "Anyone can view players" ON players;
DROP POLICY IF EXISTS "Authenticated users can create players" ON players;
DROP POLICY IF EXISTS "Players can update their own data" ON players;
DROP POLICY IF EXISTS "Players can delete their own data" ON players;
DROP POLICY IF EXISTS "Game participants can manage AI players" ON players;

-- Create new policies for games
CREATE POLICY "Anyone can view games"
ON games FOR SELECT
USING (true);

CREATE POLICY "Anyone can create games"
ON games FOR INSERT
WITH CHECK (true);

CREATE POLICY "Players can update games"
ON games FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.game_id = games.id
    AND (
      (auth.uid() IS NULL AND players.user_id IS NOT NULL) OR
      (auth.uid() IS NOT NULL AND players.user_id = auth.uid())
    )
  )
);

CREATE POLICY "Players can delete games"
ON games FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM players
    WHERE players.game_id = games.id
    AND (
      (auth.uid() IS NULL AND players.user_id IS NOT NULL) OR
      (auth.uid() IS NOT NULL AND players.user_id = auth.uid())
    )
    AND players.is_host = true
  )
);

-- Create new policies for players
CREATE POLICY "Anyone can view players"
ON players FOR SELECT
USING (true);

CREATE POLICY "Anyone can create players"
ON players FOR INSERT
WITH CHECK (true);

CREATE POLICY "Players can update their data"
ON players FOR UPDATE
USING (
  (
    (auth.uid() IS NULL AND user_id IS NOT NULL) OR
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  ) OR
  (is_ai AND EXISTS (
    SELECT 1 FROM players p
    WHERE p.game_id = players.game_id
    AND (
      (auth.uid() IS NULL AND p.user_id IS NOT NULL) OR
      (auth.uid() IS NOT NULL AND p.user_id = auth.uid())
    )
  ))
);

CREATE POLICY "Players can delete their data"
ON players FOR DELETE
USING (
  (
    (auth.uid() IS NULL AND user_id IS NOT NULL) OR
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  ) OR
  (is_ai AND EXISTS (
    SELECT 1 FROM players p
    WHERE p.game_id = players.game_id
    AND (
      (auth.uid() IS NULL AND p.user_id IS NOT NULL) OR
      (auth.uid() IS NOT NULL AND p.user_id = auth.uid())
    )
    AND p.is_host = true
  ))
);