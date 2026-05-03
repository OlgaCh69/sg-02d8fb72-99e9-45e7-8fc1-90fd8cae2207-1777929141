# AI Assistant System

A complete AI-powered chat widget system with lead capture, CRM integration, and analytics dashboard.

## Features

✅ **Embeddable Chat Widget** - Floating chat button with modern chat interface
✅ **AI Assistant** - Answers FAQs using customizable knowledge base
✅ **Lead Capture** - Collects visitor information (name, email, phone, company)
✅ **CRM Integration** - Webhook/API integration to sync leads with your CRM
✅ **Analytics Dashboard** - Track visitors, conversations, leads, and conversion rates
✅ **Admin Panel** - Manage conversations, leads, knowledge base, and settings
✅ **Privacy-Friendly Tracking** - Session tracking using local storage
✅ **Mobile Responsive** - Works perfectly on desktop and mobile

## Quick Start

### 1. Admin Login

**URL:** `/admin/login`

**Default Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change your password immediately after first login!

### 2. Configure Knowledge Base

1. Go to Admin Panel → Knowledge Base
2. Add questions and answers your AI should know
3. Organize by categories
4. Toggle active/inactive as needed

Sample questions to add:
- "What are your business hours?"
- "How much does it cost?"
- "Do you offer support?"
- "Can I get a demo?"

### 3. Configure CRM Integration (Optional)

1. Go to Admin Panel → Settings → CRM Integration
2. Select your CRM provider
3. Enter webhook URL from your CRM
4. Add API key if required
5. Test the connection

Supported CRMs:
- HubSpot
- Salesforce
- Pipedrive
- Custom Webhook

### 4. Customize Widget Settings

1. Go to Admin Panel → Settings → Widget Settings
2. Customize welcome message
3. Change primary color to match your brand
4. Configure lead capture behavior
5. Enable/disable the widget

### 5. Embed on Your Website

Add this script tag before the closing `</body>` tag on your website:

```html
<script src="https://your-domain.com/widget.js"></script>
```

**That's it!** The chat widget will appear on your website.

## How It Works

### For Visitors

1. Click the chat button (bottom-right)
2. Chat opens with welcome message
3. Ask questions → AI responds using knowledge base
4. For complex inquiries → Widget captures lead info
5. Lead data sent to your CRM automatically

### For Admins

1. **Dashboard** - View key metrics (visitors, conversations, leads, conversion rate)
2. **Conversations** - Read all chat transcripts
3. **Leads** - View captured leads, export CSV, sync to CRM
4. **Knowledge Base** - Add/edit FAQs for the AI
5. **Settings** - Configure CRM, customize widget appearance

## Analytics Tracked

- **Visitors:** Total and unique visitors
- **Chat Activity:** Opens, messages sent, conversations started
- **Leads:** Captured leads, conversion rate, lead scores
- **Engagement:** Most asked questions, pages where chats started
- **Traffic:** Referrer, device type, browser, country
- **CRM:** Successful syncs, failed syncs

## AI Assistant Behavior

The AI assistant:
- Matches visitor questions to your knowledge base
- Provides relevant answers from FAQ entries
- Detects purchase intent (pricing, demo, quote keywords)
- Triggers lead capture form when appropriate
- Offers human handoff when unsure
- Includes conversation context in lead data

## Lead Scoring

Leads are automatically scored based on:
- Engagement level (messages sent)
- Intent keywords (pricing, demo, buy)
- Information provided (company name indicates B2B)
- Page visited (pricing page = higher score)

Default score: 75 (adjustable in code)

## CRM Webhook Payload

When a lead is captured, this data is sent to your CRM:

```json
{
  "email": "visitor@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "company": "Acme Inc",
  "inquiry_type": "pricing",
  "lead_score": 85,
  "source": "AI Chat Widget",
  "page_url": "https://yoursite.com/pricing",
  "captured_at": "2026-05-03T10:00:00Z",
  "transcript": "Visitor: How much does it cost?\nAssistant: Our pricing...",
  "visitor_id": "visitor_12345"
}
```

## Database Tables

- **conversations** - All chat sessions
- **messages** - Individual messages in conversations
- **leads** - Captured lead information
- **analytics_events** - Tracked events (page views, chat opens, etc.)
- **knowledge_base** - FAQ questions and answers
- **crm_settings** - CRM integration configuration
- **widget_settings** - Widget appearance and behavior
- **profiles** - Admin users (with admin_role field)

## API Endpoints

- `POST /api/chat` - AI chat responses
- `POST /api/track` - Analytics event tracking
- `POST /api/crm-sync` - Sync lead to CRM

## Customization

### Widget Colors

Edit `widget_settings` table or use Admin Panel:
- Primary color (hex or HSL)
- Position (bottom-right, bottom-left)
- Welcome message

### AI Responses

Edit knowledge base entries in Admin Panel:
- Add new questions/answers
- Organize by category
- Enable/disable specific entries
- AI matches based on keyword similarity

### Lead Capture Triggers

Edit `src/pages/api/chat.ts` to customize when lead form appears:
```typescript
const leadTriggers = ["pricing", "cost", "quote", "demo", "contact", "sales"];
```

## Privacy & GDPR

- Visitor IDs stored in localStorage (no cookies)
- Session IDs in sessionStorage
- No personal data collected until lead form submitted
- Add cookie consent banner to your site if needed
- Data retention: Configurable in Supabase

## Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript
- **UI:** shadcn/ui, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Fonts:** Sora (headings), IBM Plex Sans (body)

## Security

- Row Level Security (RLS) enabled on all tables
- Admin-only access to dashboard
- API key authentication for CRM webhooks
- HTTPS required for production
- Regular password rotation recommended

## Troubleshooting

**Chat widget not showing?**
- Check widget is enabled in Settings
- Verify script tag is present
- Check browser console for errors

**AI not responding correctly?**
- Review knowledge base entries
- Add more question variations
- Check "is_active" flag on entries

**CRM sync failing?**
- Verify webhook URL is correct
- Check API key is valid
- Review CRM provider documentation
- Check Admin Panel → Leads for sync status

**No analytics data?**
- Verify tracking script is loaded
- Check browser localStorage for visitor_id
- Review browser console for API errors

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the admin dashboard for error logs
3. Check Supabase logs for database errors

## License

MIT License - Feel free to customize for your needs!