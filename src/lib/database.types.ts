export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      syntax_error_episode_comments: {
        Row: {
          author_display_name: string
          body: string
          created_at: string
          episode_ref: number
          id: string
          parent_id: string | null
        }
        Insert: {
          author_display_name: string
          body: string
          created_at?: string
          episode_ref: number
          id?: string
          parent_id?: string | null
        }
        Update: {
          author_display_name?: string
          body?: string
          created_at?: string
          episode_ref?: number
          id?: string
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syntax_error_episode_comments_episode_ref_fkey"
            columns: ["episode_ref"]
            isOneToOne: false
            referencedRelation: "syntax_error_episodes"
            referencedColumns: ["ref"]
          },
          {
            foreignKeyName: "syntax_error_episode_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "syntax_error_episode_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      syntax_error_episode_ratings: {
        Row: {
          client_id: string
          created_at: string
          id: number
          rating: number
          ref: number
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: number
          rating: number
          ref: number
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: number
          rating?: number
          ref?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "syntax_error_episode_ratings_ref_fkey"
            columns: ["ref"]
            isOneToOne: false
            referencedRelation: "syntax_error_episodes"
            referencedColumns: ["ref"]
          },
        ]
      }
      syntax_error_episodes: {
        Row: {
          air_date: string | null
          created_at: string
          episode_label: string | null
          featured_games: string[]
          main_mp3_url: string | null
          notes: string | null
          page_url: string
          ref: number
          subtitle: string | null
          transcript: Json | null
          youtube_url: string | null
        }
        Insert: {
          air_date?: string | null
          created_at?: string
          episode_label?: string | null
          featured_games?: string[]
          main_mp3_url?: string | null
          notes?: string | null
          page_url: string
          ref: number
          subtitle?: string | null
          transcript?: Json | null
          youtube_url?: string | null
        }
        Update: {
          air_date?: string | null
          created_at?: string
          episode_label?: string | null
          featured_games?: string[]
          main_mp3_url?: string | null
          notes?: string | null
          page_url?: string
          ref?: number
          subtitle?: string | null
          transcript?: Json | null
          youtube_url?: string | null
        }
        Relationships: []
      }
      syntax_error_playlist_tracks: {
        Row: {
          artist: string | null
          file_url: string | null
          id: number
          ref: number
          sort_order: number
          track_title: string | null
          year: string | null
        }
        Insert: {
          artist?: string | null
          file_url?: string | null
          id?: number
          ref: number
          sort_order: number
          track_title?: string | null
          year?: string | null
        }
        Update: {
          artist?: string | null
          file_url?: string | null
          id?: number
          ref?: number
          sort_order?: number
          track_title?: string | null
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "syntax_error_playlist_tracks_ref_fkey"
            columns: ["ref"]
            isOneToOne: false
            referencedRelation: "syntax_error_episodes"
            referencedColumns: ["ref"]
          },
        ]
      }
    }
    Views: {
      syntax_error_episode_rating_stats: {
        Row: {
          avg_rating: number | null
          rating_count: number | null
          ref: number | null
        }
        Relationships: [
          {
            foreignKeyName: "syntax_error_episode_ratings_ref_fkey"
            columns: ["ref"]
            isOneToOne: false
            referencedRelation: "syntax_error_episodes"
            referencedColumns: ["ref"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
