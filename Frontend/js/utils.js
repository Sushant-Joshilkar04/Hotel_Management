// Utility functions for the application

// Define the API base URL
const API_BASE_URL = 'http://localhost:5000/api/';

// Show notification toast
function showNotification(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        // Create toast container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getIconForType(type)}"></i>
            <span>${message}</span>
        </div>
        <div class="toast-progress"></div>
    `;

    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    // Animate progress bar
    const progressBar = toast.querySelector('.toast-progress');
    progressBar.style.transition = `width ${duration}ms linear`;
    
    // Trigger reflow to ensure the transition starts properly
    void toast.offsetWidth;
    
    // Start animation
    progressBar.style.width = '0%';

    // Remove toast after duration
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => {
            toast.remove();
        }, 300); // Allow exit animation to complete
    }, duration);
}

// Get icon class based on notification type
function getIconForType(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

// Handle API errors consistently
function handleApiError(error, defaultMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    let errorMessage = defaultMessage;
    if (error.message) {
        errorMessage = error.message;
    }
    
    showNotification(errorMessage, 'error');
    
    // Handle unauthorized errors
    if (error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }
    
    return errorMessage;
}

// API call function
async function apiCall(endpoint, method = 'GET', data = null, requiresAuth = true, retryCount = 0) {
    try {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (requiresAuth) {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const options = {
            method,
            headers
        };
        
        // Add request body for non-GET requests
        if (method !== 'GET' && data) {
            options.body = JSON.stringify(data);
        }
        
        // Ensure endpoint doesn't start with a slash if base URL ends with one
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        const url = `${API_BASE_URL}${cleanEndpoint}`;
        
        console.log(`Making ${method} request to ${url} with options:`, options);
        
        try {
            const response = await fetch(url, options);
            
            console.log(`Response status: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                let errorMessage = 'Request failed';
                
                // Try to get error message from response
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                    // If we can't parse JSON, try to get text
                    try {
                        const errorText = await response.text();
                        if (errorText) {
                            // Only use the first 100 characters to avoid flooding logs
                            console.error('Error response text:', errorText.substring(0, 100));
                        }
                    } catch (textError) {
                        console.error('Error getting response text:', textError);
                    }
                }
                
                throw {
                    message: errorMessage,
                    status: response.status
                };
            }
            
            // Return null for 204 No Content
            if (response.status === 204) {
                return null;
            }
            
            const responseData = await response.json();
            console.log('Response data:', responseData);
            return responseData;
        } catch (fetchError) {
            // If there's a network error and we haven't retried too many times, try again
            if (fetchError instanceof TypeError && 
                fetchError.message.includes('Failed to fetch') && 
                retryCount < 2) {
                
                console.log(`Connection failed, retrying (${retryCount + 1}/2)...`);
                // Wait a bit before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
                return apiCall(endpoint, method, data, requiresAuth, retryCount + 1);
            }
            throw fetchError;
        }
    } catch (error) {
        console.error('API Call Error:', error);
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            // Network error (server down, CORS issue, etc.)
            showNotification('Network error. Please check if the backend server is running on port 5000.', 'error');
        }
        throw error;
    }
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Check if an element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Add these utils to window object for global access
window.utils = {
    showNotification,
    handleApiError,
    apiCall,
    formatDate,
    formatCurrency,
    isInViewport,
    API_BASE_URL
}; 