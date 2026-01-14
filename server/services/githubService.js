const axios = require('axios');
const NodeCache = require('node-cache');
const config = require('../config/config');

// Initialize cache
const cache = new NodeCache(config.cache);

class GitHubService {
    constructor() {
        this.baseURL = config.githubApiUrl;
        this.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Profile-Shop'
        };

        // Add token if available for higher rate limits
        if (config.githubToken) {
            this.headers['Authorization'] = `token ${config.githubToken}`;
        }
    }

    /**
     * Fetch multiple users from GitHub
     * @param {number} since - Starting user ID
     * @param {number} perPage - Number of users to fetch
     */
    async fetchUsers(since = 0, perPage = 30) {
        const cacheKey = `users_${since}_${perPage}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.baseURL}/users`, {
                headers: this.headers,
                params: { since, per_page: perPage }
            });

            // Enrich with additional data
            const enrichedUsers = await Promise.all(
                response.data.slice(0, 15).map(user => this.fetchUserDetails(user.login))
            );

            cache.set(cacheKey, enrichedUsers);
            return enrichedUsers;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Fetch detailed information about a specific user
     * @param {string} username - GitHub username
     */
    async fetchUserDetails(username) {
        const cacheKey = `user_${username}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const [userResponse, reposResponse] = await Promise.all([
                axios.get(`${this.baseURL}/users/${username}`, { headers: this.headers }),
                axios.get(`${this.baseURL}/users/${username}/repos`, {
                    headers: this.headers,
                    params: { sort: 'updated', per_page: 10 }
                })
            ]);

            const userData = {
                ...userResponse.data,
                repositories: reposResponse.data,
                category: userResponse.data.type
            };

            cache.set(cacheKey, userData);
            return userData;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Search GitHub users
     * @param {string} query - Search query
     * @param {number} page - Page number
     */
    async searchUsers(query, page = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/search/users`, {
                headers: this.headers,
                params: { q: query, per_page: 30, page }
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Fetch user's repositories
     * @param {string} username - GitHub username
     * @param {string} sort - Sort method (created, updated, pushed, full_name)
     */
    async fetchUserRepos(username, sort = 'updated') {
        const cacheKey = `repos_${username}_${sort}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const response = await axios.get(`${this.baseURL}/users/${username}/repos`, {
                headers: this.headers,
                params: { sort, per_page: 100 }
            });

            cache.set(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Fetch user's gists
     * @param {string} username - GitHub username
     */
    async fetchUserGists(username) {
        try {
            const response = await axios.get(`${this.baseURL}/users/${username}/gists`, {
                headers: this.headers,
                params: { per_page: 10 }
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Fetch trending repositories
     * @param {string} language - Programming language filter
     * @param {string} since - Time range (daily, weekly, monthly)
     */
    async fetchTrendingRepos(language = '', since = 'weekly') {
        const cacheKey = `trending_${language}_${since}`;
        const cached = cache.get(cacheKey);

        if (cached) {
            return cached;
        }

        try {
            const date = new Date();
            if (since === 'daily') date.setDate(date.getDate() - 1);
            else if (since === 'weekly') date.setDate(date.getDate() - 7);
            else date.setMonth(date.getMonth() - 1);

            const dateStr = date.toISOString().split('T')[0];
            let query = `created:>${dateStr}`;
            if (language) query += ` language:${language}`;

            const response = await axios.get(`${this.baseURL}/search/repositories`, {
                headers: this.headers,
                params: {
                    q: query,
                    sort: 'stars',
                    order: 'desc',
                    per_page: 30
                }
            });

            cache.set(cacheKey, response.data);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Fetch user's followers
     * @param {string} username - GitHub username
     */
    async fetchUserFollowers(username, page = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/users/${username}/followers`, {
                headers: this.headers,
                params: { per_page: 30, page }
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Fetch user's following
     * @param {string} username - GitHub username
     */
    async fetchUserFollowing(username, page = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/users/${username}/following`, {
                headers: this.headers,
                params: { per_page: 30, page }
            });

            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors
     */
    handleError(error) {
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data.message || 'GitHub API error';

            if (status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
                const resetTime = new Date(error.response.headers['x-ratelimit-reset'] * 1000);
                return {
                    error: 'GitHub API rate limit exceeded',
                    message: `Rate limit will reset at ${resetTime.toLocaleTimeString()}`,
                    status: 429
                };
            }

            return { error: message, status };
        }

        return { error: 'Network error', message: error.message, status: 500 };
    }

    /**
     * Clear cache for specific key or all cache
     */
    clearCache(key = null) {
        if (key) {
            cache.del(key);
        } else {
            cache.flushAll();
        }
    }
}

module.exports = new GitHubService();
