// API Service - Central file for all API calls
// This file uses the utility functions from utils.js

// Create a reusable API service object
const apiService = {
    // Authentication methods
    auth: {
        // Login method
        async login(email, password) {
            try {
                const data = await window.utils.apiCall('auth/login', 'POST', { email, password }, false);
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Register method
        async register(userData) {
            try {
                const data = await window.utils.apiCall('auth/register', 'POST', userData, false);
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Get user profile
        async getProfile() {
            try {
                const data = await window.utils.apiCall('auth/profile', 'GET');
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Logout method
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.utils.showNotification('Logged out successfully', 'success');
        }
    },
    
    // Rooms methods
    rooms: {
        // Get all rooms
        async getAll() {
            try {
                const data = await window.utils.apiCall('rooms', 'GET', null, false);
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Get room by ID
        async getById(id) {
            try {
                const data = await window.utils.apiCall(`rooms/${id}`, 'GET', null, false);
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Check room availability
        async checkAvailability(checkIn, checkOut, guests) {
            try {
                const data = await window.utils.apiCall('rooms/check-availability', 'POST', { 
                    checkIn, 
                    checkOut, 
                    guests 
                }, false);
                return data;
            } catch (error) {
                throw error;
            }
        }
    },
    
    // Bookings methods
    bookings: {
        // Create booking
        async create(bookingData) {
            try {
                const data = await window.utils.apiCall('bookings', 'POST', bookingData);
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Get user bookings
        async getMyBookings() {
            try {
                const data = await window.utils.apiCall('bookings/my-bookings', 'GET');
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Cancel booking
        async cancel(id) {
            try {
                const data = await window.utils.apiCall(`bookings/${id}`, 'DELETE');
                return data;
            } catch (error) {
                throw error;
            }
        }
    },
    
    // Food methods
    food: {
        // Get all food items
        async getAll() {
            try {
                const data = await window.utils.apiCall('food', 'GET', null, false);
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Get food by category
        async getByCategory(category) {
            try {
                const data = await window.utils.apiCall(`food/category/${category}`, 'GET', null, false);
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Place food order
        async placeOrder(orderData) {
            try {
                const data = await window.utils.apiCall('food/order', 'POST', orderData);
                return data;
            } catch (error) {
                throw error;
            }
        }
    },
    
    // Admin methods
    admin: {
        // Get dashboard stats
        async getDashboardStats() {
            try {
                const data = await window.utils.apiCall('admin/stats', 'GET');
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Get recent bookings
        async getRecentBookings() {
            try {
                const data = await window.utils.apiCall('admin/recent-bookings', 'GET');
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Get recent users
        async getRecentUsers() {
            try {
                const data = await window.utils.apiCall('admin/recent-users', 'GET');
                return data;
            } catch (error) {
                throw error;
            }
        },
        
        // Toggle user status
        async toggleUserStatus(userId) {
            try {
                const data = await window.utils.apiCall(`admin/users/${userId}/toggle-status`, 'PUT');
                return data;
            } catch (error) {
                throw error;
            }
        }
    }
};

// Make the API service available globally
window.apiService = apiService; 