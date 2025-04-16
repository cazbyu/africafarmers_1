/*
  # Fix game start functionality

  1. Changes
    - Add ON DELETE CASCADE to players foreign key
    - Add missing foreign key constraints
    - Fix player references

  2. Security
    - Maintain existing RLS policies
*/

-- Add missing foreign key constraints with CASCADE delete
ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_game_id_fkey,
ADD CONSTRAINT players_game_id_fkey 
  FOREIGN KEY (game_id) 
  REFERENCES games(id) 
  ON DELETE CASCADE;

-- Add user_id foreign key constraint
ALTER TABLE players
DROP CONSTRAINT IF EXISTS players_user_id_fkey,
ADD CONSTRAINT players_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Add winner_id foreign key constraint
ALTER TABLE games
DROP CONSTRAINT IF EXISTS games_winner_id_fkey,
ADD CONSTRAINT games_winner_id_fkey 
  FOREIGN KEY (winner_id) 
  REFERENCES players(id) 
  ON DELETE SET NULL;