// Elite Account Authentication Client
class EliteAuth {
    constructor() {
        const origin = (window.location && window.location.origin && window.location.origin !== 'null') ? window.location.origin : '';
        this.baseURL = origin || 'http://localhost:3000';
        this.accessToken = localStorage.getItem('elite_access_token');
        this.refreshToken = localStorage.getItem('elite_refresh_token');
        this.user = JSON.parse(localStorage.getItem('elite_user') || 'null');
        
        // Auto-refresh token
        this.setupTokenRefresh();
        
        // Check URL for tokens from email link
        this.checkUrlTokens();
    }

    // Check URL for tokens from email access link
    checkUrlTokens() {
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');
        
        if (accessToken && refreshToken) {
            this.setTokens(accessToken, refreshToken);
            
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
            
            // Get user info
            this.getUserProfile();
        }
    }

    // Set tokens and user data
    setTokens(accessToken, refreshToken, user = null) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        
        localStorage.setItem('elite_access_token', accessToken);
        localStorage.setItem('elite_refresh_token', refreshToken);
        
        if (user) {
            this.user = user;
            localStorage.setItem('elite_user', JSON.stringify(user));
        }
    }

    // Setup automatic token refresh
    setupTokenRefresh() {
        setInterval(async () => {
            if (this.accessToken && this.isTokenExpired(this.accessToken)) {
                await this.refreshAccessToken();
            }
        }, 60000); // Check every minute
    }

    // Check if token is expired
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return Date.now() >= payload.exp * 1000;
        } catch (error) {
            return true;
        }
    }

    // Login or register user
    async login(email, fullName) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, fullName })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            this.setTokens(data.accessToken, data.refreshToken, data.user);
            
            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    // Refresh access token
    async refreshAccessToken() {
        try {
            if (!this.refreshToken) {
                throw new Error('No refresh token');
            }

            const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            this.accessToken = data.accessToken;
            localStorage.setItem('elite_access_token', data.accessToken);
            
            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    // Get user profile
    async getUserProfile() {
        try {
            const response = await this.makeAuthenticatedRequest(`${this.baseURL}/api/user/profile`);
            
            if (response.ok) {
                const data = await response.json();
                this.user = data.user;
                localStorage.setItem('elite_user', JSON.stringify(data.user));
                return data.user;
            }
        } catch (error) {
            console.error('Get profile error:', error);
        }
        return null;
    }

    // Send email access link
    async sendAccessLink(email) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/send-link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                throw new Error('Failed to send access link');
            }

            return { success: true };
        } catch (error) {
            console.error('Send link error:', error);
            return { success: false, error: error.message };
        }
    }

    // Make authenticated request
    async makeAuthenticatedRequest(url, options = {}) {
        if (!this.accessToken) {
            throw new Error('No access token');
        }

        const headers = {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        let response = await fetch(url, {
            ...options,
            headers
        });

        // If token expired, try to refresh
        if (response.status === 403 && this.refreshToken) {
            const refreshSuccess = await this.refreshAccessToken();
            if (refreshSuccess) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
                response = await fetch(url, {
                    ...options,
                    headers
                });
            }
        }

        return response;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.accessToken && this.user;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Logout
    async logout() {
        try {
            if (this.refreshToken) {
                await fetch(`${this.baseURL}/api/auth/logout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: this.refreshToken })
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear all localStorage authentication keys EXCEPT site_access_key (clear last)
        localStorage.removeItem('elite_access_token');
        localStorage.removeItem('elite_refresh_token');
        localStorage.removeItem('elite_user');
        localStorage.removeItem('gate_email');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('approvedEmail');
        localStorage.removeItem('permanentAccess');
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_session');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userData');

        // Clear sessionStorage
        sessionStorage.clear();

        // Clear session cookies
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "elite_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Clear instance variables
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;

        // Force redirect to login page with replace to prevent back-button navigation
        window.location.replace('account-gate.html');

        // Clear site_access_key AFTER redirect has started to prevent security.js from blocking
        setTimeout(() => {
            localStorage.removeItem('site_access_key');
        }, 100);
    }

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.replace('account-gate.html');
            return false;
        }
        return true;
    }
}

// Initialize global auth instance
window.eliteAuth = new EliteAuth();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EliteAuth;
}
