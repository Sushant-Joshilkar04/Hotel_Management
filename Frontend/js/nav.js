// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Toggle mobile menu
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }
    
    // User profile dropdown
    const userProfile = document.querySelector('.user-profile');
    const dropdown = document.getElementById('userProfileDropdown');
    
    if (userProfile && dropdown) {
        userProfile.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });
    }
    
    // Update user info if logged in
    updateUserInfo();
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Update user info in the navigation
function updateUserInfo() {
    const userToken = sessionStorage.getItem('userToken') || localStorage.getItem('token');
    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
    
    const userProfile = document.querySelector('.user-profile');
    const userNameElements = document.querySelectorAll('.user-name');
    const dropdown = document.getElementById('userProfileDropdown');
    
    if (userToken && userData) {
        // Update user name in navbar
        userNameElements.forEach(el => el.textContent = userData.name || 'User');
        
        // Update dropdown profile info
        if (dropdown) {
            const fullName = dropdown.querySelector('.user-full-name');
            const email = dropdown.querySelector('.user-email');
            if (fullName) fullName.textContent = userData.name || 'User';
            if (email) email.textContent = userData.email || '';
        }
        
        // Show user profile
        if (userProfile) {
            userProfile.style.display = 'block';
            
            // Setup dropdown toggle
            const trigger = userProfile.querySelector('.profile-trigger');
            if (trigger && dropdown) {
                trigger.onclick = (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('show');
                };
            }
        }
    }
}

// Get initials from name for avatar
function getInitials(name) {
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length === 1) {
        return name.charAt(0).toUpperCase();
    }
    
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Logout function
function logout() {
    // Clear tokens and user data
    sessionStorage.removeItem('userToken');
    localStorage.removeItem('token');
    sessionStorage.removeItem('userData');
    localStorage.removeItem('userData');
    
    // Update UI
    updateUserInfo();
    
    // Show notification
    if (typeof showNotification === 'function') {
        showNotification('You have been logged out successfully', 'info');
    }
    
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Handle navbar visibility on scroll
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Show/hide navbar based on scroll direction
    if (currentScroll > lastScroll && currentScroll > 100) {
        navbar.style.transform = 'translateY(-100%)';
    } else {
        navbar.style.transform = 'translateY(0)';
    }

    // Add background when scrolled
    if (currentScroll > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// Set active nav link based on current page
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinksArray = document.querySelectorAll('.nav-links a');

navLinksArray.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    }
});

// Add click outside listener to close dropdown
document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('userProfileDropdown');
    const userProfile = document.querySelector('.user-profile');
    
    if (dropdown && userProfile && !userProfile.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});