export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          id: string
          status: string
          current_season: number
          current_player_index: number
          last_roll: number[] | null
          roll_history: Json | null
          winner_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          status?: string
          current_season?: number
          current_player_index?: number
          last_roll?: number[] | null
          roll_history?: Json | null
          winner_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          status?: string
          current_season?: number
          current_player_index?: number
          last_roll?: number[] | null
          roll_history?: Json | null
          winner_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      players: {
        Row: {
          id: string
          game_id: string | null
          user_id: string | null
          country: string
          money: number
          is_ai: boolean
          is_host: boolean
          risk_profile: string | null
          last_investment_percentage: number | null
          is_bankrupt: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          game_id?: string | null
          user_id?: string | null
          country: string
          money?: number
          is_ai?: boolean
          is_host?: boolean
          risk_profile?: string | null
          last_investment_percentage?: number | null
          is_bankrupt?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          game_id?: string | null
          user_id?: string | null
          country?: string
          money?: number
          is_ai?: boolean
          is_host?: boolean
          risk_profile?: string | null
          last_investment_percentage?: number | null
          is_bankrupt?: boolean
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}