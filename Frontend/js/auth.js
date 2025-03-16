// Auth State Management
let currentUser = null;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');
const userProfileBtn = document.getElementById('userProfileBtn');
const userProfileDropdown = document.getElementById('userProfileDropdown');
const adminPanel = document.getElementById('adminPanel');

// Check Authentication Status
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        // Update UI based on user role
        document.body.classList.add('logged-in');
        document.body.classList.remove('logged-out');
        
        if (userProfileBtn) {
            const userNameElement = userProfileBtn.querySelector('.user-name');
            if (userNameElement) {
                userNameElement.textContent = user.name;
            }
        }

        // Show/hide admin panel based on role
        if (user.role === 'admin' && adminPanel) {
            adminPanel.style.display = 'block';
        } else if (adminPanel) {
            adminPanel.style.display = 'none';
        }

        // Update navigation items
        updateNavigation(user.role);
    } else {
        document.body.classList.add('logged-out');
        document.body.classList.remove('logged-in');
        if (userProfileDropdown) userProfileDropdown.classList.remove('show');
        if (adminPanel) adminPanel.style.display = 'none';
        updateNavigation('guest');
    }
};

// Update Navigation based on role
const updateNavigation = (role) => {
    const adminLinks = document.querySelectorAll('.admin-only');
    const userLinks = document.querySelectorAll('.user-only');
    const guestLinks = document.querySelectorAll('.guest-only');

    // More specific control of what's shown/hidden based on role
    if (role === 'admin') {
        // Admin sees admin links and user links, but not guest links
        adminLinks.forEach(link => link.style.display = 'block');
        userLinks.forEach(link => link.style.display = 'block');
        guestLinks.forEach(link => link.style.display = 'none');
    } else if (role === 'user' || (role === 'guest' && localStorage.getItem('token'))) {
        // Logged-in users see user links but not admin or guest links
        adminLinks.forEach(link => link.style.display = 'none');
        userLinks.forEach(link => link.style.display = 'block');
        guestLinks.forEach(link => link.style.display = 'none');
    } else {
        // Guest (not logged in) sees only guest links
        adminLinks.forEach(link => link.style.display = 'none');
        userLinks.forEach(link => link.style.display = 'none');
        guestLinks.forEach(link => link.style.display = 'block');
    }

    // Handle user profile dropdown visibility
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        if (role === 'admin' || (role === 'user' || role === 'guest') && localStorage.getItem('token')) {
            userProfile.style.display = 'flex'; // Changed from 'block' to 'flex'
            
            // Make sure the dropdown is initially hidden
            const dropdown = userProfile.querySelector('.dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
            
            // Setup click event for dropdown toggle
            userProfile.onclick = function(e) {
                e.stopPropagation();
                const dropdown = this.querySelector('.dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('show');
                }
            };
            
            // Close dropdown when clicking elsewhere
            document.addEventListener('click', function(e) {
                const dropdowns = document.querySelectorAll('.dropdown');
                dropdowns.forEach(dropdown => {
                    if (dropdown.classList.contains('show') && !dropdown.parentElement.contains(e.target)) {
                        dropdown.classList.remove('show');
                    }
                });
            });
        } else {
            userProfile.style.display = 'none';
        }
    }
};

// Handle Login
async function handleLogin(email, password, loginType = 'guest') {
    console.log(email, password, loginType);
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, loginType })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        console.log('Login successful:', data);

        // Store auth data
        sessionStorage.setItem('userToken', data.token);
        sessionStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        
        // Show success message
        showNotification('Login successful!', 'success');

        // Redirect based on role
        if (data.user.role === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }

    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message || 'Login failed', 'error');
    }
}

// Add login form event handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Get login type (guest or admin)
        let loginType = 'guest';
        const adminLoginRadio = document.getElementById('adminLogin');
        if (adminLoginRadio && adminLoginRadio.checked) {
            loginType = 'admin';
        }
        
        console.log('Login attempt:', email, password, loginType);
        
        // Call the handleLogin function with the form values
        await handleLogin(email, password, loginType);
    });
}

// Handle Signup
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('signupConfirmPassword').value;

            if (!name || !email || !password || !confirmPassword) {
                window.utils.showNotification('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                window.utils.showNotification('Passwords do not match', 'error');
                return;
            }

            // Use window.utils.apiCall for consistency
            const response = await window.utils.apiCall('auth/register', 'POST', { 
                name, 
                email, 
                password,
                role: 'guest' // Default role for signup
            }, false);
            
            window.utils.showNotification('Registration successful! Please login.', 'success');
            
            // Redirect to login page
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
        } catch (error) {
            console.error('Signup error:', error);
            window.utils.showNotification(error.message || 'Registration failed. Please try again.', 'error');
        }
    });
}

// Handle Logout
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Show notification
        window.utils.showNotification('Logged out successfully', 'success');

        // Update UI
        checkAuth();

        // Redirect to home page
        window.location.href = '/index.html';
    });
}

// Toggle user profile dropdown
if (userProfileBtn) {
    userProfileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userProfileDropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (userProfileDropdown && !userProfileDropdown.contains(e.target) && !userProfileBtn.contains(e.target)) {
            userProfileDropdown.classList.remove('show');
        }
    });
}

// Initialize auth check
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

// Check server connection status
async function checkServerStatus() {
    try {
        const response = await fetch('http://localhost:5000/health', {
            method: 'GET',
            timeout: 5000 // 5-second timeout
        });
        return response.ok;
    } catch (error) {
        console.error('Server connection check failed:', error);
        return false;
    }
}

// Initialize authentication
function initAuth() {
    // Check if AOS is available and initialize it
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true
        });
    }

    // Continue with normal auth flow
    checkAuth();
    
    // We're using the event listeners that are already set up above
    // No need to call setupLoginForm, setupSignupForm, or setupLogoutHandler
}

// Ensure menu toggle works for mobile
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Check if utils.js is loaded
if (window.utils) {
    checkAuth();
} else {
    console.error('Utils not loaded');
    alert('Service unavailable. Please try again later.');
}