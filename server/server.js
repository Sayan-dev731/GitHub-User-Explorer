const express = require('express');
const path = require('path');
const cors = require('cors');
const config = require('./config/config');
const { apiLimiter } = require('./middleware/rateLimiter');
const githubRoutes = require('./routes/github');

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fix: Serve static files from public directory (one level up from server)
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes with rate limiting
app.use('/api/github', apiLimiter, githubRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'pages', 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║   GitHub Profile Shop Server                      ║
║   Running on: http://localhost:${PORT}            ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
╚═══════════════════════════════════════════════════╝
    `);
});