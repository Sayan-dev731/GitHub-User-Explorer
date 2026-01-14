# 🎨 GitHub Profile Shop

A stunning, feature-rich web application that showcases GitHub profiles in an engaging e-commerce-style interface. Built with clean architecture, server-side API handling, and amazing interactive features.

## ✨ Features

### Core Features
- 🔍 **Advanced Search**: Real-time search with debouncing and server-side GitHub user search
- 📊 **Sort & Filter**: Sort by followers, repos, or name; Filter by user type (Users, Organizations)
- 🎯 **Profile Details**: Click on any profile to view detailed information in a beautiful modal
- 📈 **Trending Repos**: Automatically displays trending JavaScript repositories
- 💾 **Caching**: Server-side caching for improved performance
- 🛡️ **Rate Limiting**: Built-in rate limiting to prevent API abuse

### Profile Modal Features
When you click on a profile, you get:
- 📱 Full user information (bio, location, company, email, Twitter)
- 📚 Top 5 repositories with stars, forks, and license info
- 📝 Recent gists
- 👥 Recent followers with avatars
- 🔗 Direct links to GitHub profile and personal website

### Advanced GitHub Features
- 🔥 **Trending Repositories**: Shows trending repos based on language and time range
- 🌟 **Repository Details**: Star count, fork count, language, last update
- 🎨 **Gist Support**: View user's recent code snippets
- 👥 **Social Network**: View followers and following

### Easter Eggs & Fun Features
- 🎮 **Konami Code**: Try the classic code (↑↑↓↓←→←→BA) for a surprise!
- 🎉 **Confetti**: Click the "Play" button for celebration effects
- 💻 **Terminal Mode**: Toggle a developer-themed dark mode
- 🎊 **Smooth Animations**: Beautiful fade-in and hover effects

## 🏗️ Architecture

### Clean Server Structure
```
server/
├── config/
│   └── config.js          # Configuration management
├── middleware/
│   └── rateLimiter.js     # Rate limiting middleware
├── routes/
│   └── github.js          # GitHub API routes
├── services/
│   └── githubService.js   # GitHub API service layer
└── server.js              # Main server file
```

### API Endpoints

#### Users
- `GET /api/github/users?since=0&per_page=30` - Fetch list of users
- `GET /api/github/user/:username` - Get detailed user profile
- `GET /api/github/search?q=query&page=1` - Search users

#### Repositories
- `GET /api/github/user/:username/repos?sort=updated` - Get user's repositories
- `GET /api/github/trending?language=javascript&since=weekly` - Get trending repos

#### Social
- `GET /api/github/user/:username/followers` - Get user's followers
- `GET /api/github/user/:username/following` - Get users being followed
- `GET /api/github/user/:username/gists` - Get user's gists

#### Admin
- `DELETE /api/github/cache?key=optional` - Clear cache
- `GET /api/health` - Health check

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd slush
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
PORT=3000
NODE_ENV=development

# Optional: Add GitHub token for higher rate limits
# Get your token from: https://github.com/settings/tokens
# GITHUB_TOKEN=your_github_personal_access_token_here
```

4. **Start the development server**
```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Production Deployment
```bash
npm start
```

## 🎯 Usage

1. **Browse Profiles**: View GitHub users in a beautiful grid layout
2. **Search**: Type in the search box to find specific users
3. **Sort**: Use the dropdown to sort by followers, repos, or name
4. **Filter**: Click on "All Users", "Orgs", or "Devs" to filter by type
5. **View Details**: Click on any profile card or "View Profile" button to see full details
6. **Follow**: Click the "+" button to add users to your following list
7. **Load More**: Click "Load More" button to fetch additional profiles
8. **Trending**: Scroll down to see trending JavaScript repositories

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Strict Rate Limiting**: 30 requests per 15 minutes for expensive operations (trending, cache clear)
- **Server-side API calls**: All GitHub API calls are made from the server
- **Request validation**: Input validation and sanitization
- **CORS enabled**: Controlled cross-origin resource sharing

## ⚡ Performance Optimizations

- **Server-side caching**: 10-minute cache for API responses
- **Lazy loading**: Images are loaded lazily
- **Debounced search**: 500ms debounce on search input
- **Parallel requests**: Multiple API calls executed in parallel
- **Staggered animations**: Smooth rendering of multiple items

## 🎨 Design Features

- **GitHub Primer Design System**: Uses official GitHub colors and styles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Smooth Animations**: CSS transitions and keyframe animations
- **Modern UI**: Clean, minimalist interface with attention to detail
- **Accessibility**: Proper semantic HTML and ARIA labels

## 📦 Dependencies

### Production
- `express` - Web server framework
- `axios` - HTTP client for API calls
- `express-rate-limit` - Rate limiting middleware
- `node-cache` - In-memory caching
- `cors` - CORS middleware
- `dotenv` - Environment variable management

### Development
- `nodemon` - Auto-reload during development

## 🔧 Configuration

### Rate Limits
Edit `server/config/config.js`:
```javascript
rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // requests per window
}
```

### Cache Settings
```javascript
cache: {
    stdTTL: 600, // 10 minutes
    checkperiod: 120 // Check every 2 minutes
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👤 Author

**Sayan**

## 🙏 Acknowledgments

- GitHub for their amazing API
- GitHub Primer Design System for the beautiful UI components
- Canvas Confetti for the celebration effects
- Font Awesome for the icons

## 🐛 Known Issues & Future Improvements

- [ ] Add GitHub OAuth authentication
- [ ] Implement actual follow/unfollow functionality with GitHub API
- [ ] Add user contributions graph
- [ ] Add repository language statistics
- [ ] Implement infinite scroll instead of "Load More" button
- [ ] Add dark mode toggle
- [ ] Add more language options for trending repos

## 📸 Screenshots

Visit `http://localhost:3000` to see the application in action!

---

Made with ❤️ and lots of ☕
