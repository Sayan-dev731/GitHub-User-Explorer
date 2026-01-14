# 🎮 GitHub Profile Shop - Feature Guide

## 🌟 Main Features

### 1. Browse GitHub Profiles
- **Grid Layout**: Beautiful card-based layout showing GitHub users
- **Profile Cards**: Each card displays:
  - User avatar
  - Username
  - User type (User/Organization)
  - Follower count
  - Quick action buttons

### 2. Search Functionality
Located in the top navigation bar:
- **Real-time Search**: Start typing to search profiles
- **Local Search**: Searches current loaded profiles instantly
- **Server Search**: Type 2+ characters for GitHub-wide search
- **Debounced**: Optimized to prevent excessive API calls

### 3. Sort Options
Use the dropdown menu to sort profiles by:
- **Most Followed**: Sort by follower count (high to low)
- **Most Repos**: Sort by repository count (high to low)
- **Name (A-Z)**: Alphabetical sorting by username

### 4. Filter by Category
Click navigation links to filter:
- **All Users**: Show all profiles
- **Orgs**: Show only organizations
- **Devs**: Show only individual users

### 5. Profile Details Modal ⭐
Click on any profile card or avatar to open detailed view:

#### User Information
- Full name and username
- Bio/description
- Location, company, email
- Twitter handle
- Personal website link

#### Statistics
- Total repositories
- Followers count
- Following count
- Public gists count

#### Top Repositories
Shows user's top 5 repositories with:
- Repository name and description
- Programming language badge
- Star and fork counts
- License information
- Last update date
- Direct link to repository

#### Recent Gists
Displays recent code snippets:
- Gist description
- Number of files
- Creation date
- Direct link to gist

#### Recent Followers
Visual grid of recent followers:
- Avatar thumbnails
- Username
- Clickable to view their GitHub profile

### 6. Follow System
- Click the **+** button to "follow" a user
- Button changes to **✓** when following
- Counter in top-right shows total following
- Toast notification confirms action

### 7. Load More
- Click "Load More" button at bottom
- Loads additional 15 profiles
- Seamless pagination

### 8. Trending Repositories 🔥
Automatically displays trending JavaScript repos:
- Shows after 2 seconds of page load
- Top 5 trending repos this week
- Star counts and fork counts
- Direct links to repositories

## 🎨 Visual Features

### Animations
- **Fade-in**: Cards animate in with staggered timing
- **Hover Effects**: Cards lift and glow on hover
- **Smooth Transitions**: All interactions are buttery smooth
- **Loading Spinners**: Animated loading indicators

### Responsive Design
- Works on all screen sizes
- Mobile-friendly navigation
- Adaptive grid layout
- Touch-friendly buttons

## 🎮 Easter Eggs & Fun Features

### 1. Konami Code 🕹️
**How to activate**: Press the following keys in sequence:
```
↑ ↑ ↓ ↓ ← → ← → B A
```

**What happens**:
- Alert message appears
- Terminal mode toggles on
- Confetti explosion
- Page rotates 360°
- Ultimate fun surprise!

### 2. Confetti Button 🎉
- Click the "Play" button in hero section
- Triggers colorful confetti animation
- GitHub-themed colors
- Multiple particles with spread effect

### 3. Terminal Mode 💻
- Click "dev/core" in navigation
- Toggles terminal/developer themed mode
- Changes visual appearance
- Can be triggered by Konami code

### 4. Smooth Scroll
- Click "Explore Profiles" button
- Smoothly scrolls to profile grid
- Better user experience

## 🚀 Advanced Features

### Server-Side Architecture
- **Rate Limiting**: Prevents API abuse
- **Caching**: 10-minute cache for faster loads
- **Error Handling**: Graceful error messages
- **Parallel Requests**: Efficient data fetching

### Performance Optimizations
- **Lazy Loading**: Images load as needed
- **Debounced Search**: Reduces unnecessary requests
- **Cached Responses**: Faster repeat queries
- **Efficient Rendering**: Optimized DOM updates

## 💡 Pro Tips

1. **Quick Search**: Type just 1 character for local search, 2+ for GitHub-wide search

2. **Profile Details**: Click anywhere on the card or avatar to open modal

3. **Close Modal**: 
   - Click outside the modal
   - Press ESC key
   - Click the X button

4. **Follow Multiple Users**: Click + on multiple profiles to build your following list

5. **Keyboard Navigation**: Use ESC to close modals quickly

6. **Direct GitHub Links**: All "View on GitHub" buttons open in new tabs

7. **Explore Repos**: Click on repository names to view them on GitHub

8. **Social Network**: Click on followers to view their profiles

## 🔧 Developer Features

### API Endpoints
All features use server-side API endpoints at `/api/github/`:
- `/users` - List users
- `/user/:username` - User details
- `/search` - Search users
- `/user/:username/repos` - User repositories
- `/user/:username/gists` - User gists
- `/user/:username/followers` - User followers
- `/trending` - Trending repositories

### Console Logging
Open browser DevTools to see:
- API request logs
- Error messages
- Performance metrics
- Cache hits/misses

### Health Check
Visit `/api/health` to check server status

### Cache Management
Use `/api/github/cache` (DELETE) to clear cache

## 📱 Mobile Experience

### Touch Gestures
- Tap to view profiles
- Swipe to scroll
- Pinch to zoom on modal images

### Mobile Navigation
- Hamburger menu (if screen is very small)
- Simplified layout
- Touch-friendly buttons
- Optimized tap targets

## 🎯 Usage Scenarios

### For Recruiters
1. Search for developers by name
2. View their repositories and gists
3. Check follower/following ratios
4. See their contribution activity
5. Visit their websites/portfolios

### For Developers
1. Discover trending repositories
2. Find interesting GitHub users
3. Explore new technologies via repos
4. Get inspired by others' work
5. Build your following list

### For Students
1. Learn from experienced developers
2. Find open-source projects
3. Study repository structures
4. See real-world code examples
5. Connect with the community

## 🔐 Privacy & Security

- No personal data stored
- All requests through server
- Rate limiting protection
- No authentication required
- Public GitHub data only

## ⚡ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `ESC` | Close modal |
| `↑↑↓↓←→←→BA` | Konami code |
| `Ctrl/Cmd + F` | Focus search |

## 🎨 Theme Support

### Current Theme
- GitHub Primer Design System
- Light mode (default)
- Clean, minimal aesthetic

### Terminal Mode
- Toggle via "dev/core" link
- Darker developer theme
- Konami code also activates

---

**Enjoy exploring the GitHub community!** 🚀

If you have any questions or find bugs, please report them on the repository issues page.
