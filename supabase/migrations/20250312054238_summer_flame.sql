/*
  # Add RLS policies for players table

  1. Security
    - Enable RLS on players table
    - Add policies for:
      - Viewing players (authenticated users)
      - Creating players (authenticated users)
      - Updating players (game participants)
      - Deleting players (game participants)
    - Special policy for AI players
*/

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view players" ON players;
DROP POLICY IF EXISTS "Authenticated users can create players" ON players;
DROP POLICY IF EXISTS "Players can update their own data" ON players;
DROP POLICY IF EXISTS "Players can delete their own data" ON players;
DROP POLICY IF EXISTS "Game participants can manage AI players" ON players;

-- Create policies
CREATE POLICY "Anyone can view players"
ON players
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create players"
ON players
FOR INSERT
TO authenticated
WITH CHECK (
  (user_id = auth.uid() AND NOT is_ai) OR
  EXISTS (
    SELECT 1 FROM games g
    INNER JOIN players p ON p.game_id = g.id
    WHERE g.id = players.game_id
    AND p.user_id = auth.uid()
    AND p.is_host = true
  )
);

CREATE POLICY "Players can update their own data"
ON players
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  (is_ai AND EXISTS (
    SELECT 1 FROM players p
    WHERE p.game_id = players.game_id
    AND p.user_id = auth.uid()
  ))
);

CREATE POLICY "Players can delete their own data"
ON players
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid() OR
  (is_ai AND EXISTS (
    SELECT 1 FROM players p
    WHERE p.game_id = players.game_id
    AND p.user_id = auth.uid()
    AND p.is_host = true
  ))
);