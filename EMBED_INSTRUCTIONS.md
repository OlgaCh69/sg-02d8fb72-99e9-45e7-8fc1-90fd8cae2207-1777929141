# O.N.E.Tech AI Assistant - Website Integration Guide

## Quick Start (3 Steps)

### Step 1: Get Your Widget URL
Your O.N.E.Tech AI Assistant is hosted at:
```
https://your-project-name.vercel.app
```
*(Replace with your actual Vercel deployment URL)*

### Step 2: Add Script Tag to Your Website
Add this code **before the closing `</body>` tag** on every page where you want the chat widget:

```html
<!-- O.N.E.Tech AI Assistant -->
<script>
  window.ONETECH_CONFIG = {
    apiUrl: 'https://your-project-name.vercel.app'
  };
</script>
<script src="https://your-project-name.vercel.app/widget.js"></script>
```

### Step 3: Test
1. Open your website in a browser
2. You should see the chat button in the bottom-right corner
3. Click it to test the AI assistant

---

## Integration Methods

### Method 1: Direct HTML (Recommended)
Perfect for: Static websites, WordPress, Wix, Squarespace, Webflow

**Add to your HTML:**
```html
<!-- Before closing </body> tag -->
<script>
  window.ONETECH_CONFIG = {
    apiUrl: 'https://your-project-name.vercel.app',
    theme: 'light', // Optional: 'light' or 'dark'
  };
</script>
<script src="https://your-project-name.vercel.app/widget.js"></script>
```

**For WordPress:**
1. Go to Appearance → Theme Editor
2. Edit `footer.php` or use a plugin like "Insert Headers and Footers"
3. Paste the script before `</body>`

**For Wix:**
1. Settings → Custom Code
2. Add to "Body - End"
3. Paste the script

**For Squarespace:**
1. Settings → Advanced → Code Injection
2. Paste in "Footer" section

**For Webflow:**
1. Project Settings → Custom Code
2. Paste in "Footer Code"

---

### Method 2: React/Next.js Integration
Perfect for: React apps, Next.js websites

**Install as component:**
```bash
# Copy ChatWidget component to your project
cp src/components/ChatWidget.tsx your-project/components/
```

**Use in your app:**
```tsx
import { ChatWidget } from '@/components/ChatWidget';

export default function Layout({ children }) {
  return (
    <>
      {children}
      <ChatWidget apiUrl="https://your-project-name.vercel.app" />
    </>
  );
}
```

---

### Method 3: Google Tag Manager
Perfect for: Managing multiple scripts, A/B testing

**Setup:**
1. Go to Google Tag Manager
2. Create New Tag → Custom HTML
3. Paste this code:
```html
<script>
  window.ONETECH_CONFIG = {
    apiUrl: 'https://your-project-name.vercel.app'
  };
</script>
<script src="https://your-project-name.vercel.app/widget.js"></script>
```
4. Trigger: All Pages
5. Save and Publish

---

## Configuration Options

```javascript
window.ONETECH_CONFIG = {
  // Required: Your widget API URL
  apiUrl: 'https://your-project-name.vercel.app',
  
  // Optional: Theme preference
  theme: 'light', // 'light' or 'dark' (default: auto-detect)
  
  // Optional: Position
  position: 'bottom-right', // 'bottom-right' or 'bottom-left'
  
  // Optional: Custom page tracking
  pageTitle: 'Custom Page Title',
  pageUrl: 'https://example.com/custom-url',
};
```

---

## Admin Dashboard Setup

### 1. Customize Your Widget
Go to: `https://your-project-name.vercel.app/admin/settings`

Configure:
- Welcome message
- Primary color (brand color)
- Dark mode support
- Proactive triggers
- Lead capture questions

### 2. Add Your Knowledge Base
Go to: `https://your-project-name.vercel.app/admin/knowledge-base`

Add FAQs about:
- Your services/products
- Pricing
- Contact info
- Common questions

### 3. Configure CRM Integration
Go to: `https://your-project-name.vercel.app/admin/settings` → CRM Tab

Add:
- Webhook URL (where to send leads)
- API key (if required)
- Test the integration

### 4. Set Up Proactive Triggers
Go to: `https://your-project-name.vercel.app/admin/triggers`

Configure:
- Time delays (e.g., show chat after 5 seconds)
- Scroll triggers (e.g., show at 50% scroll)
- Exit intent
- Page-specific messages

---

## Testing Checklist

✅ **Widget Appearance:**
- [ ] Chat button appears in bottom-right corner
- [ ] Button shows your brand color
- [ ] O.N.E.Tech logo visible in chat header

✅ **Functionality:**
- [ ] Click button opens chat window
- [ ] AI responds to messages
- [ ] Lead capture form appears when appropriate
- [ ] "Powered by O.N.E.Tech" footer visible

✅ **Mobile:**
- [ ] Widget works on mobile devices
- [ ] Chat window is responsive
- [ ] Easy to type and send messages

✅ **Analytics:**
- [ ] Conversations appear in `/admin/conversations`
- [ ] Leads captured in `/admin/leads`
- [ ] Analytics tracking in `/admin/dashboard`

---

## Troubleshooting

### Widget Not Appearing?
1. Check browser console for errors (F12 → Console)
2. Verify `apiUrl` is correct
3. Ensure script is before `</body>` tag
4. Check if widget is enabled in `/admin/settings`

### AI Not Responding?
1. Verify knowledge base has entries
2. Check active prompt in `/admin/prompt-tuning`
3. Test with demo conversation in `/admin/testing`

### Leads Not Capturing?
1. Verify lead form settings in `/admin/settings`
2. Check conversation flow in `/admin/conversations`
3. Ensure intent detection is working

### CRM Not Syncing?
1. Test webhook in `/admin/settings`
2. Check CRM sync logs in database
3. Verify webhook URL and API key

---

## Advanced: Custom Domain

### Point Custom Domain to Widget

**Option 1: Subdomain (Recommended)**
1. Create subdomain: `chat.yourdomain.com`
2. Add CNAME record pointing to Vercel URL
3. Update `apiUrl` to `https://chat.yourdomain.com`

**Option 2: Reverse Proxy**
```nginx
# nginx example
location /ai-chat/ {
  proxy_pass https://your-project-name.vercel.app/;
  proxy_set_header Host $host;
}
```

---

## Support

**Documentation:** `https://your-project-name.vercel.app/admin/dashboard`  
**Knowledge Base:** Add entries in `/admin/knowledge-base`  
**Live Chat Testing:** `/admin/testing`  
**Contact:** O.N.E.Tech Automation - https://onetechautomation.com

---

## Examples

### Minimal Setup
```html
<script src="https://your-project-name.vercel.app/widget.js"></script>
```

### Full Configuration
```html
<script>
  window.ONETECH_CONFIG = {
    apiUrl: 'https://your-project-name.vercel.app',
    theme: 'dark',
    position: 'bottom-left',
  };
</script>
<script src="https://your-project-name.vercel.app/widget.js"></script>
```

### WordPress Example
```php
<!-- Add to footer.php or use Insert Headers and Footers plugin -->
<script>
  window.ONETECH_CONFIG = {
    apiUrl: 'https://your-project-name.vercel.app'
  };
</script>
<script src="https://your-project-name.vercel.app/widget.js"></script>
```

---

**Ready to capture more leads? Add the script and start converting visitors!** 🚀