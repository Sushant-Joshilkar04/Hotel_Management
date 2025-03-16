// DOM Elements
const menuTabs = document.querySelectorAll('.menu-tab');
const menuGrid = document.querySelector('.food-items-grid') || document.querySelector('#foodItemsContainer');
const foodModal = document.getElementById('foodModal') || document.getElementById('orderModal');
const orderNowBtn = document.getElementById('orderNowBtn');

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dining page initialized');
    
    // Set default event time 1 hour from now
    setDefaultDeliveryTime();
    
    // Initialize the page
    initializeDiningPage();
    
    // Add event listeners for category filters
    setupCategoryFilters();
});

// Initialize the dining page
async function initializeDiningPage() {
    // Show loading state
    showLoadingState(true);
    
    try {
        // Load menu items
        const foodItems = await loadMenuItems();
        
        // Display all food items initially
        renderFoodItems(foodItems);
        
        // Hide loading state
        showLoadingState(false);
    } catch (error) {
        console.error('Error initializing dining page:', error);
        showErrorMessage('Failed to load the menu. Please try again later.');
        showLoadingState(false);
    }
}

// Load menu items from API or sample data
async function loadMenuItems() {
    console.log('Loading menu items from database...');
    
    try {
        // Fetch food items from the foods collection in the database
        console.log('Fetching food items from database...');
        const response = await fetch('http://localhost:5000/api/food/items');
        
        if (response.ok) {
            const data = await response.json();
            console.log('Successfully fetched food items from database:', data);
            
            // Store the API data for later use
            window.apiData = data;
            
            console.log(`Loaded ${data.length} food items from database`);
            return data;
        } else {
            console.warn('API request failed:', response.status);
            throw new Error('Failed to fetch menu items from database');
        }
    } catch (error) {
        console.warn('Error fetching from database, using sample data as fallback:', error.message);
        
        // Use sample data as fallback
        if (window.sampleFoodData && Array.isArray(window.sampleFoodData) && window.sampleFoodData.length > 0) {
            console.log(`Using sample data as fallback: ${window.sampleFoodData.length} items found`);
            window.apiData = window.sampleFoodData;
            return window.sampleFoodData;
        } else {
            // Create sample data if none is available
            console.log('Creating fallback sample data...');
            window.sampleFoodData = createSampleFoodData();
            window.apiData = window.sampleFoodData;
            return window.sampleFoodData;
        }
    }
}

// Render food items to the grid
function renderFoodItems(foodItems, category = 'all') {
    console.log(`Rendering ${foodItems.length} food items, filter: ${category}`);
    
    // Get the container
    const foodItemsGrid = document.getElementById('food-items-grid');
    const noItemsMessage = document.getElementById('no-food-items-message');
    
    // Clear previous items
    foodItemsGrid.innerHTML = '';
    
    // Filter items by category if needed
    let filteredItems = foodItems;
    if (category !== 'all') {
        filteredItems = foodItems.filter(item => 
            item.category && item.category.toLowerCase() === category.toLowerCase()
        );
    }
    
    // Check if we have items to display
    if (filteredItems.length === 0) {
        foodItemsGrid.style.display = 'none';
        noItemsMessage.style.display = 'flex';
        return;
    }
    
    // Show grid and hide no results message
    foodItemsGrid.style.display = 'grid';
    noItemsMessage.style.display = 'none';
    
    // Array to track failed image loads for analytics
    const failedImages = [];
    
    // Display filtered items
    filteredItems.forEach(item => {
        try {
            const foodItemElement = createFoodItemCard(item);
            foodItemsGrid.appendChild(foodItemElement);
        } catch (error) {
            console.error('Error creating food item card:', error, item);
            // Create a simplified fallback card for this item
            const fallbackItem = document.createElement('div');
            fallbackItem.className = 'food-item food-item-error';
            fallbackItem.innerHTML = `
                <div class="food-item-content">
                    <h3 class="food-item-name">${item.name || 'Food Item'}</h3>
                    <p class="food-item-description">Item details unavailable</p>
                    <div class="food-item-price">$${parseFloat(item.price || 0).toFixed(2)}</div>
                </div>
            `;
            foodItemsGrid.appendChild(fallbackItem);
        }
    });
    
    // Add event listeners for order buttons
    addOrderButtonListeners();
}

// Create a food item card
function createFoodItemCard(item) {
    // Use the enhanced item to ensure it has all required fields
    const enhancedItem = enhanceFoodItem(item);
    const { _id, name, description, price, category, isVeg, image } = enhancedItem;
    
    // Prepare description - truncate if too long
    const maxDescLength = 100;
    const displayDescription = description.length > maxDescLength 
        ? description.substring(0, maxDescLength) + '...' 
        : description;
    
    // Set default image URLs by category if needed
    let categoryDefaultImage = '';
    switch(category.toLowerCase()) {
        case 'breakfast':
            categoryDefaultImage = 'https://images.unsplash.com/photo-1533089860892-a9b969df67d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            break;
        case 'lunch':
            categoryDefaultImage = 'https://images.unsplash.com/photo-1547592180-85f173990888?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            break;
        case 'dinner':
            categoryDefaultImage = 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            break;
        case 'desserts':
            categoryDefaultImage = 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            break;
        default:
            categoryDefaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    }
    
    // Create the food item card HTML
    const foodItemElement = document.createElement('div');
    foodItemElement.className = 'food-item';
    foodItemElement.setAttribute('data-id', _id);
    foodItemElement.setAttribute('data-name', name);
    foodItemElement.setAttribute('data-price', price);
    foodItemElement.setAttribute('data-category', category);
    foodItemElement.setAttribute('data-is-veg', isVeg);
    
    // Create HTML content for the food item
    foodItemElement.innerHTML = `
        <div class="food-item-image loading">
            <img 
                src="${image}" 
                alt="${name}" 
                loading="lazy"
                crossorigin="anonymous"
                onload="this.parentElement.classList.remove('loading')"
                onerror="
                    this.onerror=null;
                    console.log('Image failed to load: ' + this.src);
                    // Try with added parameters for Unsplash if they're missing
                    if(this.src.includes('unsplash.com') && !this.src.includes('ixlib=')) {
                        console.log('Trying with added parameters');
                        this.src = this.src + (this.src.includes('?') ? '&' : '?') + 'ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                    } else {
                        // Use category-specific default
                        this.src='${categoryDefaultImage}';
                        console.log('Using category default: ' + '${categoryDefaultImage}');
                        this.parentElement.classList.remove('loading');
                    }
                "
            />
        </div>
        <div class="food-item-content">
            <div class="food-item-badge ${isVeg ? 'veg' : 'non-veg'}">
                ${isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            </div>
            <h3 class="food-item-name">${name}</h3>
            <p class="food-item-description">${displayDescription}</p>
            <div class="food-item-price">$${parseFloat(price).toFixed(2)}</div>
            <div class="food-item-category">${category}</div>
            <button class="food-item-order-btn" onclick="showFoodOrderModal('${_id}')">Order Now</button>
        </div>
    `;
    
    return foodItemElement;
}

// Update enhanceFoodItem function to ensure better image handling
function enhanceFoodItem(item) {
    // Create a copy of the item to avoid modifying the original
    const enhancedItem = {...item};
    
    // Generate an ID if not present
    if (!enhancedItem._id) {
        enhancedItem._id = 'item_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Validate and fix image URL
    if (!enhancedItem.image || typeof enhancedItem.image !== 'string' || !enhancedItem.image.startsWith('http')) {
        // Set default image based on category
        if (enhancedItem.category) {
            switch(enhancedItem.category.toLowerCase()) {
                case 'breakfast':
                    enhancedItem.image = 'https://images.unsplash.com/photo-1533089860892-a9b969df67d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                    break;
                case 'lunch':
                    enhancedItem.image = 'https://images.unsplash.com/photo-1547592180-85f173990888?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                    break;
                case 'dinner':
                    enhancedItem.image = 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                    break;
                case 'desserts':
                    enhancedItem.image = 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
                    break;
                default:
                    enhancedItem.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
            }
        } else {
            enhancedItem.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
        }
    } else if (enhancedItem.image.includes('unsplash.com') && !enhancedItem.image.includes('ixlib=')) {
        // Add needed parameters to Unsplash URLs if they're missing
        enhancedItem.image += (enhancedItem.image.includes('?') ? '&' : '?') + 'ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80';
    }
    
    // Ensure other required fields have values
    enhancedItem.name = enhancedItem.name || 'Unnamed Food Item';
    enhancedItem.description = enhancedItem.description || 'No description available';
    enhancedItem.price = enhancedItem.price || 9.99;
    enhancedItem.category = enhancedItem.category || 'Uncategorized';
    enhancedItem.isVeg = enhancedItem.isVeg !== undefined ? enhancedItem.isVeg : Math.random() > 0.5;
    
    return enhancedItem;
}

// Show food order modal
function showFoodOrderModal(foodId) {
    // Check if user is logged in
    if (!isLoggedIn()) {
        showNotification('Please log in to place an order', 'warning');
        // Redirect to login page after a slight delay
        setTimeout(() => {
            window.location.href = 'login.html?redirect=dining.html';
        }, 2000);
        return;
    }
    
    console.log('Opening order modal for food item:', foodId);
    
    // Try to find the food item
    let foodItem = null;
    
    // First, check if we have it in API data
    if (window.apiData && Array.isArray(window.apiData)) {
        foodItem = window.apiData.find(item => item._id === foodId);
    }
    
    // If not found in API data, check sample data
    if (!foodItem && window.sampleFoodData && Array.isArray(window.sampleFoodData)) {
        foodItem = window.sampleFoodData.find(item => item._id === foodId);
    }
    
    // If still not found, try to extract from the DOM
    if (!foodItem) {
        const foodElement = document.querySelector(`.food-item[data-id="${foodId}"]`);
        if (foodElement) {
            foodItem = {
                _id: foodId,
                name: foodElement.getAttribute('data-name'),
                price: foodElement.getAttribute('data-price'),
                isVeg: foodElement.getAttribute('data-is-veg') === 'true',
                category: foodElement.getAttribute('data-category'),
                description: foodElement.querySelector('.food-item-description')?.textContent || '',
                image: foodElement.querySelector('img')?.src || ''
            };
        }
    }
    
    // Enhance the food item to ensure all properties are set
    if (foodItem) {
        const enhancedItem = enhanceFoodItem(foodItem);
        
        // Set modal fields
        document.getElementById('food-id-input').value = enhancedItem._id;
        document.getElementById('food-modal-name').textContent = enhancedItem.name;
        document.getElementById('food-modal-description').textContent = enhancedItem.description;
        document.getElementById('food-modal-price').textContent = `$${parseFloat(enhancedItem.price).toFixed(2)}`;
        document.getElementById('food-modal-image').src = enhancedItem.image;
        document.getElementById('food-modal-badge').textContent = enhancedItem.isVeg ? 'Vegetarian' : 'Non-Vegetarian';
        document.getElementById('food-modal-badge').className = `food-modal-badge ${enhancedItem.isVeg ? 'veg' : 'non-veg'}`;
        
        // Reset form fields
        document.getElementById('quantity-input').value = 1;
        document.getElementById('special-instructions').value = '';
        setDefaultDeliveryTime();
        document.getElementById('delivery-location').value = '';
        
        // Show the modal
        document.getElementById('food-order-modal').style.display = 'block';
    } else {
        console.error('Food item not found:', foodId);
        showNotification('Error: Food item not found', 'error');
    }
}

// Check if user is logged in
function isLoggedIn() {
    // Check for user token in session storage or local storage
    return sessionStorage.getItem('userToken') !== null || 
           localStorage.getItem('token') !== null;
}

// Set default delivery time (1 hour from now)
function setDefaultDeliveryTime() {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    
    // Format the date and time for the input
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    document.getElementById('delivery-time').value = formattedDateTime;
}

// Handle food order form submission
document.getElementById('food-order-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form values
    const foodId = document.getElementById('food-id-input').value;
    const quantity = document.getElementById('quantity-input').value;
    const specialInstructions = document.getElementById('special-instructions').value;
    const deliveryTime = document.getElementById('delivery-time').value;
    const deliveryLocation = document.getElementById('delivery-location').value;
    
    // Get food name from modal
    const foodName = document.getElementById('food-modal-name').textContent;
    
    // Create order data
    const orderData = {
        foodId,
        foodName,
        quantity,
        specialInstructions,
        deliveryTime,
        deliveryLocation,
        orderedAt: new Date().toISOString()
    };
    
    // Submit order to API
    submitFoodOrder(orderData);
});

// Submit food order to API
async function submitFoodOrder(orderData) {
    try {
        // Get authentication token
        const token = sessionStorage.getItem('userToken') || localStorage.getItem('token');
        
        if (!token) {
            showNotification('You must be logged in to place an order', 'error');
            setTimeout(() => {
                window.location.href = 'login.html?redirect=dining.html';
            }, 2000);
            return;
        }
        
        // Validate order data
        if (!orderData.foodId || !orderData.foodName || !orderData.quantity) {
            showNotification('Order is missing required information', 'error');
            return;
        }
        
        // Ensure quantity is a number
        orderData.quantity = parseInt(orderData.quantity);
        if (isNaN(orderData.quantity) || orderData.quantity <= 0) {
            showNotification('Please enter a valid quantity', 'error');
            return;
        }
        
        console.log('Submitting order to backend:', orderData);
        
        // Show loading state
        showNotification('Processing your order...', 'info');
        
        // Send the order to the backend with the correct server URL/port
        let response;
        try {
            response = await fetch('http://localhost:5000/api/food/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
        } catch (networkError) {
            console.error('Network error connecting to server:', networkError);
            throw new Error('Cannot connect to server. Please ensure the backend is running.');
        }
        
        // Check for specific HTTP status codes
        if (response.status === 404) {
            console.error('API endpoint not found (404)');
            throw new Error('The order endpoint could not be found. Please contact support.');
        }
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server response error:', errorData);
            throw new Error(errorData.message || `Order failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Order response from server:', data);
        
        // Save the order to local storage for My Orders page
        saveOrderToLocalStorage(data);
        
        // Close the modal
        document.getElementById('food-order-modal').style.display = 'none';
        
        // Show success notification
        showNotification(`Your order for ${orderData.quantity}x ${orderData.foodName} has been placed successfully!`, 'success');
    } catch (error) {
        console.error('Error submitting order:', error);
        showNotification(`Failed to place order: ${error.message}`, 'error');
    }
}

// Save order to local storage for My Orders page
function saveOrderToLocalStorage(order) {
    // Get existing orders
    let myOrders = JSON.parse(localStorage.getItem('myFoodOrders') || '[]');
    
    // Add new order to the beginning of the array
    myOrders.unshift(order);
    
    // Keep only the last 10 orders to avoid localStorage size issues
    if (myOrders.length > 10) {
        myOrders = myOrders.slice(0, 10);
    }
    
    // Save back to localStorage
    localStorage.setItem('myFoodOrders', JSON.stringify(myOrders));
}

// Close modal when clicking the X
document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('food-order-modal').style.display = 'none';
});

// Close modal when clicking outside the modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById('food-order-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// Handle food category filter buttons
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.food-category-btn');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected category
            const category = this.getAttribute('data-category');
            
            // Filter food items
            if (window.apiData) {
                renderFoodItems(window.apiData, category);
            }
        });
    });
}

// Handle food order button click
function addOrderButtonListeners() {
    const orderButtons = document.querySelectorAll('.food-item-order-btn');
    orderButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const foodId = button.closest('.food-item').getAttribute('data-id');
            showFoodOrderModal(foodId);
        });
    });
}

// Show/hide loading state
function showLoadingState(isLoading) {
    const loadingIndicator = document.getElementById('loading-indicator');
    const skeletonContainer = document.getElementById('skeleton-container');
    const foodItemsGrid = document.getElementById('food-items-grid');
    
    if (isLoading) {
        loadingIndicator.style.display = 'flex';
        skeletonContainer.style.display = 'grid';
        foodItemsGrid.style.display = 'none';
    } else {
        loadingIndicator.style.display = 'none';
        skeletonContainer.style.display = 'none';
    }
}

// Show error message
function showErrorMessage(message) {
    const noItemsMessage = document.getElementById('no-food-items-message');
    const foodItemsGrid = document.getElementById('food-items-grid');
    
    // Hide food grid
    foodItemsGrid.style.display = 'none';
    
    // Update and show error message
    const errorTitle = noItemsMessage.querySelector('h3');
    const errorText = noItemsMessage.querySelector('p');
    
    if (errorTitle && errorText) {
        errorTitle.textContent = 'Error Loading Menu';
        errorText.textContent = message;
        noItemsMessage.style.display = 'flex';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if notification container exists, create if not
    let notificationContainer = document.getElementById('notification-container');
    
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Add close button functionality
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Auto close after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Create sample food data if none is available
function createSampleFoodData() {
    return [
        {
            _id: 'breakfast1',
            name: 'Classic Pancakes',
            description: 'Fluffy pancakes served with maple syrup and fresh berries',
            price: 8.99,
            category: 'Breakfast',
            isVeg: true,
            image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: 'breakfast2',
            name: 'English Breakfast',
            description: 'Eggs, bacon, sausage, beans, mushrooms, and toast',
            price: 12.99,
            category: 'Breakfast',
            isVeg: false,
            image: 'https://images.unsplash.com/photo-1533089860892-a9b969df67d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: 'lunch1',
            name: 'Caesar Salad',
            description: 'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan',
            price: 9.99,
            category: 'Lunch',
            isVeg: true,
            image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: 'lunch2',
            name: 'Gourmet Burger',
            description: 'Angus beef patty with cheese, lettuce, tomato, and special sauce',
            price: 14.99,
            category: 'Lunch',
            isVeg: false,
            image: 'https://images.unsplash.com/photo-1547592180-85f173990888?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: 'dinner1',
            name: 'Grilled Salmon',
            description: 'Fresh salmon fillet with lemon butter sauce and steamed vegetables',
            price: 19.99,
            category: 'Dinner',
            isVeg: false,
            image: 'https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: 'dinner2',
            name: 'Vegetable Pasta',
            description: 'Penne pasta with fresh vegetables in a creamy sauce',
            price: 15.99,
            category: 'Dinner',
            isVeg: true,
            image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: 'dessert1',
            name: 'Chocolate Lava Cake',
            description: 'Warm chocolate cake with a molten center, served with vanilla ice cream',
            price: 7.99,
            category: 'Desserts',
            isVeg: true,
            image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
            _id: 'dessert2',
            name: 'New York Cheesecake',
            description: 'Creamy cheesecake with a graham cracker crust and berry compote',
            price: 6.99,
            category: 'Desserts',
            isVeg: true,
            image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        }
    ];
} 