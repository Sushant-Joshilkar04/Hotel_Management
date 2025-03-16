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
    
    const guestElements = document.querySelectorAll('.guest-only');
    const userElements = document.querySelectorAll('.user-only');
    const userNameElements = document.querySelectorAll('.user-name');
    const dropdown = document.getElementById('userProfileDropdown');
    
    if (userToken) {
        // User is logged in
        document.body.classList.add('logged-in');
        document.body.classList.remove('logged-out');
        
        // Show user elements, hide guest elements
        guestElements.forEach(el => el.style.display = 'none');
        userElements.forEach(el => el.style.display = 'flex');
        
        // Update user name and show appropriate menu items
        const displayName = userData.name || userData.email || 'User';
        userNameElements.forEach(el => el.textContent = displayName);
        
        // Update dropdown menu items based on user role
        if (dropdown) {
            dropdown.innerHTML = `
                <a href="profile.html"><i class="fas fa-user"></i> My Profile</a>
                <a href="bookings.html"><i class="fas fa-list"></i> My Bookings</a>
                <a href="orders.html"><i class="fas fa-utensils"></i> My Orders</a>
                ${userData.role === 'admin' ? `<a href="admin-dashboard.html"><i class="fas fa-cog"></i> Admin Dashboard</a>` : ''}
                <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
            `;
            
            // Add event listener to new logout button
            const logoutBtn = dropdown.querySelector('#logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', logout);
            }
        }
    } else {
        // User is not logged in
        document.body.classList.add('logged-out');
        document.body.classList.remove('logged-in');
        
        // Show guest elements, hide user elements
        guestElements.forEach(el => el.style.display = 'flex');
        userElements.forEach(el => el.style.display = 'none');
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