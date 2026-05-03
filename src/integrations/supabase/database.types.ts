/* eslint-disable @typescript-eslint/no-empty-object-type */
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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          browser: string | null
          country: string | null
          device: string | null
          event_type: string
          id: string
          metadata: Json | null
          page_url: string | null
          referrer: string | null
          session_id: string
          timestamp: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          country?: string | null
          device?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id: string
          timestamp?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          country?: string | null
          device?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          timestamp?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string | null
          device: string | null
          ended_at: string | null
          id: string
          metadata: Json | null
          page_url: string | null
          referrer: string | null
          session_id: string
          started_at: string | null
          status: string | null
          visitor_id: string
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id: string
          started_at?: string | null
          status?: string | null
          visitor_id: string
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          device?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          started_at?: string | null
          status?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      crm_settings: {
        Row: {
          api_key: string | null
          created_at: string | null
          field_mappings: Json | null
          headers: Json | null
          id: string
          is_active: boolean | null
          provider: string | null
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          api_key?: string | null
          created_at?: string | null
          field_mappings?: Json | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          provider?: string | null
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          api_key?: string | null
          created_at?: string | null
          field_mappings?: Json | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          provider?: string | null
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          answer: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          captured_at: string | null
          company: string | null
          conversation_id: string | null
          crm_sync_error: string | null
          crm_synced: boolean | null
          email: string
          id: string
          inquiry_type: string | null
          lead_score: number | null
          metadata: Json | null
          name: string | null
          phone: string | null
        }
        Insert: {
          captured_at?: string | null
          company?: string | null
          conversation_id?: string | null
          crm_sync_error?: string | null
          crm_synced?: boolean | null
          email: string
          id?: string
          inquiry_type?: string | null
          lead_score?: number | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
        }
        Update: {
          captured_at?: string | null
          company?: string | null
          conversation_id?: string | null
          crm_sync_error?: string | null
          crm_synced?: boolean | null
          email?: string
          id?: string
          inquiry_type?: string | null
          lead_score?: number | null
          metadata?: Json | null
          name?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          role: string
          timestamp: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          role: string
          timestamp?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          role?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          admin_role: string | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          admin_role?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      widget_settings: {
        Row: {
          button_text: string | null
          id: string
          lead_capture_enabled: boolean | null
          primary_color: string | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          button_text?: string | null
          id?: string
          lead_capture_enabled?: boolean | null
          primary_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          button_text?: string | null
          id?: string
          lead_capture_enabled?: boolean | null
          primary_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: []
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
