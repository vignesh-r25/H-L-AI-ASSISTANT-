export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      flashcards: {
        Row: {
          id: string
          material_id: string | null
          user_id: string
          front: string
          back: string
          mastered: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          material_id?: string | null
          user_id: string
          front: string
          back: string
          mastered?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          material_id?: string | null
          user_id?: string
          front?: string
          back?: string
          mastered?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flashcards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      quizzes: {
        Row: {
          id: string
          title: string
          description: string | null
          questions: Json
          teacher_id: string
          is_published: boolean | null
          xp_reward: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          questions: Json
          teacher_id: string
          is_published?: boolean | null
          xp_reward?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          questions?: Json
          teacher_id?: string
          is_published?: boolean | null
          xp_reward?: number | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      },
      study_sessions: {
        Row: {
          duration_minutes: number | null
          ended_at: string | null
          id: string
          material_id: string | null
          started_at: string | null
          user_id: string | null
          xp_earned: number | null
        }
        Insert: {
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          material_id?: string | null
          started_at?: string | null
          user_id?: string | null
          xp_earned?: number | null
        }
        Update: {
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          material_id?: string | null
          started_at?: string | null
          user_id?: string | null
          xp_earned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          id: string
          created_at: string
          title: string
          type: string
          url: string
          size: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          type: string
          url: string
          size?: string | null
          user_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          type?: string
          url?: string
          size?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      gamification_logs: {
        Row: {
          id: string
          user_id: string
          activity_type: string
          xp_earned: number
          multiplier_applied: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity_type: string
          xp_earned: number
          multiplier_applied?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity_type?: string
          xp_earned?: number
          multiplier_applied?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gamification_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          avatar_url: string | null
          total_xp: number | null
          streak_count: number | null
          role: string | null
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          total_xp?: number | null
          streak_count?: number | null
          role?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          avatar_url?: string | null
          total_xp?: number | null
          streak_count?: number | null
          role?: string | null
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: "user" | "assistant"
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role: "user" | "assistant"
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          role?: "user" | "assistant"
          content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "chat_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_usage_logs: {
        Row: {
          id: string
          user_id: string
          feature: string
          prompt: string | null
          response: string | null
          tokens_estimate: number | null
          status: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          feature: string
          prompt?: string | null
          response?: string | null
          tokens_estimate?: number | null
          status?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          feature?: string
          prompt?: string | null
          response?: string | null
          tokens_estimate?: number | null
          status?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string | null
          read: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string | null
          read?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string | null
          read?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_xp: {
        Args: {
          target_id: string
          amount: number
        }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master: { Args: never; Returns: boolean }
      update_streak_and_xp: {
        Args: { p_activity_type: string; p_base_xp: number; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "student" | "master"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
