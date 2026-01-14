/* --- CONFIG & STATE --- */
const API_URL = "/api/github";
let usersData = [];
let cart = new Set();
let isTerminalMode = false;
let currentPage = 0;

/* --- DOM ELEMENTS --- */
const grid = document.getElementById('profileGrid');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const followCountEl = document.getElementById('followCount');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const toast = document.getElementById('toast');
const profileModal = document.getElementById('profileModal');

/* --- API CALLS --- */

/**
 * Fetch users from server API
 */
async function fetchUsers() {
    try {
        showLoading();
        const response = await fetch(`${API_URL}/users?since=${currentPage}&per_page=15`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            const newUsers = result.data.map(user => ({
                ...user,
                price: user.followers || 0, // Use REAL followers from GitHub API
                category: user.type,
                title: user.login
            }));

            usersData = [...usersData, ...newUsers];
            renderGrid(usersData);
            currentPage += 15;
        } else {
            throw new Error(result.error || 'Failed to fetch users');
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        showError("Failed to load profiles. Please try again later.");
    }
}

/**
 * Fetch detailed user profile
 */
async function fetchUserProfile(username) {
    try {
        const response = await fetch(`${API_URL}/user/${username}`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Failed to fetch user profile');
        }
    } catch (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }
}

/**
 * Search users by username - Direct GitHub API call for exact user search
 */
async function searchUserByUsername(username) {
    try {
        // First try to get the exact user
        const response = await fetch(`${API_URL}/user/${username}`);
        const result = await response.json();

        if (result.success && result.data) {
            return { found: true, user: result.data };
        } else {
            return { found: false, user: null };
        }
    } catch (error) {
        console.error("Error searching user:", error);
        return { found: false, user: null };
    }
}

/**
 * Search users
 */
async function searchUsers(query) {
    try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
        const result = await response.json();

        if (result.success) {
            return result.data.items || [];
        } else {
            throw new Error(result.error || 'Search failed');
        }
    } catch (error) {
        console.error("Error searching users:", error);
        return [];
    }
}

/**
 * Fetch user's repos
 */
async function fetchUserRepos(username) {
    try {
        const response = await fetch(`${API_URL}/user/${username}/repos?sort=updated`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching repos:", error);
        return [];
    }
}

/**
 * Fetch user's gists
 */
async function fetchUserGists(username) {
    try {
        const response = await fetch(`${API_URL}/user/${username}/gists`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching gists:", error);
        return [];
    }
}

/**
 * Fetch user's followers
 */
async function fetchUserFollowers(username) {
    try {
        const response = await fetch(`${API_URL}/user/${username}/followers`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching followers:", error);
        return [];
    }
}

/**
 * Fetch trending repositories
 */
async function fetchTrending(language = '', since = 'weekly') {
    try {
        const response = await fetch(`${API_URL}/trending?language=${language}&since=${since}`);
        const result = await response.json();

        if (result.success) {
            return result.data.items || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching trending repos:", error);
        return [];
    }
}

/* --- RENDER FUNCTIONS --- */

function showLoading() {
    grid.innerHTML = `
        <div class="loading-state">
            <i class="fa-solid fa-circle-notch fa-spin"></i> Loading profiles from server...
        </div>
    `;
}

function showError(message) {
    grid.innerHTML = `
        <div class="empty-state" style="color: var(--brand-pink);">
            <i class="fa-solid fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Retry</button>
        </div>
    `;
}

function renderGrid(data) {
    grid.innerHTML = '';

    if (data.length === 0) {
        grid.innerHTML = '<div class="empty-state">No profiles found matching criteria.</div>';
        return;
    }

    data.forEach((user, index) => {
        const card = document.createElement('article');
        card.className = 'profile-card';
        card.style.opacity = '0';
        card.style.animation = `fadeInUp 0.6s ${(index % 15) * 0.05}s forwards`;

        const isFollowing = cart.has(user.login);

        card.innerHTML = `
            <div class="card-img-wrapper" onclick="openProfileModal('${user.login}')">
                <img src="${user.avatar_url}" alt="${user.login}" loading="lazy">
            </div>
            <div class="card-content">
                <span class="card-category">${user.type || user.category}</span>
                <h3 class="card-title">${user.login}</h3>
                <div class="card-actions">
                    <button class="btn btn-outline" onclick="openProfileModal('${user.login}')" style="padding: 6px 12px; font-size: 12px;">
                        View Profile
                    </button>
                    <button class="add-btn ${isFollowing ? 'following' : ''}" 
                            onclick="toggleFollow('${user.login}', this)"
                            style="${isFollowing ? 'background: var(--color-fg-default); color: white;' : ''}">
                        <i class="fa-solid fa-${isFollowing ? 'check' : 'plus'}"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* --- PROFILE MODAL --- */

async function openProfileModal(username) {
    profileModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <div class="loading-spinner">
            <i class="fa-solid fa-circle-notch fa-spin"></i>
            <p>Loading ${username}'s profile...</p>
        </div>
    `;

    const userData = await fetchUserProfile(username);

    if (!userData) {
        modalContent.innerHTML = `
            <div class="loading-spinner">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <p>Failed to load profile</p>
            </div>
        `;
        return;
    }

    // Get additional data
    const [repos, gists, followers] = await Promise.all([
        fetchUserRepos(username),
        fetchUserGists(username),
        fetchUserFollowers(username)
    ]);

    renderModalContent(userData, repos, gists, followers);
}

function closeProfileModal() {
    profileModal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderModalContent(user, repos, gists, followers) {
    const modalContent = document.getElementById('modalContent');

    modalContent.innerHTML = `
        <div class="modal-header">
            <img src="${user.avatar_url}" alt="${user.login}" class="modal-avatar">
            <div class="modal-user-info">
                <h2>${user.name || user.login}</h2>
                <div class="user-login">@${user.login}</div>
                ${user.bio ? `<div class="modal-user-bio">${user.bio}</div>` : ''}
                <div class="modal-stats">
                    <div class="stat-item">
                        <span class="stat-number">${user.public_repos || 0}</span>
                        <span class="stat-label">Repositories</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${user.followers || 0}</span>
                        <span class="stat-label">Followers</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-number">${user.following || 0}</span>
                        <span class="stat-label">Following</span>
                    </div>
                    ${user.public_gists ? `
                    <div class="stat-item">
                        <span class="stat-number">${user.public_gists}</span>
                        <span class="stat-label">Gists</span>
                    </div>
                    ` : ''}
                </div>
                <div class="modal-buttons">
                    <a href="${user.html_url}" target="_blank" class="btn btn-primary">
                        <i class="fa-brands fa-github"></i> View on GitHub
                    </a>
                    ${user.blog ? `
                        <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank" class="btn btn-outline">
                            <i class="fa-solid fa-globe"></i> Website
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
        <div class="modal-body">
            ${user.location || user.company || user.email ? `
                <div class="modal-section">
                    <h3><i class="fa-solid fa-info-circle"></i> Information</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                        ${user.company ? `<div><i class="fa-solid fa-building"></i> ${user.company}</div>` : ''}
                        ${user.location ? `<div><i class="fa-solid fa-location-dot"></i> ${user.location}</div>` : ''}
                        ${user.email ? `<div><i class="fa-solid fa-envelope"></i> ${user.email}</div>` : ''}
                        ${user.twitter_username ? `<div><i class="fa-brands fa-twitter"></i> @${user.twitter_username}</div>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${repos && repos.length > 0 ? `
                <div class="modal-section">
                    <h3><i class="fa-solid fa-code-branch"></i> Top Repositories</h3>
                    <div class="repo-list">
                        ${repos.slice(0, 5).map(repo => `
                            <div class="repo-item">
                                <div class="repo-header">
                                    <a href="${repo.html_url}" target="_blank" class="repo-name">
                                        <i class="fa-solid fa-book"></i> ${repo.name}
                                    </a>
                                    ${repo.language ? `<span class="language-badge">${repo.language}</span>` : ''}
                                </div>
                                ${repo.description ? `<div class="repo-description">${repo.description}</div>` : ''}
                                <div class="repo-meta">
                                    <span><i class="fa-solid fa-star"></i> ${repo.stargazers_count}</span>
                                    <span><i class="fa-solid fa-code-fork"></i> ${repo.forks_count}</span>
                                    ${repo.license ? `<span><i class="fa-solid fa-scale-balanced"></i> ${repo.license.name}</span>` : ''}
                                    <span><i class="fa-solid fa-clock"></i> Updated ${new Date(repo.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${gists && gists.length > 0 ? `
                <div class="modal-section">
                    <h3><i class="fa-solid fa-file-code"></i> Recent Gists</h3>
                    <div class="gist-list">
                        ${gists.slice(0, 3).map(gist => `
                            <div class="gist-item">
                                <a href="${gist.html_url}" target="_blank" class="repo-name">
                                    ${gist.description || 'Untitled Gist'}
                                </a>
                                <div class="repo-meta">
                                    <span><i class="fa-solid fa-file"></i> ${Object.keys(gist.files).length} file(s)</span>
                                    <span><i class="fa-solid fa-clock"></i> ${new Date(gist.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${followers && followers.length > 0 ? `
                <div class="modal-section">
                    <h3><i class="fa-solid fa-users"></i> Recent Followers</h3>
                    <div class="followers-grid">
                        ${followers.slice(0, 12).map(follower => `
                            <div class="follower-item">
                                <a href="${follower.html_url}" target="_blank">
                                    <img src="${follower.avatar_url}" alt="${follower.login}" class="follower-avatar">
                                    <div class="follower-name">${follower.login}</div>
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Close modal on outside click
profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        closeProfileModal();
    }
});

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileModal.classList.contains('active')) {
        closeProfileModal();
    }
});

/* --- INTERACTIONS --- */

/**
 * Handle search - Search for users and display a list of matching profiles
 */
async function handleSearch(searchTerm) {
    const term = searchTerm.trim();

    // Validate empty input
    if (term === '') {
        showToast('⚠️ Please enter a username to search');
        renderGrid(usersData);
        return;
    }

    showLoading();

    // Search for users matching the term
    const results = await searchUsers(term);

    if (results.length === 0) {
        showUserNotFound(term);
    } else {
        // Display search results as a grid of profiles
        renderSearchResults(results, term);
    }
}

/**
 * Render search results with enhanced cards
 */
function renderSearchResults(users, searchTerm) {
    grid.innerHTML = '';

    // Add search header
    const searchHeader = document.createElement('div');
    searchHeader.className = 'search-header';
    searchHeader.style.cssText = 'grid-column: 1 / -1; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;';
    searchHeader.innerHTML = `
        <div>
            <h2 style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; margin-bottom: 5px;">
                <i class="fa-solid fa-search" style="color: #58a6ff;"></i> Search Results for "${searchTerm}"
            </h2>
            <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">${users.length} profiles found</p>
        </div>
        <button onclick="searchInput.value=''; renderGrid(usersData);" class="btn btn-outline" style="padding: 10px 20px;">
            <i class="fa-solid fa-times"></i> Clear Search
        </button>
    `;
    grid.appendChild(searchHeader);

    if (users.length === 0) {
        grid.innerHTML += '<div class="empty-state">No profiles found matching criteria.</div>';
        return;
    }

    users.forEach((user, index) => {
        const card = document.createElement('article');
        card.className = 'profile-card search-result-card';
        card.style.opacity = '0';
        card.style.animation = `fadeInUp 0.6s ${(index % 15) * 0.05}s forwards`;

        const isFollowing = cart.has(user.login);

        card.innerHTML = `
            <div class="card-img-wrapper" onclick="viewUserProfile('${user.login}')" style="cursor: pointer;">
                <img src="${user.avatar_url}" alt="${user.login}" loading="lazy">
                <div class="card-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%); opacity: 0; transition: opacity 0.3s ease;"></div>
            </div>
            <div class="card-content">
                <span class="card-category">${user.type || 'User'}</span>
                <h3 class="card-title">${user.login}</h3>
                <div class="card-score" style="font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 10px;">
                    ${user.score ? `<i class="fa-solid fa-star" style="color: #ffa657;"></i> Match Score: ${user.score.toFixed(1)}` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary" onclick="viewUserProfile('${user.login}')" style="padding: 8px 16px; font-size: 13px; flex: 1;">
                        <i class="fa-solid fa-eye"></i> View Profile
                    </button>
                    <button class="add-btn ${isFollowing ? 'following' : ''}" 
                            onclick="toggleFollow('${user.login}', this)"
                            style="${isFollowing ? 'background: var(--color-fg-default); color: white;' : ''}">
                        <i class="fa-solid fa-${isFollowing ? 'check' : 'plus'}"></i>
                    </button>
                </div>
            </div>
        `;

        // Add hover effect for overlay
        const imgWrapper = card.querySelector('.card-img-wrapper');
        const overlay = card.querySelector('.card-overlay');
        imgWrapper.addEventListener('mouseenter', () => overlay.style.opacity = '1');
        imgWrapper.addEventListener('mouseleave', () => overlay.style.opacity = '0');

        grid.appendChild(card);
    });
}

/**
 * View user profile - fetch detailed info and display
 */
async function viewUserProfile(username) {
    showLoading();

    // Fetch the full user details
    const userData = await fetchUserProfile(username);

    if (userData) {
        displaySingleUserProfile(userData);
    } else {
        showUserNotFound(username);
    }
}

/**
 * Display single user profile with full details and enhanced features
 */
async function displaySingleUserProfile(user) {
    // Fetch additional data for the user
    const [repos, followers, gists, following] = await Promise.all([
        fetchUserRepos(user.login),
        fetchUserFollowers(user.login),
        fetchUserGists(user.login),
        fetchUserFollowing(user.login)
    ]);

    // Calculate stats from repos
    const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
    const languages = [...new Set(repos.filter(r => r.language).map(r => r.language))];
    const accountAge = getAccountAge(user.created_at);
    const lastActive = getLastActive(user.updated_at);

    grid.innerHTML = `
        <div class="single-user-result" style="grid-column: 1 / -1;">
            <!-- User Profile Card -->
            <div class="user-profile-card" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 40px; margin-bottom: 30px;">
                <div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start;">
                    <!-- Avatar Section -->
                    <div style="text-align: center;">
                        <img src="${user.avatar_url}" alt="${user.login}" style="width: 150px; height: 150px; border-radius: 50%; border: 4px solid transparent; background: linear-gradient(#111, #111) padding-box, linear-gradient(135deg, #0969da, #8250df, #bf3989) border-box;">
                        <h2 style="margin-top: 20px; font-family: 'Orbitron', sans-serif; font-size: 1.5rem;">${user.name || user.login}</h2>
                        <p style="color: rgba(255,255,255,0.6); font-family: 'IBM Plex Mono', monospace;">@${user.login}</p>
                        <span style="display: inline-block; padding: 5px 15px; background: linear-gradient(135deg, ${user.type === 'Organization' ? '#bf3989, #8250df' : '#0969da, #8250df'}); border-radius: 20px; font-size: 0.8rem; margin-top: 10px;">${user.type}</span>
                        ${user.hireable ? `<div style="margin-top: 10px; padding: 5px 15px; background: linear-gradient(135deg, #2ea043, #7ee787); border-radius: 20px; font-size: 0.75rem;"><i class="fa-solid fa-briefcase"></i> Available for hire</div>` : ''}
                    </div>
                    
                    <!-- User Info Section -->
                    <div style="flex: 1; min-width: 300px;">
                        ${user.bio ? `<p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px; color: rgba(255,255,255,0.8);">${user.bio}</p>` : ''}
                        
                        <!-- Main Stats -->
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 20px; margin-bottom: 25px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                            <div style="text-align: center;">
                                <div style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 700; color: #58a6ff;">${user.public_repos || 0}</div>
                                <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: rgba(255,255,255,0.5);">Repositories</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 700; color: #f778ba;">${user.followers || 0}</div>
                                <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: rgba(255,255,255,0.5);">Followers</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 700; color: #7ee787;">${user.following || 0}</div>
                                <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: rgba(255,255,255,0.5);">Following</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 700; color: #ffa657;">${totalStars}</div>
                                <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: rgba(255,255,255,0.5);">Total Stars</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 700; color: #a5d6ff;">${totalForks}</div>
                                <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: rgba(255,255,255,0.5);">Total Forks</div>
                            </div>
                            ${user.public_gists ? `
                            <div style="text-align: center;">
                                <div style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; font-weight: 700; color: #d2a8ff;">${user.public_gists}</div>
                                <div style="font-family: 'IBM Plex Mono', monospace; font-size: 0.75rem; color: rgba(255,255,255,0.5);">Gists</div>
                            </div>
                            ` : ''}
                        </div>
                        
                        <!-- Account Info -->
                        <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 25px; padding: 15px 20px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
                            <div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 0.85rem;">
                                <i class="fa-solid fa-calendar-plus" style="color: #7ee787;"></i> 
                                <span>Joined ${accountAge}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 0.85rem;">
                                <i class="fa-solid fa-clock" style="color: #58a6ff;"></i> 
                                <span>Last active ${lastActive}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.6); font-size: 0.85rem;">
                                <i class="fa-solid fa-id-card" style="color: #ffa657;"></i> 
                                <span>ID: ${user.id}</span>
                            </div>
                        </div>
                        
                        <!-- Additional Info -->
                        <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 25px;">
                            ${user.location ? `<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7);"><i class="fa-solid fa-location-dot"></i> ${user.location}</div>` : ''}
                            ${user.company ? `<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7);"><i class="fa-solid fa-building"></i> ${user.company}</div>` : ''}
                            ${user.email ? `<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7);"><i class="fa-solid fa-envelope"></i> <a href="mailto:${user.email}" style="color: #58a6ff;">${user.email}</a></div>` : ''}
                            ${user.blog ? `<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7);"><i class="fa-solid fa-globe"></i> <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank" style="color: #58a6ff;">${user.blog}</a></div>` : ''}
                            ${user.twitter_username ? `<div style="display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,0.7);"><i class="fa-brands fa-twitter"></i> <a href="https://twitter.com/${user.twitter_username}" target="_blank" style="color: #1da1f2;">@${user.twitter_username}</a></div>` : ''}
                        </div>
                        
                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                            <a href="${user.html_url}" target="_blank" style="display: inline-flex; align-items: center; gap: 10px; padding: 12px 25px; background: linear-gradient(135deg, #0969da, #8250df); border-radius: 8px; color: #fff; text-decoration: none; font-family: 'Orbitron', sans-serif; font-weight: 600; transition: transform 0.3s ease;">
                                <i class="fa-brands fa-github"></i> View on GitHub
                            </a>
                            <button onclick="toggleFollow('${user.login}', this)" class="follow-btn ${cart.has(user.login) ? 'following' : ''}" style="padding: 12px 25px; background: ${cart.has(user.login) ? 'linear-gradient(135deg, #2ea043, #0969da)' : 'transparent'}; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: 600; cursor: pointer;">
                                <i class="fa-solid fa-${cart.has(user.login) ? 'check' : 'user-plus'}"></i> ${cart.has(user.login) ? 'Following' : 'Follow'}
                            </button>
                            <button onclick="shareProfile('${user.login}')" style="padding: 12px 25px; background: transparent; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: 600; cursor: pointer;">
                                <i class="fa-solid fa-share-nodes"></i> Share
                            </button>
                            <button onclick="searchInput.value=''; renderGrid(usersData);" style="padding: 12px 25px; background: transparent; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: 600; cursor: pointer;">
                                <i class="fa-solid fa-arrow-left"></i> Back to All Users
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Languages Used -->
            ${languages.length > 0 ? `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.3rem; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-code" style="color: #d2a8ff;"></i> Programming Languages (${languages.length})
                </h3>
                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                    ${languages.map(lang => `
                        <span style="padding: 8px 18px; background: ${getLanguageColor(lang)}22; border: 1px solid ${getLanguageColor(lang)}44; border-radius: 20px; font-size: 0.9rem; font-family: 'IBM Plex Mono', monospace; color: ${getLanguageColor(lang)};">
                            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${getLanguageColor(lang)}; margin-right: 8px;"></span>${lang}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Top Repositories Section -->
            ${repos && repos.length > 0 ? `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.3rem; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-code-branch" style="color: #7ee787;"></i> Top Repositories (${repos.length})
                </h3>
                <div style="display: grid; gap: 15px;">
                    ${repos.slice(0, 6).map(repo => `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; transition: all 0.3s ease;" onmouseover="this.style.borderColor='rgba(255,255,255,0.3)'; this.style.transform='translateX(5px)';" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'; this.style.transform='none';">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                                <a href="${repo.html_url}" target="_blank" style="font-family: 'Orbitron', sans-serif; font-size: 1.1rem; color: #58a6ff; text-decoration: none; display: flex; align-items: center; gap: 8px;">
                                    <i class="fa-solid fa-book"></i> ${repo.name}
                                    ${repo.fork ? '<span style="font-size: 0.7rem; padding: 2px 8px; background: rgba(255,255,255,0.1); border-radius: 10px;">Fork</span>' : ''}
                                </a>
                                <div style="display: flex; gap: 8px;">
                                    ${repo.language ? `<span style="padding: 4px 12px; background: ${getLanguageColor(repo.language)}33; border-radius: 15px; font-size: 0.75rem; font-family: 'IBM Plex Mono', monospace; color: ${getLanguageColor(repo.language)};">${repo.language}</span>` : ''}
                                    ${repo.archived ? '<span style="padding: 4px 12px; background: rgba(255,100,100,0.2); border-radius: 15px; font-size: 0.75rem; color: #ff6b6b;">Archived</span>' : ''}
                                </div>
                            </div>
                            ${repo.description ? `<p style="color: rgba(255,255,255,0.7); font-size: 0.9rem; line-height: 1.5; margin-bottom: 15px;">${repo.description}</p>` : '<p style="color: rgba(255,255,255,0.4); font-size: 0.9rem; margin-bottom: 15px;">No description provided</p>'}
                            <div style="display: flex; gap: 20px; flex-wrap: wrap; font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                                <span style="display: flex; align-items: center; gap: 5px;"><i class="fa-solid fa-star" style="color: #ffa657;"></i> ${repo.stargazers_count}</span>
                                <span style="display: flex; align-items: center; gap: 5px;"><i class="fa-solid fa-code-fork" style="color: #7ee787;"></i> ${repo.forks_count}</span>
                                <span style="display: flex; align-items: center; gap: 5px;"><i class="fa-solid fa-eye" style="color: #58a6ff;"></i> ${repo.watchers_count}</span>
                                ${repo.open_issues_count ? `<span style="display: flex; align-items: center; gap: 5px;"><i class="fa-solid fa-circle-dot" style="color: #f778ba;"></i> ${repo.open_issues_count} issues</span>` : ''}
                                <span style="display: flex; align-items: center; gap: 5px;"><i class="fa-solid fa-clock" style="color: #a5d6ff;"></i> Updated ${formatDate(repo.updated_at)}</span>
                                ${repo.license ? `<span style="display: flex; align-items: center; gap: 5px;"><i class="fa-solid fa-scale-balanced" style="color: #d2a8ff;"></i> ${repo.license.spdx_id || repo.license.name}</span>` : ''}
                            </div>
                            ${repo.topics && repo.topics.length > 0 ? `
                            <div style="margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px;">
                                ${repo.topics.slice(0, 5).map(topic => `
                                    <span style="padding: 3px 10px; background: rgba(88, 166, 255, 0.15); border-radius: 12px; font-size: 0.7rem; color: #58a6ff;">#${topic}</span>
                                `).join('')}
                            </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
                ${repos.length > 6 ? `
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${user.html_url}?tab=repositories" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 25px; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #58a6ff; text-decoration: none; font-size: 0.9rem;">
                        View all ${user.public_repos} repositories <i class="fa-solid fa-external-link"></i>
                    </a>
                </div>
                ` : ''}
            </div>
            ` : '<div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; text-align: center; color: rgba(255,255,255,0.5); margin-bottom: 30px;">No public repositories</div>'}
            
            <!-- Gists Section -->
            ${gists && gists.length > 0 ? `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.3rem; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-file-code" style="color: #d2a8ff;"></i> Public Gists (${gists.length})
                </h3>
                <div style="display: grid; gap: 15px;">
                    ${gists.slice(0, 4).map(gist => `
                        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; transition: all 0.3s ease;" onmouseover="this.style.borderColor='rgba(255,255,255,0.3)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'">
                            <a href="${gist.html_url}" target="_blank" style="font-family: 'Orbitron', sans-serif; font-size: 1rem; color: #d2a8ff; text-decoration: none; display: block; margin-bottom: 10px;">
                                <i class="fa-solid fa-file-code"></i> ${gist.description || Object.keys(gist.files)[0] || 'Untitled Gist'}
                            </a>
                            <div style="display: flex; gap: 15px; flex-wrap: wrap; font-size: 0.85rem; color: rgba(255,255,255,0.6);">
                                <span><i class="fa-solid fa-file"></i> ${Object.keys(gist.files).length} file(s)</span>
                                <span><i class="fa-solid fa-comment"></i> ${gist.comments} comments</span>
                                <span><i class="fa-solid fa-clock"></i> Created ${formatDate(gist.created_at)}</span>
                            </div>
                            <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;">
                                ${Object.keys(gist.files).slice(0, 3).map(filename => `
                                    <span style="padding: 3px 10px; background: rgba(210, 168, 255, 0.15); border-radius: 10px; font-size: 0.75rem; color: #d2a8ff; font-family: 'IBM Plex Mono', monospace;">${filename}</span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- Followers Section -->
            ${followers && followers.length > 0 ? `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.3rem; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-users" style="color: #f778ba;"></i> Followers (${user.followers || followers.length})
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px;">
                    ${followers.slice(0, 18).map(follower => `
                        <div onclick="viewUserProfile('${follower.login}')" style="text-align: center; cursor: pointer; padding: 15px 10px; border-radius: 12px; transition: all 0.3s ease; background: rgba(255,255,255,0.03);" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.transform='none';">
                            <img src="${follower.avatar_url}" alt="${follower.login}" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 8px; border: 2px solid rgba(255,255,255,0.2);">
                            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.8); word-break: break-all;">${follower.login}</div>
                        </div>
                    `).join('')}
                </div>
                ${user.followers > 18 ? `
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${user.html_url}?tab=followers" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 25px; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #f778ba; text-decoration: none; font-size: 0.9rem;">
                        View all ${user.followers} followers <i class="fa-solid fa-external-link"></i>
                    </a>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            <!-- Following Section -->
            ${following && following.length > 0 ? `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.3rem; margin-bottom: 25px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-user-group" style="color: #7ee787;"></i> Following (${user.following})
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 15px;">
                    ${following.slice(0, 12).map(followedUser => `
                        <div onclick="viewUserProfile('${followedUser.login}')" style="text-align: center; cursor: pointer; padding: 15px 10px; border-radius: 12px; transition: all 0.3s ease; background: rgba(255,255,255,0.03);" onmouseover="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.transform='none';">
                            <img src="${followedUser.avatar_url}" alt="${followedUser.login}" style="width: 50px; height: 50px; border-radius: 50%; margin-bottom: 8px; border: 2px solid rgba(255,255,255,0.2);">
                            <div style="font-size: 0.8rem; color: rgba(255,255,255,0.8); word-break: break-all;">${followedUser.login}</div>
                        </div>
                    `).join('')}
                </div>
                ${user.following > 12 ? `
                <div style="text-align: center; margin-top: 20px;">
                    <a href="${user.html_url}?tab=following" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 25px; background: transparent; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; color: #7ee787; text-decoration: none; font-size: 0.9rem;">
                        View all ${user.following} following <i class="fa-solid fa-external-link"></i>
                    </a>
                </div>
                ` : ''}
            </div>
            ` : ''}
            
            <!-- Quick Stats Summary -->
            <div style="background: linear-gradient(135deg, rgba(9,105,218,0.1), rgba(130,80,223,0.1), rgba(191,57,137,0.1)); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 30px; margin-bottom: 30px;">
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.3rem; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-chart-line" style="color: #58a6ff;"></i> Profile Summary
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 8px;">Engagement Rate</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 1.8rem; color: #58a6ff;">${calculateEngagementRate(user, totalStars)}%</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 5px;">Based on stars per repo</div>
                    </div>
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 8px;">Follower/Following Ratio</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 1.8rem; color: #f778ba;">${calculateFollowerRatio(user)}</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 5px;">${getFollowerRatioLabel(user)}</div>
                    </div>
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 8px;">Activity Score</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 1.8rem; color: #7ee787;">${calculateActivityScore(user, repos)}</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 5px;">Based on recent activity</div>
                    </div>
                    <div style="padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px;">
                        <div style="font-size: 0.85rem; color: rgba(255,255,255,0.5); margin-bottom: 8px;">Profile Completeness</div>
                        <div style="font-family: 'Orbitron', sans-serif; font-size: 1.8rem; color: #ffa657;">${calculateProfileCompleteness(user)}%</div>
                        <div style="font-size: 0.75rem; color: rgba(255,255,255,0.4); margin-top: 5px;">Profile info filled</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/* --- HELPER FUNCTIONS --- */

/**
 * Fetch user's following list
 */
async function fetchUserFollowing(username) {
    try {
        const response = await fetch(`${API_URL}/user/${username}/following`);
        const result = await response.json();

        if (result.success) {
            return result.data;
        }
        return [];
    } catch (error) {
        console.error("Error fetching following:", error);
        return [];
    }
}

/**
 * Get language color
 */
function getLanguageColor(language) {
    const colors = {
        JavaScript: '#f1e05a',
        TypeScript: '#3178c6',
        Python: '#3572A5',
        Java: '#b07219',
        'C++': '#f34b7d',
        C: '#555555',
        'C#': '#178600',
        Ruby: '#701516',
        Go: '#00ADD8',
        Rust: '#dea584',
        PHP: '#4F5D95',
        Swift: '#ffac45',
        Kotlin: '#A97BFF',
        Dart: '#00B4AB',
        HTML: '#e34c26',
        CSS: '#563d7c',
        Shell: '#89e051',
        Vue: '#41b883',
        React: '#61dafb',
        Scala: '#c22d40',
        Haskell: '#5e5086',
        Lua: '#000080',
        Perl: '#0298c3',
        R: '#198CE7',
        Julia: '#a270ba',
        Elixir: '#6e4a7e',
        Clojure: '#db5855'
    };
    return colors[language] || '#8b949e';
}

/**
 * Format date helper
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

/**
 * Get account age
 */
function getAccountAge(createdAt) {
    const date = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);

    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}${months > 0 ? `, ${months} month${months > 1 ? 's' : ''}` : ''} ago`;
    }
    return `${months} month${months > 1 ? 's' : ''} ago`;
}

/**
 * Get last active time
 */
function getLastActive(updatedAt) {
    return formatDate(updatedAt);
}

/**
 * Calculate engagement rate
 */
function calculateEngagementRate(user, totalStars) {
    if (!user.public_repos || user.public_repos === 0) return 0;
    const avgStarsPerRepo = totalStars / user.public_repos;
    // Scale to percentage (0-100)
    return Math.min(100, (avgStarsPerRepo * 10)).toFixed(1);
}

/**
 * Calculate follower ratio
 */
function calculateFollowerRatio(user) {
    if (!user.following || user.following === 0) return user.followers || 0;
    return (user.followers / user.following).toFixed(2);
}

/**
 * Get follower ratio label
 */
function getFollowerRatioLabel(user) {
    const ratio = calculateFollowerRatio(user);
    if (ratio > 10) return 'Highly influential';
    if (ratio > 5) return 'Very popular';
    if (ratio > 1) return 'Growing influence';
    if (ratio > 0.5) return 'Active networker';
    return 'Community explorer';
}

/**
 * Calculate activity score
 */
function calculateActivityScore(user, repos) {
    let score = 0;

    // Recent activity bonus
    const lastUpdate = new Date(user.updated_at);
    const daysSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 30;
    else if (daysSinceUpdate < 30) score += 20;
    else if (daysSinceUpdate < 90) score += 10;

    // Repo count bonus
    if (user.public_repos > 50) score += 25;
    else if (user.public_repos > 20) score += 20;
    else if (user.public_repos > 10) score += 15;
    else if (user.public_repos > 0) score += 10;

    // Recent repo updates
    if (repos && repos.length > 0) {
        const recentRepos = repos.filter(r => {
            const daysSince = (new Date() - new Date(r.updated_at)) / (1000 * 60 * 60 * 24);
            return daysSince < 30;
        });
        score += Math.min(25, recentRepos.length * 5);
    }

    // Gists bonus
    if (user.public_gists > 0) score += Math.min(10, user.public_gists * 2);

    return Math.min(100, score);
}

/**
 * Calculate profile completeness
 */
function calculateProfileCompleteness(user) {
    let filled = 0;
    const fields = ['name', 'bio', 'location', 'company', 'blog', 'email', 'twitter_username', 'avatar_url'];

    fields.forEach(field => {
        if (user[field] && user[field] !== '') filled++;
    });

    return Math.round((filled / fields.length) * 100);
}

/**
 * Share profile function
 */
function shareProfile(username) {
    const url = `https://github.com/${username}`;

    if (navigator.share) {
        navigator.share({
            title: `${username}'s GitHub Profile`,
            text: `Check out ${username}'s GitHub profile!`,
            url: url
        }).catch(console.error);
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            showToast(`📋 Profile link copied to clipboard!`);
        }).catch(() => {
            showToast(`🔗 ${url}`);
        });
    }
}

/**
 * Show user not found message
 */
function showUserNotFound(username) {
    grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
            <div style="background: rgba(255,100,100,0.1); border: 1px solid rgba(255,100,100,0.3); border-radius: 20px; padding: 40px; max-width: 500px; margin: 0 auto;">
                <i class="fa-solid fa-user-slash" style="font-size: 4rem; color: #ff6b6b; margin-bottom: 20px;"></i>
                <h3 style="font-family: 'Orbitron', sans-serif; font-size: 1.5rem; margin-bottom: 15px; color: #ff6b6b;">User Not Found</h3>
                <p style="color: rgba(255,255,255,0.7); margin-bottom: 25px;">No GitHub user found with username "<strong>${username}</strong>"</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 25px;">Please check the spelling and try again.</p>
                <button onclick="searchInput.value=''; renderGrid(usersData);" style="padding: 12px 30px; background: linear-gradient(135deg, #0969da, #8250df); border: none; border-radius: 8px; color: #fff; font-family: 'Orbitron', sans-serif; font-weight: 600; cursor: pointer;">
                    <i class="fa-solid fa-arrow-left"></i> Back to All Users
                </button>
            </div>
        </div>
    `;
}

// Search with debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const term = e.target.value.trim();

    if (term === '') {
        renderGrid(usersData);
        return;
    }

    searchTimeout = setTimeout(async () => {
        if (term.length < 2) {
            // Local search
            const filtered = usersData.filter(u =>
                u.login.toLowerCase().includes(term.toLowerCase())
            );
            renderGrid(filtered);
        } else {
            // Server search
            await handleSearch(term);
        }
    }, 500);
});

// Search on Enter key press
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(searchTimeout);
        const term = searchInput.value.trim();

        if (term === '') {
            showToast('⚠️ Please enter a username to search');
            return;
        }

        handleSearch(term);
    }
});
// Sort
sortSelect.addEventListener('change', (e) => {
    const method = e.target.value;
    let sorted = [...usersData];

    if (method === 'followers') {
        sorted.sort((a, b) => (b.followers || b.price) - (a.followers || a.price));
    } else if (method === 'repos') {
        sorted.sort((a, b) => (b.public_repos || 0) - (a.public_repos || 0));
    } else if (method === 'name') {
        sorted.sort((a, b) => a.login.localeCompare(b.login));
    }

    renderGrid(sorted);
});

// Category Filter
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.classList.contains('special')) return;
        e.preventDefault();

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        e.target.classList.add('active');

        const cat = e.target.dataset.category;
        if (!cat || cat === 'all') {
            renderGrid(usersData);
        } else {
            const filtered = usersData.filter(u => u.type === cat || u.category === cat);
            renderGrid(filtered);
        }
    });
});

// Load More
loadMoreBtn.addEventListener('click', fetchUsers);

// Follow Logic
function toggleFollow(username, btn) {
    if (cart.has(username)) {
        cart.delete(username);
        btn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        btn.style.background = 'transparent';
        btn.style.color = 'inherit';
        btn.classList.remove('following');
    } else {
        cart.add(username);
        btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        btn.style.background = 'var(--color-fg-default)';
        btn.style.color = 'white';
        btn.classList.add('following');
        showToast(`Following ${username}`);
    }
    updateFollowCount();
}

function updateFollowCount() {
    followCountEl.innerText = cart.size;
    followCountEl.classList.add('visible');
    followCountEl.style.transform = 'scale(1.4)';
    setTimeout(() => {
        followCountEl.style.transform = 'scale(1)';
    }, 200);
}

function showToast(msg) {
    const toastEl = document.getElementById('toast');
    toastEl.querySelector('.toast-message').innerText = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
}

function scrollToGrid() {
    const profileGrid = document.getElementById('profileGrid');
    const profilesSection = document.getElementById('profiles');

    // Try to scroll to the profiles section first, then the grid
    if (profilesSection) {
        profilesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (profileGrid) {
        profileGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* --- ADVANCED FEATURES --- */

// Show trending repos in a special section
async function showTrendingSection() {
    const trendingRepos = await fetchTrending('javascript', 'weekly');

    if (trendingRepos.length > 0) {
        const trendingHtml = `
            <section class="modal-section" style="margin: 30px 0;">
                <h3><i class="fa-solid fa-fire"></i> Trending JavaScript Repos This Week</h3>
                <div class="repo-list">
                    ${trendingRepos.slice(0, 5).map(repo => `
                        <div class="repo-item">
                            <div class="repo-header">
                                <a href="${repo.html_url}" target="_blank" class="repo-name">
                                    <i class="fa-solid fa-fire"></i> ${repo.full_name}
                                </a>
                                <span class="language-badge">${repo.language || 'Unknown'}</span>
                            </div>
                            ${repo.description ? `<div class="repo-description">${repo.description}</div>` : ''}
                            <div class="repo-meta">
                                <span><i class="fa-solid fa-star"></i> ${repo.stargazers_count.toLocaleString()}</span>
                                <span><i class="fa-solid fa-code-fork"></i> ${repo.forks_count.toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;

        const mainContent = document.querySelector('.main-content');
        if (mainContent && !document.getElementById('trendingSection')) {
            const div = document.createElement('div');
            div.id = 'trendingSection';
            div.innerHTML = trendingHtml;
            mainContent.insertBefore(div, document.querySelector('.featured-banner'));
        }
    }
}

/* --- EASTER EGGS --- */

function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0969da', '#bf3989', '#2ea043']
    });
}

function toggleTerminalMode() {
    document.body.classList.toggle('terminal-mode');
    isTerminalMode = !isTerminalMode;
}

// KONAMI CODE
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let cursor = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[cursor]) {
        cursor++;
        if (cursor === konamiCode.length) {
            activateKonami();
            cursor = 0;
        }
    } else {
        cursor = 0;
    }
});

function activateKonami() {
    alert("🎮 Cheat Code Activated: UNLIMITED STARS! 🌟");
    toggleTerminalMode();
    triggerConfetti();
    document.body.style.transition = "transform 1s";
    document.body.style.transform = "rotate(360deg)";
    setTimeout(() => {
        document.body.style.transform = "none";
    }, 1000);
}

/* --- INIT --- */
fetchUsers();

// Load trending section after 2 seconds
setTimeout(showTrendingSection, 2000);

// Add animation keyframe
const styleSheet = document.createElement("style");
styleSheet.innerText = `
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(styleSheet);
