 
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
      ab_test_assignments: {
        Row: {
          assigned_at: string | null
          conversion_type: string | null
          converted: boolean | null
          converted_at: string | null
          id: string
          variant_id: string | null
          visitor_id: string
        }
        Insert: {
          assigned_at?: string | null
          conversion_type?: string | null
          converted?: boolean | null
          converted_at?: string | null
          id?: string
          variant_id?: string | null
          visitor_id: string
        }
        Update: {
          assigned_at?: string | null
          conversion_type?: string | null
          converted?: boolean | null
          converted_at?: string | null
          id?: string
          variant_id?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ab_test_assignments_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "ab_test_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      ab_test_variants: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          test_name: string
          traffic_percentage: number | null
          variant_config: Json | null
          variant_name: string
          variant_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          test_name: string
          traffic_percentage?: number | null
          variant_config?: Json | null
          variant_name: string
          variant_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          test_name?: string
          traffic_percentage?: number | null
          variant_config?: Json | null
          variant_name?: string
          variant_type?: string | null
        }
        Relationships: []
      }
      ab_tests: {
        Row: {
          conversions_a: number | null
          conversions_b: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          test_type: string
          variant_a_config: Json
          variant_b_config: Json
          visitors_a: number | null
          visitors_b: number | null
        }
        Insert: {
          conversions_a?: number | null
          conversions_b?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          test_type: string
          variant_a_config: Json
          variant_b_config: Json
          visitors_a?: number | null
          visitors_b?: number | null
        }
        Update: {
          conversions_a?: number | null
          conversions_b?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          test_type?: string
          variant_a_config?: Json
          variant_b_config?: Json
          visitors_a?: number | null
          visitors_b?: number | null
        }
        Relationships: []
      }
      abuse_reports: {
        Row: {
          abuse_type: string | null
          action_taken: string | null
          admin_reviewed: boolean | null
          auto_flagged: boolean | null
          conversation_id: string | null
          created_at: string | null
          id: string
          ip_address: string | null
          message_content: string | null
          user_agent: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          abuse_type?: string | null
          action_taken?: string | null
          admin_reviewed?: boolean | null
          auto_flagged?: boolean | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          message_content?: string | null
          user_agent?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          abuse_type?: string | null
          action_taken?: string | null
          admin_reviewed?: boolean | null
          auto_flagged?: boolean | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          message_content?: string | null
          user_agent?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "abuse_reports_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "abuse_reports_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          browser: string | null
          conversation_id: string | null
          country: string | null
          device: string | null
          event_name: string
          id: string
          metadata: Json | null
          page_url: string | null
          referrer: string | null
          session_id: string | null
          timestamp: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          browser?: string | null
          conversation_id?: string | null
          country?: string | null
          device?: string | null
          event_name: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          browser?: string | null
          conversation_id?: string | null
          country?: string | null
          device?: string | null
          event_name?: string
          id?: string
          metadata?: Json | null
          page_url?: string | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      answer_feedback: {
        Row: {
          admin_id: string | null
          admin_notes: string | null
          created_at: string | null
          feedback_type: string | null
          id: string
          message_id: string | null
        }
        Insert: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          message_id?: string | null
        }
        Update: {
          admin_id?: string | null
          admin_notes?: string | null
          created_at?: string | null
          feedback_type?: string | null
          id?: string
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answer_feedback_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answer_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_type: string | null
          calendar_event_id: string | null
          conversation_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          meeting_url: string | null
          notes: string | null
          scheduled_at: string | null
          status: string | null
          updated_at: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          appointment_type?: string | null
          calendar_event_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          appointment_type?: string | null
          calendar_event_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_url?: string | null
          notes?: string | null
          scheduled_at?: string | null
          status?: string | null
          updated_at?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action_type: string | null
          admin_id: string | null
          changes: Json | null
          created_at: string | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
        }
        Insert: {
          action_type?: string | null
          admin_id?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string | null
          admin_id?: string | null
          changes?: Json | null
          created_at?: string | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocked_ips: {
        Row: {
          blocked_at: string | null
          expires_at: string | null
          id: string
          ip_address: string
          reason: string | null
        }
        Insert: {
          blocked_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address: string
          reason?: string | null
        }
        Update: {
          blocked_at?: string | null
          expires_at?: string | null
          id?: string
          ip_address?: string
          reason?: string | null
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          close_time: string | null
          created_at: string | null
          day_of_week: number | null
          id: string
          is_working_day: boolean | null
          open_time: string | null
          timezone: string | null
        }
        Insert: {
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          is_working_day?: boolean | null
          open_time?: string | null
          timezone?: string | null
        }
        Update: {
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number | null
          id?: string
          is_working_day?: boolean | null
          open_time?: string | null
          timezone?: string | null
        }
        Relationships: []
      }
      channel_configs: {
        Row: {
          access_token: string | null
          app_secret: string | null
          channel_type: string
          config: Json | null
          created_at: string | null
          id: string
          is_enabled: boolean | null
          page_id: string | null
          phone_number_id: string | null
          updated_at: string | null
          verify_token: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          app_secret?: string | null
          channel_type: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          page_id?: string | null
          phone_number_id?: string | null
          updated_at?: string | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          app_secret?: string | null
          channel_type?: string
          config?: Json | null
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          page_id?: string | null
          phone_number_id?: string | null
          updated_at?: string | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      channel_settings: {
        Row: {
          access_token: string | null
          app_secret: string | null
          business_account_id: string | null
          channel: string
          created_at: string | null
          id: string
          is_enabled: boolean | null
          phone_number_id: string | null
          settings: Json | null
          updated_at: string | null
          verify_token: string | null
          webhook_url: string | null
        }
        Insert: {
          access_token?: string | null
          app_secret?: string | null
          business_account_id?: string | null
          channel: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          phone_number_id?: string | null
          settings?: Json | null
          updated_at?: string | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Update: {
          access_token?: string | null
          app_secret?: string | null
          business_account_id?: string | null
          channel?: string
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          phone_number_id?: string | null
          settings?: Json | null
          updated_at?: string | null
          verify_token?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      conversation_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          assigned_to: string | null
          conversation_id: string | null
          id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          conversation_id?: string | null
          id?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          assigned_to?: string | null
          conversation_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_assignments_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_notes: {
        Row: {
          admin_id: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          note_text: string | null
        }
        Insert: {
          admin_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          note_text?: string | null
        }
        Update: {
          admin_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          note_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_notes_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_notes_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_summaries: {
        Row: {
          budget: string | null
          conversation_id: string | null
          created_at: string | null
          extracted_data: Json | null
          id: string
          intent: string | null
          next_step: string | null
          objections: string | null
          service_interest: string | null
          summary: string | null
          timeline: string | null
          updated_at: string | null
          urgency: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          budget?: string | null
          conversation_id?: string | null
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          intent?: string | null
          next_step?: string | null
          objections?: string | null
          service_interest?: string | null
          summary?: string | null
          timeline?: string | null
          updated_at?: string | null
          urgency?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          budget?: string | null
          conversation_id?: string | null
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          intent?: string | null
          next_step?: string | null
          objections?: string | null
          service_interest?: string | null
          summary?: string | null
          timeline?: string | null
          updated_at?: string | null
          urgency?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_summaries_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_tags: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          id: string
          tag_name: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          tag_name?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          tag_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_tags_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assigned_to: string | null
          browser: string | null
          channel: string | null
          country: string | null
          created_at: string | null
          crm_sync_error: string | null
          crm_sync_status: string | null
          crm_synced: boolean | null
          device: string | null
          ended_at: string | null
          handover_reason: string | null
          handover_requested: boolean | null
          handover_requested_at: string | null
          human_handover_at: string | null
          human_handover_requested: boolean | null
          id: string
          inbox_status: string | null
          is_live_takeover: boolean | null
          memory_consent: boolean | null
          metadata: Json | null
          needs_summary: boolean | null
          page_title: string | null
          page_url: string | null
          priority: string | null
          referrer: string | null
          released_at: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          session_id: string | null
          started_at: string | null
          status: string | null
          summary_generated_at: string | null
          taken_over_at: string | null
          taken_over_by: string | null
          trigger_type: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          browser?: string | null
          channel?: string | null
          country?: string | null
          created_at?: string | null
          crm_sync_error?: string | null
          crm_sync_status?: string | null
          crm_synced?: boolean | null
          device?: string | null
          ended_at?: string | null
          handover_reason?: string | null
          handover_requested?: boolean | null
          handover_requested_at?: string | null
          human_handover_at?: string | null
          human_handover_requested?: boolean | null
          id?: string
          inbox_status?: string | null
          is_live_takeover?: boolean | null
          memory_consent?: boolean | null
          metadata?: Json | null
          needs_summary?: boolean | null
          page_title?: string | null
          page_url?: string | null
          priority?: string | null
          referrer?: string | null
          released_at?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          summary_generated_at?: string | null
          taken_over_at?: string | null
          taken_over_by?: string | null
          trigger_type?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          browser?: string | null
          channel?: string | null
          country?: string | null
          created_at?: string | null
          crm_sync_error?: string | null
          crm_sync_status?: string | null
          crm_synced?: boolean | null
          device?: string | null
          ended_at?: string | null
          handover_reason?: string | null
          handover_requested?: boolean | null
          handover_requested_at?: string | null
          human_handover_at?: string | null
          human_handover_requested?: boolean | null
          id?: string
          inbox_status?: string | null
          is_live_takeover?: boolean | null
          memory_consent?: boolean | null
          metadata?: Json | null
          needs_summary?: boolean | null
          page_title?: string | null
          page_url?: string | null
          priority?: string | null
          referrer?: string | null
          released_at?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          summary_generated_at?: string | null
          taken_over_at?: string | null
          taken_over_by?: string | null
          trigger_type?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "visitor_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_taken_over_by_fkey"
            columns: ["taken_over_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crawl_logs: {
        Row: {
          completed_at: string | null
          crawl_id: string
          created_at: string | null
          errors: string[] | null
          id: string
          pages_crawled: number | null
          pages_found: number | null
          pages_new: number | null
          pages_updated: number | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          crawl_id: string
          created_at?: string | null
          errors?: string[] | null
          id?: string
          pages_crawled?: number | null
          pages_found?: number | null
          pages_new?: number | null
          pages_updated?: number | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          crawl_id?: string
          created_at?: string | null
          errors?: string[] | null
          id?: string
          pages_crawled?: number | null
          pages_found?: number | null
          pages_new?: number | null
          pages_updated?: number | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      crawl_settings: {
        Row: {
          crawl_frequency: string | null
          created_at: string | null
          excluded_patterns: string[] | null
          id: string
          is_active: boolean | null
          last_crawl_completed: string | null
          last_crawl_started: string | null
          max_pages: number | null
          updated_at: string | null
          website_url: string
        }
        Insert: {
          crawl_frequency?: string | null
          created_at?: string | null
          excluded_patterns?: string[] | null
          id?: string
          is_active?: boolean | null
          last_crawl_completed?: string | null
          last_crawl_started?: string | null
          max_pages?: number | null
          updated_at?: string | null
          website_url: string
        }
        Update: {
          crawl_frequency?: string | null
          created_at?: string | null
          excluded_patterns?: string[] | null
          id?: string
          is_active?: boolean | null
          last_crawl_completed?: string | null
          last_crawl_started?: string | null
          max_pages?: number | null
          updated_at?: string | null
          website_url?: string
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
      crm_sync_logs: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          payload: Json | null
          status: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          payload?: Json | null
          status?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_sync_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_sync_logs_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          last_processed: string | null
          metadata: Json | null
          page_count: number | null
          status: string | null
          title: string
          uploaded_at: string | null
          uploaded_by: string | null
          word_count: number | null
        }
        Insert: {
          content?: string | null
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          last_processed?: string | null
          metadata?: Json | null
          page_count?: number | null
          status?: string | null
          title: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          word_count?: number | null
        }
        Update: {
          content?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          last_processed?: string | null
          metadata?: Json | null
          page_count?: number | null
          status?: string | null
          title?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          error_message: string | null
          follow_up_type: string | null
          id: string
          message: string | null
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          follow_up_type?: string | null
          id?: string
          message?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          follow_up_type?: string | null
          id?: string
          message?: string | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hot_lead_reminders: {
        Row: {
          created_at: string | null
          due_at: string | null
          id: string
          reminder_type: string | null
          status: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          due_at?: string | null
          id?: string
          reminder_type?: string | null
          status?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          due_at?: string | null
          id?: string
          reminder_type?: string | null
          status?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hot_lead_reminders_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      knowledge_cache: {
        Row: {
          cached_results: Json | null
          created_at: string | null
          expires_at: string | null
          hit_count: number | null
          id: string
          last_hit_at: string | null
          query_hash: string
          query_text: string
        }
        Insert: {
          cached_results?: Json | null
          created_at?: string | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          last_hit_at?: string | null
          query_hash: string
          query_text: string
        }
        Update: {
          cached_results?: Json | null
          created_at?: string | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          last_hit_at?: string | null
          query_hash?: string
          query_text?: string
        }
        Relationships: []
      }
      knowledge_sources: {
        Row: {
          approved: boolean | null
          content: string | null
          content_hash: string | null
          created_at: string | null
          id: string
          last_crawled: string | null
          last_crawled_at: string | null
          meta_description: string | null
          source_type: string | null
          title: string | null
          updated_at: string | null
          url: string
          word_count: number | null
        }
        Insert: {
          approved?: boolean | null
          content?: string | null
          content_hash?: string | null
          created_at?: string | null
          id?: string
          last_crawled?: string | null
          last_crawled_at?: string | null
          meta_description?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
          url: string
          word_count?: number | null
        }
        Update: {
          approved?: boolean | null
          content?: string | null
          content_hash?: string | null
          created_at?: string | null
          id?: string
          last_crawled?: string | null
          last_crawled_at?: string | null
          meta_description?: string | null
          source_type?: string | null
          title?: string | null
          updated_at?: string | null
          url?: string
          word_count?: number | null
        }
        Relationships: []
      }
      lead_score_history: {
        Row: {
          created_at: string | null
          id: string
          new_score: number | null
          new_status: string | null
          old_score: number | null
          old_status: string | null
          reason: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          new_score?: number | null
          new_status?: string | null
          old_score?: number | null
          old_status?: string | null
          reason?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          new_score?: number | null
          new_status?: string | null
          old_score?: number | null
          old_status?: string | null
          reason?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_score_history_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget_range: string | null
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
          service_interest: string | null
          timeline: string | null
          urgency: string | null
          visitor_id: string | null
        }
        Insert: {
          budget_range?: string | null
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
          service_interest?: string | null
          timeline?: string | null
          urgency?: string | null
          visitor_id?: string | null
        }
        Update: {
          budget_range?: string | null
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
          service_interest?: string | null
          timeline?: string | null
          urgency?: string | null
          visitor_id?: string | null
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
      live_takeover_logs: {
        Row: {
          action: string
          admin_id: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          message_content: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_content?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "live_takeover_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_takeover_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      message_confidence: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          id: string
          knowledge_match_count: number | null
          message_id: string | null
          source_type: string | null
          source_url: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          knowledge_match_count?: number | null
          message_id?: string | null
          source_type?: string | null
          source_url?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          knowledge_match_count?: number | null
          message_id?: string | null
          source_type?: string | null
          source_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_confidence_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          message_type: string | null
          metadata: Json | null
          role: string
          sent_by_admin: string | null
          source_type: string | null
          source_url: string | null
          timestamp: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role: string
          sent_by_admin?: string | null
          source_type?: string | null
          source_url?: string | null
          timestamp?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          message_type?: string | null
          metadata?: Json | null
          role?: string
          sent_by_admin?: string | null
          source_type?: string | null
          source_url?: string | null
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
          {
            foreignKeyName: "messages_sent_by_admin_fkey"
            columns: ["sent_by_admin"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          created_at: string | null
          delivery_config: Json | null
          delivery_method: string | null
          enabled: boolean | null
          id: string
          notification_type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_config?: Json | null
          delivery_method?: string | null
          enabled?: boolean | null
          id?: string
          notification_type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_config?: Json | null
          delivery_method?: string | null
          enabled?: boolean | null
          id?: string
          notification_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          message: string | null
          metadata: Json | null
          notification_type: string | null
          sent_at: string | null
          status: string | null
          title: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          notification_type?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          message?: string | null
          metadata?: Json | null
          notification_type?: string | null
          sent_at?: string | null
          status?: string | null
          title?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_rules: {
        Row: {
          created_at: string | null
          custom_tone: string | null
          custom_welcome_message: string | null
          enabled: boolean | null
          id: string
          page_pattern: string
          priority_questions: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_tone?: string | null
          custom_welcome_message?: string | null
          enabled?: boolean | null
          id?: string
          page_pattern: string
          priority_questions?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_tone?: string | null
          custom_welcome_message?: string | null
          enabled?: boolean | null
          id?: string
          page_pattern?: string
          priority_questions?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      playbook_executions: {
        Row: {
          completed_at: string | null
          conversation_id: string | null
          current_step: number | null
          id: string
          playbook_id: string | null
          started_at: string | null
          status: string | null
          step_data: Json | null
        }
        Insert: {
          completed_at?: string | null
          conversation_id?: string | null
          current_step?: number | null
          id?: string
          playbook_id?: string | null
          started_at?: string | null
          status?: string | null
          step_data?: Json | null
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string | null
          current_step?: number | null
          id?: string
          playbook_id?: string | null
          started_at?: string | null
          status?: string | null
          step_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "playbook_executions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playbook_executions_playbook_id_fkey"
            columns: ["playbook_id"]
            isOneToOne: false
            referencedRelation: "playbooks"
            referencedColumns: ["id"]
          },
        ]
      }
      playbooks: {
        Row: {
          created_at: string | null
          description: string | null
          flow_steps: Json | null
          id: string
          intent_trigger: string | null
          is_active: boolean | null
          name: string
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          flow_steps?: Json | null
          id?: string
          intent_trigger?: string | null
          is_active?: boolean | null
          name: string
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          flow_steps?: Json | null
          id?: string
          intent_trigger?: string | null
          is_active?: boolean | null
          name?: string
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      proactive_triggers: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          message: string
          name: string
          trigger_type: string
          trigger_value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          name: string
          trigger_type: string
          trigger_value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          name?: string
          trigger_type?: string
          trigger_value?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          features: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metadata: Json | null
          name: string
          pricing: string | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          pricing?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          features?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          pricing?: string | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          admin_role: string | null
          avatar_url: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          industry: string | null
          phone: string | null
          preferred_theme: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          admin_role?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          industry?: string | null
          phone?: string | null
          preferred_theme?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          admin_role?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          industry?: string | null
          phone?: string | null
          preferred_theme?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      prompt_ab_tests: {
        Row: {
          created_at: string | null
          description: string | null
          ended_at: string | null
          id: string
          started_at: string | null
          status: string | null
          test_name: string
          traffic_split: number | null
          version_a_id: string | null
          version_b_id: string | null
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          test_name: string
          traffic_split?: number | null
          version_a_id?: string | null
          version_b_id?: string | null
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          ended_at?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          test_name?: string
          traffic_split?: number | null
          version_a_id?: string | null
          version_b_id?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_ab_tests_version_a_id_fkey"
            columns: ["version_a_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_ab_tests_version_b_id_fkey"
            columns: ["version_b_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_ab_tests_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_performance: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          handoff_requested: boolean | null
          id: string
          lead_conversion: boolean | null
          response_relevance: number | null
          response_time: number | null
          tokens_used: number | null
          user_satisfaction: number | null
          version_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          handoff_requested?: boolean | null
          id?: string
          lead_conversion?: boolean | null
          response_relevance?: number | null
          response_time?: number | null
          tokens_used?: number | null
          user_satisfaction?: number | null
          version_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          handoff_requested?: boolean | null
          id?: string
          lead_conversion?: boolean | null
          response_relevance?: number | null
          response_time?: number | null
          tokens_used?: number | null
          user_satisfaction?: number | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_performance_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_performance_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_test_cases: {
        Row: {
          context_variables: Json | null
          created_at: string | null
          expected_output: string | null
          id: string
          template_id: string | null
          test_input: string
          test_name: string
        }
        Insert: {
          context_variables?: Json | null
          created_at?: string | null
          expected_output?: string | null
          id?: string
          template_id?: string | null
          test_input: string
          test_name: string
        }
        Update: {
          context_variables?: Json | null
          created_at?: string | null
          expected_output?: string | null
          id?: string
          template_id?: string | null
          test_input?: string
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_test_cases_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_test_results: {
        Row: {
          actual_output: string | null
          error_message: string | null
          id: string
          passed: boolean | null
          response_time: number | null
          test_case_id: string | null
          tested_at: string | null
          tokens_used: number | null
          version_id: string | null
        }
        Insert: {
          actual_output?: string | null
          error_message?: string | null
          id?: string
          passed?: boolean | null
          response_time?: number | null
          test_case_id?: string | null
          tested_at?: string | null
          tokens_used?: number | null
          version_id?: string | null
        }
        Update: {
          actual_output?: string | null
          error_message?: string | null
          id?: string
          passed?: boolean | null
          response_time?: number | null
          test_case_id?: string | null
          tested_at?: string | null
          tokens_used?: number | null
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prompt_test_results_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "prompt_test_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_test_results_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "prompt_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_versions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_published: boolean | null
          max_tokens: number | null
          prompt_content: string
          system_instructions: string | null
          temperature: number | null
          template_id: string | null
          variables: Json | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          max_tokens?: number | null
          prompt_content: string
          system_instructions?: string | null
          temperature?: number | null
          template_id?: string | null
          variables?: Json | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_published?: boolean | null
          max_tokens?: number | null
          prompt_content?: string
          system_instructions?: string | null
          temperature?: number | null
          template_id?: string | null
          variables?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          endpoint: string
          id: string
          request_count: number | null
          visitor_id: string
          window_start: string | null
        }
        Insert: {
          endpoint: string
          id?: string
          request_count?: number | null
          visitor_id: string
          window_start?: string | null
        }
        Update: {
          endpoint?: string
          id?: string
          request_count?: number | null
          visitor_id?: string
          window_start?: string | null
        }
        Relationships: []
      }
      social_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          metadata: Json | null
          name: string | null
          phone: string | null
          platform: string
          platform_user_id: string
          profile_pic_url: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          platform: string
          platform_user_id: string
          profile_pic_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          metadata?: Json | null
          name?: string | null
          phone?: string | null
          platform?: string
          platform_user_id?: string
          profile_pic_url?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      test_sessions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          session_name: string | null
          test_data: Json | null
          test_mode: boolean | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          session_name?: string | null
          test_data?: Json | null
          test_mode?: boolean | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          session_name?: string | null
          test_data?: Json | null
          test_mode?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "test_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trigger_settings: {
        Row: {
          created_at: string | null
          enabled: boolean | null
          id: string
          page_match_pattern: string | null
          trigger_type: string
          trigger_value: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          page_match_pattern?: string | null
          trigger_type: string
          trigger_value?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          page_match_pattern?: string | null
          trigger_type?: string
          trigger_value?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      uploaded_files: {
        Row: {
          conversation_id: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          storage_path: string | null
          uploaded_at: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          conversation_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          storage_path?: string | null
          uploaded_at?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          conversation_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          storage_path?: string | null
          uploaded_at?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_files_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_attributes: {
        Row: {
          attribute_key: string
          attribute_value: string | null
          created_at: string | null
          id: string
          source: string | null
          updated_at: string | null
          user_profile_id: string | null
        }
        Insert: {
          attribute_key: string
          attribute_value?: string | null
          created_at?: string | null
          id?: string
          source?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Update: {
          attribute_key?: string
          attribute_value?: string | null
          created_at?: string | null
          id?: string
          source?: string | null
          updated_at?: string | null
          user_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_attributes_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          first_seen_at: string | null
          full_name: string | null
          id: string
          last_seen_at: string | null
          lead_score: number | null
          lead_status: string | null
          notes: string | null
          phone: string | null
          preferences: Json | null
          tags: string[] | null
          total_conversations: number | null
          updated_at: string | null
          visitor_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          first_seen_at?: string | null
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          lead_score?: number | null
          lead_status?: string | null
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          tags?: string[] | null
          total_conversations?: number | null
          updated_at?: string | null
          visitor_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          first_seen_at?: string | null
          full_name?: string | null
          id?: string
          last_seen_at?: string | null
          lead_score?: number | null
          lead_status?: string | null
          notes?: string | null
          phone?: string | null
          preferences?: Json | null
          tags?: string[] | null
          total_conversations?: number | null
          updated_at?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      visitor_memory: {
        Row: {
          confidence: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          key: string
          memory_type: string
          source_conversation_id: string | null
          updated_at: string | null
          value: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          memory_type: string
          source_conversation_id?: string | null
          updated_at?: string | null
          value?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          confidence?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          memory_type?: string
          source_conversation_id?: string | null
          updated_at?: string | null
          value?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_memory_source_conversation_id_fkey"
            columns: ["source_conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visitor_memory_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visitor_profiles: {
        Row: {
          company: string | null
          consent_analytics: boolean | null
          consent_memory: boolean | null
          created_at: string | null
          email: string | null
          first_seen_at: string | null
          id: string
          last_seen_at: string | null
          lead_score: number | null
          lead_status: string | null
          name: string | null
          phone: string | null
          preferred_language: string | null
          source: string | null
          updated_at: string | null
          visitor_id: string
        }
        Insert: {
          company?: string | null
          consent_analytics?: boolean | null
          consent_memory?: boolean | null
          created_at?: string | null
          email?: string | null
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          lead_score?: number | null
          lead_status?: string | null
          name?: string | null
          phone?: string | null
          preferred_language?: string | null
          source?: string | null
          updated_at?: string | null
          visitor_id: string
        }
        Update: {
          company?: string | null
          consent_analytics?: boolean | null
          consent_memory?: boolean | null
          created_at?: string | null
          email?: string | null
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          lead_score?: number | null
          lead_status?: string | null
          name?: string | null
          phone?: string | null
          preferred_language?: string | null
          source?: string | null
          updated_at?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      visitor_sessions: {
        Row: {
          browser: string | null
          country: string | null
          device: string | null
          ended_at: string | null
          id: string
          page_title: string | null
          page_url: string | null
          pages_visited: Json | null
          referrer: string | null
          session_id: string
          started_at: string | null
          time_on_site: number | null
          trigger_type: string | null
          visitor_profile_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          device?: string | null
          ended_at?: string | null
          id?: string
          page_title?: string | null
          page_url?: string | null
          pages_visited?: Json | null
          referrer?: string | null
          session_id: string
          started_at?: string | null
          time_on_site?: number | null
          trigger_type?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          device?: string | null
          ended_at?: string | null
          id?: string
          page_title?: string | null
          page_url?: string | null
          pages_visited?: Json | null
          referrer?: string | null
          session_id?: string
          started_at?: string | null
          time_on_site?: number | null
          trigger_type?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visitor_sessions_visitor_profile_id_fkey"
            columns: ["visitor_profile_id"]
            isOneToOne: false
            referencedRelation: "visitor_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reports: {
        Row: {
          best_converting_pages: Json | null
          created_at: string | null
          failed_crm_syncs: number | null
          hot_leads: number | null
          id: string
          sent_at: string | null
          top_questions: Json | null
          total_bookings: number | null
          total_chats: number | null
          total_leads: number | null
          total_visitors: number | null
          week_end: string
          week_start: string
        }
        Insert: {
          best_converting_pages?: Json | null
          created_at?: string | null
          failed_crm_syncs?: number | null
          hot_leads?: number | null
          id?: string
          sent_at?: string | null
          top_questions?: Json | null
          total_bookings?: number | null
          total_chats?: number | null
          total_leads?: number | null
          total_visitors?: number | null
          week_end: string
          week_start: string
        }
        Update: {
          best_converting_pages?: Json | null
          created_at?: string | null
          failed_crm_syncs?: number | null
          hot_leads?: number | null
          id?: string
          sent_at?: string | null
          top_questions?: Json | null
          total_bookings?: number | null
          total_chats?: number | null
          total_leads?: number | null
          total_visitors?: number | null
          week_end?: string
          week_start?: string
        }
        Relationships: []
      }
      widget_performance: {
        Row: {
          cache_ttl_hours: number | null
          created_at: string | null
          id: string
          lazy_load_enabled: boolean | null
          max_cache_size_mb: number | null
        }
        Insert: {
          cache_ttl_hours?: number | null
          created_at?: string | null
          id?: string
          lazy_load_enabled?: boolean | null
          max_cache_size_mb?: number | null
        }
        Update: {
          cache_ttl_hours?: number | null
          created_at?: string | null
          id?: string
          lazy_load_enabled?: boolean | null
          max_cache_size_mb?: number | null
        }
        Relationships: []
      }
      widget_settings: {
        Row: {
          allow_file_uploads: boolean | null
          button_text: string | null
          dark_mode_primary_color: string | null
          id: string
          is_enabled: boolean | null
          lead_capture_enabled: boolean | null
          position: string | null
          primary_color: string | null
          support_dark_mode: boolean | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          allow_file_uploads?: boolean | null
          button_text?: string | null
          dark_mode_primary_color?: string | null
          id?: string
          is_enabled?: boolean | null
          lead_capture_enabled?: boolean | null
          position?: string | null
          primary_color?: string | null
          support_dark_mode?: boolean | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          allow_file_uploads?: boolean | null
          button_text?: string | null
          dark_mode_primary_color?: string | null
          id?: string
          is_enabled?: boolean | null
          lead_capture_enabled?: boolean | null
          position?: string | null
          primary_color?: string | null
          support_dark_mode?: boolean | null
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
      increment_lead_score: {
        Args: { profile_id: string; score_change: number }
        Returns: undefined
      }
      increment_user_conversations: {
        Args: { profile_id: string }
        Returns: undefined
      }
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
