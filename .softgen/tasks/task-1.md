---
title: Database Schema & Authentication
status: done
priority: urgent
type: feature
tags: [database, auth, backend]
created_by: agent
created_at: 2026-05-03T09:12:35Z
position: 1
---

## Notes
Create complete database schema for AI assistant system: conversations, messages, leads, analytics events, knowledge base, CRM webhooks. Set up admin authentication with role-based access.

## Checklist
- [x] Create conversations table (id, visitor_id, session_id, page_url, started_at, ended_at, status, metadata)
- [x] Create messages table (id, conversation_id, role, content, timestamp)
- [x] Create leads table (id, conversation_id, name, email, phone, company, inquiry_type, lead_score, crm_synced, captured_at)
- [x] Create analytics_events table (id, event_type, visitor_id, session_id, page_url, metadata, timestamp)
- [x] Create knowledge_base table (id, question, answer, category, is_active, created_at, updated_at)
- [x] Create crm_settings table (id, webhook_url, api_key, provider, field_mappings, is_active)
- [x] Add admin_role field to profiles table
- [x] Set up RLS policies for all tables
- [x] Seed initial knowledge base entries
- [x] Create admin user account

## Acceptance
- All tables created with proper relationships
- RLS policies allow admin access, protect user data
- Sample knowledge base entries exist
- Admin can login with default credentials