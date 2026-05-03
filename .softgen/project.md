# AI Assistant System

## Vision
A production-ready AI chat widget that helps website visitors, captures qualified leads, and syncs with CRM systems. Built for businesses wanting to automate customer inquiries while maintaining personalized engagement.

## Design
**Palette:**
- `--primary: 238 75% 55%` (indigo) - Main brand color, CTAs, active states
- `--accent: 188 94% 48%` (cyan) - Interactive elements, highlights
- `--background: 0 0% 100%` (white) - Clean canvas
- `--foreground: 222.2 84% 4.9%` (near-black) - Primary text
- `--muted: 210 40% 96.1%` (light slate) - Subtle backgrounds
- `--border: 214.3 31.8% 91.4%` (slate gray) - Dividers, cards

**Typography:**
- Headings: Sora (600, 700, 800) - Modern, confident geometric
- Body: IBM Plex Sans (400, 500, 600, 700) - Readable, professional
- tabular-nums for analytics numbers

**Style Direction:**
Clean SaaS aesthetic with professional warmth. Linear-like dashboard precision meets Intercom-style chat approachability. Gradient accents on primary actions, generous whitespace, card-based layouts, subtle elevation.

## Features

**Chat Widget:**
- Floating bottom-right button with brand color
- Smooth slide-in chat window
- AI-powered responses from knowledge base
- Lead capture form triggered by intent
- Mobile responsive, keyboard accessible
- Conversation persistence across sessions

**Admin Dashboard:**
- Analytics overview (visitors, chats, leads, conversion)
- Conversation history with full transcripts
- Lead management with CSV export
- Knowledge base CRUD editor
- CRM webhook configuration
- Widget customization (color, message, position)

**AI Assistant:**
- Keyword-based FAQ matching
- Intent detection for lead capture
- Fallback to human handoff
- Conversation context awareness
- Customizable knowledge base

**CRM Integration:**
- Webhook-based lead sync
- Full conversation transcript included
- Visitor metadata (page, source, device)
- Duplicate detection
- Failed sync retry capability

**Analytics Tracking:**
- Page views, chat opens, messages sent
- Lead capture events, CRM syncs
- Visitor/session identification
- Privacy-friendly (localStorage, no cookies)
- Exportable reports