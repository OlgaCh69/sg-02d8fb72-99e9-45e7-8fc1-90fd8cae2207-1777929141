---
title: Database Schema & Authentication
status: in_progress
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
- [ ] Create conversations table (id, visitor_id, session_id, page_url, started_at, ended_at, status, metadata)
- [ ] Create messages table (id, conversation_id, role, content, timestamp)
- [ ] Create leads table (id, conversation_id, name, email, phone, company, inquiry_type, lead_score, crm_synced, captured_at)
- [ ] Create analytics_events table (id, event_type, visitor_id, session_id, page_url, metadata, timestamp)
- [ ] Create knowledge_base table (id, question, answer, category, is_active, created_at, updated_at)
- [ ] Create crm_settings table (id, webhook_url, api_key, provider, field_mappings, is_active)
- [ ] Add admin_role field to profiles table
- [ ] Set up RLS policies for all tables
- [ ] Seed initial knowledge base entries
- [ ] Create admin user account

## Acceptance
- All tables created with proper relationships
- RLS policies allow admin access, protect user data
- Sample knowledge base entries exist