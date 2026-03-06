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
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          description: string | null
          icon: string
          id: string
          name: string
          threshold_percent: number | null
        }
        Insert: {
          description?: string | null
          icon: string
          id?: string
          name: string
          threshold_percent?: number | null
        }
        Update: {
          description?: string | null
          icon?: string
          id?: string
          name?: string
          threshold_percent?: number | null
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          project_id: string | null
          recorded_by: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string
          project_id?: string | null
          recorded_by?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          project_id?: string | null
          recorded_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          leader_id: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          leader_id?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          leader_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_groups_leader"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          annual_goal: number
          category: Database["public"]["Enums"]["member_category"]
          created_at: string
          full_name: string
          group_id: string | null
          id: string
          last_contribution_date: string | null
          level: number
          phone: string | null
          streak: number
          total_contributed: number
          updated_at: string
          xp: number
        }
        Insert: {
          annual_goal?: number
          category?: Database["public"]["Enums"]["member_category"]
          created_at?: string
          full_name: string
          group_id?: string | null
          id: string
          last_contribution_date?: string | null
          level?: number
          phone?: string | null
          streak?: number
          total_contributed?: number
          updated_at?: string
          xp?: number
        }
        Update: {
          annual_goal?: number
          category?: Database["public"]["Enums"]["member_category"]
          created_at?: string
          full_name?: string
          group_id?: string | null
          id?: string
          last_contribution_date?: string | null
          level?: number
          phone?: string | null
          streak?: number
          total_contributed?: number
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          collected_amount: number
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["project_status"]
          target_amount: number
          updated_at: string
        }
        Insert: {
          collected_amount?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          target_amount?: number
          updated_at?: string
        }
        Update: {
          collected_amount?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          target_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_dashboard: { Args: Record<string, never>; Returns: Json }
      get_user_group_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "finance_admin" | "group_leader" | "member"
      member_category: "visitor" | "student" | "church_member" | "regular"
      project_status: "ongoing" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Tables<T extends keyof Database["public"]["Tables"] = never> = T extends keyof Database["public"]["Tables"] 
  ? Database["public"]["Tables"][T]["Row"] 
  : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TablesInsert<T extends keyof Database["public"]["Tables"] = never> = T extends keyof Database["public"]["Tables"] 
  ? Database["public"]["Tables"][T]["Insert"] 
  : never;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type TablesUpdate<T extends keyof Database["public"]["Tables"] = never> = T extends keyof Database["public"]["Tables"] 
  ? Database["public"]["Tables"][T]["Update"] 
  : never;

export type Enums<T extends keyof Database["public"]["Enums"] = never> = T extends keyof Database["public"]["Enums"] 
  ? Database["public"]["Enums"][T] 
  : never;

