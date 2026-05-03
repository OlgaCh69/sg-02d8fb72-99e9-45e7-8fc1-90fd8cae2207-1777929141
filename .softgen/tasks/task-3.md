---
title: Knowledge Base Editor
status: todo
priority: high
type: feature
tags: [frontend, admin, content]
created_by: agent
created_at: 2026-05-03T09:12:35Z
position: 3
---

## Notes
Admin interface to manage FAQ/knowledge base entries that the AI uses to answer questions. CRUD operations on knowledge_base table with category organization and active/inactive toggle.

## Checklist
- [ ] Create knowledge base list page showing all entries
- [ ] Add create/edit knowledge entry form (question, answer, category)
- [ ] Implement search and filter by category
- [ ] Add toggle to activate/deactivate entries
- [ ] Include bulk import from CSV option
- [ ] Show usage statistics (how often each entry was used)

## Acceptance
- Admin can create, edit, delete knowledge base entries
- Changes immediately affect AI responses
- Entries can be organized by category