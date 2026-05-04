# O.N.E.Tech AI Assistant - Quick Start Guide

## ✅ Your Widget is Ready!

The widget.js file is already in your `/public` folder and ready to use.

---

## 🚀 How to Add to Any Website (3 Steps)

### Step 1: Deploy This Project

**Option A - Vercel (Recommended, 2 minutes):**
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Click "Deploy"
6. Copy your URL: `https://your-project.vercel.app`

**Option B - Other Hosting:**
- Deploy to any Next.js hosting (Netlify, Railway, etc.)
- Get your live URL

---

### Step 2: Add Script to Your Website

Copy this code and paste it **before the closing `</body>` tag** on your website:

```html
<!-- O.N.E.Tech AI Assistant -->
<script>
  window.ONETECH_CONFIG = {
    apiUrl: 'https://your-project.vercel.app'  // ← Replace with YOUR URL
  };
</script>
<script src="https://your-project.vercel.app/widget.js"></script>
```

**Replace `your-project.vercel.app` with your actual deployment URL!**

---

### Step 3: Test It

1. Open your website
2. Look bottom-right corner
3. See the chat button? ✅ It works!
4. Click it and test a message

---

## 📍 Where to Add the Script

### WordPress
- **Appearance → Theme Editor → footer.php**
- Paste before `</body>`
- Or use plugin: "Insert Headers and Footers"

### Wix
- **Settings → Custom Code**
- Add Custom Code → Body - End
- Paste script

### Squarespace
- **Settings → Advanced → Code Injection**
- Footer section
- Paste script

### Webflow
- **Project Settings → Custom Code**
- Footer Code
- Paste script

### Shopify
- **Online Store → Themes → Actions → Edit code**
- Open `theme.liquid`
- Paste before `</body>`

### HTML Website
- Open your HTML file
- Find `</body>` tag
- Paste script right before it

---

## 🎯 Example

If your Vercel URL is `https://onetech-ai.vercel.app`, your embed code is:

```html
<!-- O.N.E.Tech AI Assistant -->
<script>
  window.ONETECH_CONFIG = {
    apiUrl: 'https://onetech-ai.vercel.app'
  };
</script>
<script src="https://onetech-ai.vercel.app/widget.js"></script>
```

---

## 🔧 Need Help?

**Check if widget loads:**
1. Open browser console (F12)
2. Look for any errors
3. Check if script loaded: `https://your-url.vercel.app/widget.js`

**Not showing up?**
- ✅ Did you deploy the project first?
- ✅ Did you replace `your-project.vercel.app` with YOUR actual URL?
- ✅ Is the script before `</body>` tag?
- ✅ Did you save and refresh your website?

**Admin Dashboard:**
- Login: `https://your-url.vercel.app/admin/login`
- Create account: `/admin/register`
- Settings: `/admin/settings` → Website tab

---

## ⚡ That's It!

The widget is **already built and ready** in your project.

**Just:**
1. Deploy to Vercel
2. Copy your URL
3. Add script to website

**Done!** 🚀