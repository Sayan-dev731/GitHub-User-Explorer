const express = require('express');
const router = express.Router();
const githubService = require('../services/githubService');
const { strictLimiter } = require('../middleware/rateLimiter');

/**
 * GET /api/github/users
 * Fetch list of GitHub users
 */
router.get('/users', async (req, res) => {
    try {
        const since = parseInt(req.query.since) || 0;
        const perPage = Math.min(parseInt(req.query.per_page) || 30, 100);

        const users = await githubService.fetchUsers(since, perPage);
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.error || 'Failed to fetch users',
            message: error.message
        });
    }
});

/**
 * GET /api/github/user/:username
 * Fetch detailed information about a specific user
 */
router.get('/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const userData = await githubService.fetchUserDetails(username);
        res.json({ success: true, data: userData });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.error || 'Failed to fetch user details',
            message: error.message
        });
    }
});

/**
 * GET /api/github/search
 * Search GitHub users
 */
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        const page = parseInt(req.query.page) || 1;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required'
            });
        }

        const results = await githubService.searchUsers(query, page);
        res.json({ success: true, data: results });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.error || 'Failed to search users',
            message: error.message
        });
    }
});

/**
 * GET /api/github/user/:username/repos
 * Fetch user's repositories
 */
router.get('/user/:username/repos', async (req, res) => {
    try {
        const { username } = req.params;
        const sort = req.query.sort || 'updated';

        const repos = await githubService.fetchUserRepos(username, sort);
        res.json({ success: true, data: repos });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.error || 'Failed to fetch repositories',
            message: error.message
        });
    }
});

/**
 * GET /api/github/user/:username/gists
 * Fetch user's gists
 */
router.get('/user/:username/gists', async (req, res) => {
    try {
        const { username } = req.params;
        const gists = await githubService.fetchUserGists(username);
        res.json({ success: true, data: gists });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.error || 'Failed to fetch gists',
            message: error.message
        });
    }
});

/**
 * GET /api/github/trending
 * Fetch trending repositories
 */
router.get('/trending', strictLimiter, async (req, res) => {
    try {
        const language = req.query.language || '';
        const since = req.query.since || 'weekly';

        const trending = await githubService.fetchTrendingRepos(language, since);
        res.json({ success: true, data: trending });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.error || 'Failed to fetch trending repos',
            message: error.message
        });
    }
});

/**
 * GET /api/github/user/:username/followers
 * Fetch user's followers
 */
router.get('/user/:username/followers', async (req, res) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page) || 1;

        const followers = await githubService.fetchUserFollowers(username, page);
        res.json({ success: true, data: followers });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.error || 'Failed to fetch followers',
            message: error.message
        });
    }
});

/**
 * GET /api/github/user/:username/following
 * Fetch users that this user is following
 */
router.get('/user/:username/following', async (req, res) => {
    try {
        const { username } = req.params;
        const page = parseInt(req.query.page) || 1;

        const following = await githubService.fetchUserFollowing(username, page);
        res.json({ success: true, data: following });
    } catch (error) {
        res.status(error.status || 500).json({
            success: false,
            error: error.error || 'Failed to fetch following',
            message: error.message
        });
    }
});

/**
 * DELETE /api/github/cache
 * Clear API cache (admin endpoint)
 */
router.delete('/cache', strictLimiter, (req, res) => {
    try {
        const key = req.query.key;
        githubService.clearCache(key);
        res.json({
            success: true,
            message: key ? `Cache cleared for key: ${key}` : 'All cache cleared'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to clear cache'
        });
    }
});

module.exports = router;
