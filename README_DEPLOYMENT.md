# O.N.E.Tech AI Assistant - Deployment Guide

## Deploying to Production

### Option 1: Vercel (Recommended - 1-Click)

**Why Vercel?**
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Free SSL certificates
- ✅ Serverless functions for API routes
- ✅ Perfect for Next.js apps

**Steps:**
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect your GitHub repository
   - Vercel auto-detects Next.js
   - Click "Deploy"

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add your Supabase keys:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Get Your Widget URL**
   - Vercel gives you: `https://your-project-name.vercel.app`
   - This is your `apiUrl` for embedding

5. **Custom Domain (Optional)**
   - Vercel → Settings → Domains
   - Add your domain: `chat.yourdomain.com`
   - Follow DNS instructions

---

### Option 2: Self-Hosted (VPS/Cloud)

**Requirements:**
- Node.js 18+
- PM2 (process manager)
- Nginx (reverse proxy)
- SSL certificate

**Steps:**

1. **Install Dependencies**
   ```bash
   # On your server
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   npm install -g pm2
   ```

2. **Clone and Build**
   ```bash
   git clone your-repo-url
   cd your-project
   npm install
   npm run build
   ```

3. **Start with PM2**
   ```bash
   pm2 start npm --name "onetech-ai" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name chat.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d chat.yourdomain.com
   ```

---

## Post-Deployment Checklist

### 1. Configure Admin Account
- Go to `https://your-domain.com/admin/register`
- Create your admin account
- Verify email works

### 2. Set Up Widget Settings
- Login: `https://your-domain.com/admin/login`
- Go to Settings
- Configure:
  - Welcome message
  - Brand colors
  - Enable widget
  - Proactive triggers

### 3. Add Knowledge Base
- Go to Knowledge Base
- Add 10-20 FAQs about your business
- Test AI responses

### 4. Configure Prompts
- Go to Prompt Tuning
- Review O.N.E.Tech Revenue Assistant prompt
- Publish if ready, or customize first

### 5. Test Complete Flow
- Visit your main website
- See chat widget appear
- Send test message
- Check response quality
- Submit test lead
- Verify lead appears in dashboard

### 6. Set Up CRM Integration
- Go to Settings → CRM
- Add webhook URL
- Test integration
- Verify leads sync

### 7. Enable Analytics
- Check Dashboard
- Verify event tracking works
- Test on multiple pages

---

## Embedding on Your Website

Once deployed, add this to your website:

```html
<!-- Replace with your actual domain -->
<script>
  window.ONETECH_CONFIG = {
    apiUrl: 'https://your-project-name.vercel.app'
  };
</script>
<script src="https://your-project-name.vercel.app/widget.js"></script>
```

See `EMBED_INSTRUCTIONS.md` for complete integration guide.

---

## Environment Variables

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**Optional:**
```env
# OpenAI API (for AI responses)
OPENAI_API_KEY=sk-xxx

# Custom domain
NEXT_PUBLIC_APP_URL=https://chat.yourdomain.com
```

---

## Monitoring & Maintenance

### View Logs (PM2)
```bash
pm2 logs onetech-ai
pm2 monit
```

### Update App
```bash
git pull origin main
npm install
npm run build
pm2 restart onetech-ai
```

### Database Backups
- Supabase: Automatic daily backups
- Manual: Download from Supabase dashboard

### Performance Monitoring
- Vercel Analytics (automatic)
- Check `/admin/dashboard` for usage stats
- Monitor conversation quality in `/admin/conversations`

---

## Troubleshooting

### Build Fails?
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Widget Not Loading?
- Check CORS settings
- Verify environment variables
- Check browser console for errors

### Database Connection Issues?
- Verify Supabase URL and key
- Check Supabase project status
- Test connection in admin panel

---

## Security Best Practices

✅ **Enable HTTPS** (automatic with Vercel)  
✅ **Environment variables** (never commit secrets)  
✅ **Row Level Security** (already configured in Supabase)  
✅ **Rate limiting** (built into API routes)  
✅ **Input sanitization** (spam detection active)  
✅ **GDPR compliance** (consent banners enabled)

---

## Scaling

**Vercel automatically scales:**
- Serverless functions
- Edge caching
- Global CDN

**Supabase scales:**
- Database connections
- Realtime subscriptions
- File storage

**No manual scaling needed for most use cases!**

---

**Your O.N.E.Tech AI Assistant is ready for production!** 🚀

Next step: Add the embed script to your website and start capturing leads.