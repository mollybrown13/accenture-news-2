# Accenture News Widget - Ready to Deploy!

All your files are created and saved in:
**C:\Users\d-molly.a.brown\accenture-news**

## What's Inside:

✅ `index.html` - Your widget webpage
✅ `package.json` - Dependencies configuration
✅ `netlify.toml` - Netlify settings
✅ `netlify/functions/fetch-news.js` - News fetcher with positive filtering

## Next Steps:

### 1. Install Dependencies

Open your terminal in this folder and run:
```bash
npm install
```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - Accenture news widget"
```

Then create a new repository on GitHub and push:
```bash
git remote add origin https://github.com/YOUR-USERNAME/accenture-news.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Netlify

1. Go to https://netlify.com and sign in
2. Click "Add new site" → "Import from Git"
3. Choose GitHub and select your repository
4. Click "Deploy site"

That's it! Netlify will give you a URL.

### 4. Add to SharePoint

1. Edit your SharePoint page
2. Add "Embed" web part
3. Paste your Netlify URL
4. Set height to 700px
5. Save and publish

## Features:

✨ Only shows POSITIVE news about Accenture
✨ Filters out negative keywords (lawsuits, layoffs, scandals, etc.)
✨ Highlights Federal Services articles with a purple badge
✨ Auto-refreshes every 15 minutes
✨ Clean, modern design with Accenture purple branding

## Need Help?

- Check that all files are in the right place
- Make sure Node.js is installed (`node --version`)
- Run `npm install` before deploying
