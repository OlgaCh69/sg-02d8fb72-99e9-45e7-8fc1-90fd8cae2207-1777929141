---
title: Admin Dashboard & Analytics
status: done
priority: high
type: feature
tags: [frontend, admin, analytics]
created_by: agent
created_at: 2026-05-03T09:12:36Z
position: 2
---

## Notes
Build admin dashboard with login, analytics overview, conversation viewing, and lead management. Display key metrics: total visitors, unique visitors, chat opens, conversations, leads captured, conversion rate.

## Checklist
- [x] Create admin login page with Supabase auth
- [x] Create AdminLayout component with navigation
- [x] Build dashboard with analytics cards (visitors, chats, leads, conversion)
- [x] Create conversations page with search and filters
- [x] Create leads page with export CSV functionality
- [x] Add date range filters for analytics
- [x] Display most asked questions
- [x] Show traffic sources and device breakdown

## Acceptance
- Admin can login and access protected routes
- Dashboard displays accurate data from analytics_events table
- Conversations and leads are viewable and searchable
- CSV export works correctly