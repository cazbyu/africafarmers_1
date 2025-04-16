/*
  # Create multiplayer game tables

  1. New Tables
    - `players`
      - `id` (uuid, primary key)
      - `game_id` (uuid) - Reference to game
      - `user_id` (uuid) - Reference to auth.users
      - `country` (text) - Selected country
      - `money` (int) - Current money
      - `is_ai` (boolean) - Whether player is AI
      - `is_host` (boolean) - Whether player is host
      - `risk_profile` (text) - AI risk profile
      - `last_investment_percentage` (int) - Last investment made
      - `is_bankrupt` (boolean) - Whether player is bankrupt
      - `created_at` (timestamp)

    - `games`
      - `id` (uuid, primary key)
      - `status` (text) - Game status (waiting, in_progress, completed)
      - `current_season` (int) - Current game season
      - `current_player_index` (int) - Index of current player
      - `last_roll` (int[]) - Last dice roll
      - `roll_history` (jsonb) - History of all rolls
      - `winner_id` (uuid) - Reference to winning player
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create players table first
CREATE TABLE players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid,
  user_id uuid REFERENCES auth.users(id),
  country text NOT NULL,
  money int NOT NULL DEFAULT 1000,
  is_ai boolean NOT NULL DEFAULT false,
  is_host boolean NOT NULL DEFAULT false,
  risk_profile text,
  last_investment_percentage int,
  is_bankrupt boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create games table with reference to players
CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text NOT NULL DEFAULT 'waiting',
  current_season int NOT NULL DEFAULT 1,
  current_player_index int NOT NULL DEFAULT 0,
  last_roll int[] DEFAULT NULL,
  roll_history jsonb DEFAULT '[]'::jsonb,
  winner_id uuid REFERENCES players(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint after both tables exist
ALTER TABLE players 
  ADD CONSTRAINT players_game_id_fkey 
  FOREIGN KEY (game_id) 
  REFERENCES games(id) 
  ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Create policies for games
CREATE POLICY "Anyone can view available games"
  ON games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can update their games"
  ON games FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM players
      WHERE game_id = games.id
      AND user_id = auth.uid()
    )
  );

-- Create policies for players
CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Players can update their own data"
  ON players FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Players can delete their own data"
  ON players FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can create players"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create function to update game timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamps
CREATE TRIGGER update_games_updated_at
  BEFORE UPDATE ON games
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();