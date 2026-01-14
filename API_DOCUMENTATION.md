# GitHub Profile Shop - API Documentation

## Base URL
```
http://localhost:3000/api/github
```

## Rate Limiting
- **Standard endpoints**: 100 requests per 15 minutes per IP
- **Strict endpoints** (trending, cache): 30 requests per 15 minutes per IP

## Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

---

## Endpoints

### 1. Fetch Users
Retrieve a list of GitHub users.

**Endpoint**: `GET /api/github/users`

**Query Parameters**:
- `since` (optional): Starting user ID (default: 0)
- `per_page` (optional): Number of users to fetch (default: 30, max: 100)

**Example Request**:
```bash
curl http://localhost:3000/api/github/users?since=0&per_page=15
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "login": "octocat",
      "id": 1,
      "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4",
      "type": "User",
      "name": "The Octocat",
      "company": "@github",
      "blog": "https://github.blog",
      "location": "San Francisco",
      "email": null,
      "bio": "How people build software",
      "public_repos": 8,
      "followers": 100000,
      "following": 0,
      "repositories": [ ... ]
    }
  ]
}
```

---

### 2. Get User Details
Fetch detailed information about a specific user.

**Endpoint**: `GET /api/github/user/:username`

**Path Parameters**:
- `username`: GitHub username

**Example Request**:
```bash
curl http://localhost:3000/api/github/user/octocat
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "login": "octocat",
    "name": "The Octocat",
    "avatar_url": "https://avatars.githubusercontent.com/u/1?v=4",
    "bio": "How people build software",
    "company": "@github",
    "location": "San Francisco",
    "email": null,
    "blog": "https://github.blog",
    "twitter_username": null,
    "public_repos": 8,
    "followers": 100000,
    "following": 0,
    "created_at": "2011-01-25T18:44:36Z",
    "updated_at": "2024-01-10T12:00:00Z",
    "repositories": [ ... ]
  }
}
```

---

### 3. Search Users
Search for GitHub users by query.

**Endpoint**: `GET /api/github/search`

**Query Parameters**:
- `q` (required): Search query
- `page` (optional): Page number (default: 1)

**Example Request**:
```bash
curl http://localhost:3000/api/github/search?q=john&page=1
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "total_count": 1000,
    "incomplete_results": false,
    "items": [
      {
        "login": "john",
        "id": 123,
        "avatar_url": "https://avatars.githubusercontent.com/u/123?v=4",
        "type": "User"
      }
    ]
  }
}
```

---

### 4. Get User Repositories
Fetch repositories for a specific user.

**Endpoint**: `GET /api/github/user/:username/repos`

**Path Parameters**:
- `username`: GitHub username

**Query Parameters**:
- `sort` (optional): Sort method - `created`, `updated`, `pushed`, `full_name` (default: updated)

**Example Request**:
```bash
curl http://localhost:3000/api/github/user/octocat/repos?sort=updated
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "name": "Hello-World",
      "full_name": "octocat/Hello-World",
      "description": "My first repository",
      "html_url": "https://github.com/octocat/Hello-World",
      "stargazers_count": 1234,
      "forks_count": 567,
      "language": "JavaScript",
      "created_at": "2011-01-26T19:01:12Z",
      "updated_at": "2024-01-10T12:00:00Z",
      "license": {
        "name": "MIT License",
        "spdx_id": "MIT"
      }
    }
  ]
}
```

---

### 5. Get User Gists
Fetch gists for a specific user.

**Endpoint**: `GET /api/github/user/:username/gists`

**Path Parameters**:
- `username`: GitHub username

**Example Request**:
```bash
curl http://localhost:3000/api/github/user/octocat/gists
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "description": "Example gist",
      "html_url": "https://gist.github.com/abc123",
      "created_at": "2024-01-01T12:00:00Z",
      "files": {
        "example.js": {
          "filename": "example.js",
          "type": "application/javascript",
          "language": "JavaScript",
          "size": 1234
        }
      }
    }
  ]
}
```

---

### 6. Get Trending Repositories
Fetch trending repositories filtered by language and time range.

**Endpoint**: `GET /api/github/trending`

**Rate Limit**: Strict (30 requests per 15 minutes)

**Query Parameters**:
- `language` (optional): Programming language filter (e.g., javascript, python)
- `since` (optional): Time range - `daily`, `weekly`, `monthly` (default: weekly)

**Example Request**:
```bash
curl http://localhost:3000/api/github/trending?language=javascript&since=weekly
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "total_count": 5000,
    "items": [
      {
        "name": "awesome-project",
        "full_name": "user/awesome-project",
        "description": "An awesome trending project",
        "html_url": "https://github.com/user/awesome-project",
        "stargazers_count": 5000,
        "forks_count": 1000,
        "language": "JavaScript"
      }
    ]
  }
}
```

---

### 7. Get User Followers
Fetch followers for a specific user.

**Endpoint**: `GET /api/github/user/:username/followers`

**Path Parameters**:
- `username`: GitHub username

**Query Parameters**:
- `page` (optional): Page number (default: 1)

**Example Request**:
```bash
curl http://localhost:3000/api/github/user/octocat/followers
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "login": "follower1",
      "id": 456,
      "avatar_url": "https://avatars.githubusercontent.com/u/456?v=4",
      "html_url": "https://github.com/follower1"
    }
  ]
}
```

---

### 8. Get User Following
Fetch users that a specific user is following.

**Endpoint**: `GET /api/github/user/:username/following`

**Path Parameters**:
- `username`: GitHub username

**Query Parameters**:
- `page` (optional): Page number (default: 1)

**Example Request**:
```bash
curl http://localhost:3000/api/github/user/octocat/following
```

---

### 9. Clear Cache
Clear server-side cache (admin endpoint).

**Endpoint**: `DELETE /api/github/cache`

**Rate Limit**: Strict (30 requests per 15 minutes)

**Query Parameters**:
- `key` (optional): Specific cache key to clear. If omitted, clears all cache.

**Example Request**:
```bash
curl -X DELETE http://localhost:3000/api/github/cache
curl -X DELETE "http://localhost:3000/api/github/cache?key=user_octocat"
```

**Example Response**:
```json
{
  "success": true,
  "message": "All cache cleared"
}
```

---

### 10. Health Check
Check server health status.

**Endpoint**: `GET /api/health`

**Example Request**:
```bash
curl http://localhost:3000/api/health
```

**Example Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-11T12:00:00.000Z"
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - User or resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## Rate Limit Headers

All responses include rate limit information:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1641916800
```

## Caching

- **Default TTL**: 10 minutes (600 seconds)
- **Cache Keys**: Automatically generated based on endpoint and parameters
- **Cache Clear**: Use the `/cache` endpoint to manually clear cache

## Authentication

Currently, the API doesn't require authentication. However, you can add a GitHub token in the `.env` file to increase rate limits:

```env
GITHUB_TOKEN=your_github_personal_access_token
```

This will increase GitHub API rate limits from 60 to 5000 requests per hour.

## Examples

### JavaScript/Fetch
```javascript
// Fetch users
const response = await fetch('/api/github/users?since=0&per_page=15');
const data = await response.json();

// Search users
const searchResponse = await fetch('/api/github/search?q=john');
const searchData = await searchResponse.json();

// Get user details
const userResponse = await fetch('/api/github/user/octocat');
const userData = await userResponse.json();
```

### cURL
```bash
# Get users
curl http://localhost:3000/api/github/users

# Search with query
curl "http://localhost:3000/api/github/search?q=javascript+developer"

# Get trending repos
curl "http://localhost:3000/api/github/trending?language=python&since=weekly"
```

---

**Last Updated**: January 11, 2026
