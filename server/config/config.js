require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Debug: Check if token is loaded
if (process.env.GITHUB_TOKEN) {
    console.log('✓ GitHub Token loaded successfully');
} else {
    console.log('⚠️  Warning: GitHub Token not found. Rate limits will be lower.');
}

module.exports = {
    port: process.env.PORT || 3000,
    githubToken: process.env.GITHUB_TOKEN || '', // Optional: Add GitHub token for higher rate limits
    githubApiUrl: 'https://api.github.com',
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    cache: {
        stdTTL: 600, // 10 minutes
        checkperiod: 120 // Check for expired entries every 2 minutes
    }
};
