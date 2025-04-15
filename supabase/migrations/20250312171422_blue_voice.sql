/*
  # Remove auth users constraint and update policies

  1. Changes
    - Remove foreign key constraint to auth.users
    - Update user_id column to allow any UUID
    - Update policies to work without auth

  2. Security
    - Maintain RLS but without auth dependency
*/

-- Remove the auth users foreign key constraint
ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_user_id_fkey;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view games" ON games;
DROP POLICY IF EXISTS "Anyone can create games" ON games;
DROP POLICY IF EXISTS "Players can update games" ON games;
DROP POLICY IF EXISTS "Players can delete games" ON games;
DROP POLICY IF EXISTS "Anyone can view players" ON players;
DROP POLICY IF EXISTS "Anyone can create players" ON players;
DROP POLICY IF EXISTS "Players can update their data" ON players;
DROP POLICY IF EXISTS "Players can delete their data" ON players;

-- Create new policies for games
CREATE POLICY "Anyone can view games"
ON games FOR SELECT
USING (true);

CREATE POLICY "Anyone can create games"
ON games FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update games"
ON games FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete games"
ON games FOR DELETE
USING (true);

-- Create new policies for players
CREATE POLICY "Anyone can view players"
ON players FOR SELECT
USING (true);

CREATE POLICY "Anyone can create players"
ON players FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update players"
ON players FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete players"
ON players FOR DELETE
USING (true);