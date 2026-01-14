# 🚀 Quick Start Guide

Get up and running in 2 minutes!

## Prerequisites
- Node.js v14+ installed
- npm or yarn
- Internet connection

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm run dev
```

### 3. Open Your Browser
Navigate to: **http://localhost:3000**

That's it! 🎉

---

## Optional: Add GitHub Token (Recommended)

For higher API rate limits (5000 requests/hour vs 60):

1. **Get a GitHub Token**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name (no scopes needed)
   - Copy the token

2. **Add to .env file**
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```

3. **Restart the server**
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

---

## First Steps

1. **Browse Profiles**: Scroll through GitHub users
2. **Search**: Type in the search box to find users
3. **View Details**: Click on any profile to see full information
4. **Follow Users**: Click the + button to add to your list
5. **Try Easter Eggs**: Press ↑↑↓↓←→←→BA for fun!

---

## Project Structure
```
slush/
├── server/
│   ├── config/         # Configuration files
│   ├── middleware/     # Rate limiting
│   ├── routes/         # API routes
│   ├── services/       # GitHub service
│   └── server.js       # Main server
├── public/
│   ├── pages/          # HTML files
│   ├── assets/
│   │   ├── css/        # Styles
│   │   └── js/         # Frontend logic
│   └── ...
└── package.json
```

---

## Available Scripts

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Check for errors
node server/server.js
```

---

## Quick Testing

Test if everything works:

```bash
# Health check
curl http://localhost:3000/api/health

# Get users
curl http://localhost:3000/api/github/users

# Search users
curl "http://localhost:3000/api/github/search?q=john"
```

---

## Features at a Glance

✅ GitHub profile browsing  
✅ Real-time search  
✅ Profile detail modal  
✅ Repository viewing  
✅ Follower/following lists  
✅ Trending repositories  
✅ Rate limiting  
✅ Server-side caching  
✅ Easter eggs!  

---

## Need Help?

- 📖 **Full documentation**: See [README.md](README.md)
- 🔧 **API details**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- 🎨 **Feature guide**: See [FEATURES.md](FEATURES.md)
- 🐛 **Troubleshooting**: See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## Tips

💡 **Tip 1**: Add a GitHub token for unlimited usage  
💡 **Tip 2**: Click on profile avatars for quick access to details  
💡 **Tip 3**: Try the Konami code for a surprise!  
💡 **Tip 4**: Use search with 2+ characters for GitHub-wide search  

---

## Next Steps

1. ⭐ Explore all features in [FEATURES.md](FEATURES.md)
2. 🔌 Check available API endpoints in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
3. 🎨 Customize the UI in `public/assets/css/styles.css`
4. 🚀 Deploy to production

---

**Enjoy building with GitHub Profile Shop!** 🎉
