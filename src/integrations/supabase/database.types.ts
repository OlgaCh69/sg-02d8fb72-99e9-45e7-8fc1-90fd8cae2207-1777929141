 
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
      conversations: {
        Row: {
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
          memory_consent: boolean | null
          metadata: Json | null
          needs_summary: boolean | null
          page_title: string | null
          page_url: string | null
          referrer: string | null
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          session_id: string | null
          started_at: string | null
          status: string | null
          summary_generated_at: string | null
          trigger_type: string | null
          visitor_profile_id: string | null
        }
        Insert: {
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
          memory_consent?: boolean | null
          metadata?: Json | null
          needs_summary?: boolean | null
          page_title?: string | null
          page_url?: string | null
          referrer?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          summary_generated_at?: string | null
          trigger_type?: string | null
          visitor_profile_id?: string | null
        }
        Update: {
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
          memory_consent?: boolean | null
          metadata?: Json | null
          needs_summary?: boolean | null
          page_title?: string | null
          page_url?: string | null
          referrer?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          session_id?: string | null
          started_at?: string | null
          status?: string | null
          summary_generated_at?: string | null
          trigger_type?: string | null
          visitor_profile_id?: string | null
        }
        Relationships: [
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
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          metadata: Json | null
          role: string
          source_type: string | null
          source_url: string | null
          timestamp: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          metadata?: Json | null
          role: string
          source_type?: string | null
          source_url?: string | null
          timestamp?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          metadata?: Json | null
          role?: string
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
          updated_at?: string | null
          website?: string | null
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
      widget_settings: {
        Row: {
          button_text: string | null
          id: string
          is_enabled: boolean | null
          lead_capture_enabled: boolean | null
          position: string | null
          primary_color: string | null
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          button_text?: string | null
          id?: string
          is_enabled?: boolean | null
          lead_capture_enabled?: boolean | null
          position?: string | null
          primary_color?: string | null
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          button_text?: string | null
          id?: string
          is_enabled?: boolean | null
          lead_capture_enabled?: boolean | null
          position?: string | null
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
