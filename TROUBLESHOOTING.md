# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### 1. Server Won't Start

#### Problem: "Port 3000 is already in use"
**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Change port in .env file
PORT=3001
```

#### Problem: "Cannot find module"
**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

#### Problem: "dotenv not found"
**Solution**:
```bash
npm install dotenv
```

---

### 2. API Issues

#### Problem: "Failed to fetch users"
**Possible Causes**:
1. GitHub API rate limit exceeded
2. Network connection issue
3. Server not running

**Solutions**:
```bash
# Check server logs
# Look for rate limit errors

# Add GitHub token to .env for higher limits
GITHUB_TOKEN=your_token_here

# Clear cache and restart
curl -X DELETE http://localhost:3000/api/github/cache
```

#### Problem: "429 Too Many Requests"
**Cause**: Rate limit exceeded

**Solutions**:
1. Wait 15 minutes for rate limit reset
2. Add GitHub token to `.env` file:
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```
3. Get token from: https://github.com/settings/tokens

---

### 3. Frontend Issues

#### Problem: "Page not rendering"
**Solutions**:
1. Check if server is running at `http://localhost:3000`
2. Open browser console (F12) for errors
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try hard refresh (Ctrl+Shift+R)

#### Problem: "Images not loading"
**Cause**: CORS or network issue

**Solution**:
```bash
# Check browser console for CORS errors
# Restart server
npm run dev
```

#### Problem: "Modal not opening"
**Solutions**:
1. Check browser console for JavaScript errors
2. Clear browser cache
3. Verify API endpoint is working:
   ```bash
   curl http://localhost:3000/api/github/user/octocat
   ```

#### Problem: "Search not working"
**Solutions**:
1. Check if you're typing at least 2 characters
2. Verify API endpoint:
   ```bash
   curl "http://localhost:3000/api/github/search?q=test"
   ```
3. Check browser console for errors

---

### 4. Performance Issues

#### Problem: "Slow loading"
**Solutions**:
1. **Enable caching**: Already enabled by default (10 min TTL)
2. **Add GitHub token**: Increases rate limits
3. **Clear old cache**:
   ```bash
   curl -X DELETE http://localhost:3000/api/github/cache
   ```
4. **Check network**: Open DevTools > Network tab

#### Problem: "High memory usage"
**Solutions**:
1. Restart the server
2. Reduce cache TTL in `server/config/config.js`:
   ```javascript
   cache: {
       stdTTL: 300, // 5 minutes instead of 10
       checkperiod: 60
   }
   ```

---

### 5. Installation Issues

#### Problem: "npm install fails"
**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Use different registry
npm config set registry https://registry.npmjs.org/

# Retry installation
npm install
```

#### Problem: "Node version incompatible"
**Solution**:
```bash
# Check Node version
node --version

# Upgrade to Node v14 or higher
# Download from: https://nodejs.org/
```

---

### 6. Development Issues

#### Problem: "Nodemon not working"
**Solution**:
```bash
# Install nodemon globally
npm install -g nodemon

# Or use npx
npx nodemon server/server.js

# Or use npm start instead
npm start
```

#### Problem: "Changes not reflecting"
**Solutions**:
1. Save all files (Ctrl+S)
2. Nodemon should auto-restart (check terminal)
3. Hard refresh browser (Ctrl+Shift+R)
4. Restart server manually:
   ```bash
   # Press Ctrl+C to stop
   npm run dev
   ```

---

### 7. Browser-Specific Issues

#### Problem: "Works in Chrome but not Firefox/Safari"
**Solutions**:
1. Clear browser cache and cookies
2. Check for browser console errors
3. Update browser to latest version
4. Try in incognito/private mode

#### Problem: "Animations not smooth"
**Solutions**:
1. Close other tabs/applications
2. Update GPU drivers
3. Disable browser extensions
4. Try different browser

---

### 8. API Error Messages

#### Error: "GitHub API rate limit exceeded"
**Solution**:
```env
# Add to .env file
GITHUB_TOKEN=your_github_token

# Get token from:
# https://github.com/settings/tokens
# No special scopes needed for public data
```

#### Error: "Network error"
**Solutions**:
1. Check internet connection
2. Verify GitHub is accessible: https://github.com
3. Check firewall settings
4. Try different network

#### Error: "Failed to fetch user details"
**Cause**: User doesn't exist or is suspended

**Solution**: Try different username

---

### 9. Debugging Tips

#### Enable Verbose Logging
Add to `server/server.js`:
```javascript
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
```

#### Check API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Test users endpoint
curl http://localhost:3000/api/github/users

# Test search
curl "http://localhost:3000/api/github/search?q=test"

# Check specific user
curl http://localhost:3000/api/github/user/octocat
```

#### Browser DevTools
1. Press F12 to open DevTools
2. Check **Console** tab for JavaScript errors
3. Check **Network** tab for failed requests
4. Check **Application** tab to clear cache

---

### 10. Production Deployment Issues

#### Problem: "Works locally but not in production"
**Solutions**:
1. Check environment variables are set
2. Verify PORT is correctly configured
3. Check server logs for errors
4. Ensure all dependencies are installed:
   ```bash
   npm ci --production
   ```

#### Problem: "Static files not loading"
**Solution**:
```javascript
// Verify in server.js
app.use(express.static(path.join(__dirname, '..', 'public')));
```

---

## Quick Diagnostics

### 1. Server Health Check
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"OK","timestamp":"..."}
```

### 2. Test API Response
```bash
curl http://localhost:3000/api/github/users?per_page=1
# Expected: {"success":true,"data":[...]}
```

### 3. Check Rate Limit Status
Look for these headers in response:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
```

### 4. View Server Logs
Check terminal where server is running for:
- Request logs
- Error messages
- Cache information

---

## Getting Help

### Check Logs
1. **Server logs**: Check terminal where server is running
2. **Browser console**: Press F12 > Console tab
3. **Network tab**: F12 > Network tab to see failed requests

### Collect Information
When reporting issues, include:
- Node version: `node --version`
- npm version: `npm --version`
- Operating system
- Browser and version
- Error messages from console
- Server logs

### GitHub Token Setup (Recommended)

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a name: "GitHub Profile Shop"
4. No scopes needed for public data
5. Click "Generate token"
6. Copy token to `.env`:
   ```env
   GITHUB_TOKEN=ghp_your_token_here
   ```
7. Restart server

This increases GitHub API limits from:
- **Without token**: 60 requests/hour
- **With token**: 5000 requests/hour

---

## Still Having Issues?

1. Try the example project structure
2. Check if all files are in correct locations
3. Verify all dependencies are installed
4. Test with a fresh clone/installation
5. Check GitHub API status: https://www.githubstatus.com/

---

## Contact & Support

- Check README.md for setup instructions
- Review API_DOCUMENTATION.md for endpoint details
- Read FEATURES.md for feature guides
- Report bugs in GitHub Issues

---

**Last Updated**: January 11, 2026
