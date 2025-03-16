document.addEventListener('DOMContentLoaded', function() {
    // Check if user is admin
    checkAdminAccess();
    
    // Initialize dashboard
    initializeDashboard();
    
    // Setup event listeners
    setupEventListeners();
});

// Check admin access
function checkAdminAccess() {
    const token = sessionStorage.getItem('userToken') || localStorage.getItem('token');
    const userData = JSON.parse(sessionStorage.getItem('userData') || localStorage.getItem('userData') || '{}');
    
    if (!token || userData.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
}

// Initialize dashboard
async function initializeDashboard() {
    try {
        // Load overview data
        await loadOverviewData();
        
        // Load initial data based on current section
        const currentSection = window.location.hash.slice(1) || 'overview';
        await loadSectionData(currentSection);
        
        // Show current section
        showSection(currentSection);
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showToast('Failed to initialize dashboard', 'error');
    }
}

// Load overview data
async function loadOverviewData() {
    try {
        const [bookingsResponse, ordersResponse] = await Promise.all([
            fetch('http://localhost:5000/api/admin/bookings/stats', {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
                }
            }),
            fetch('http://localhost:5000/api/admin/food-orders/stats', {
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
                }
            })
        ]);

        if (!bookingsResponse.ok || !ordersResponse.ok) 
            throw new Error('Failed to load dashboard stats');

        const bookingsData = await bookingsResponse.json();
        const ordersData = await ordersResponse.json();

        // Calculate total revenue
        const totalRevenue = bookingsData.totalRevenue + ordersData.totalRevenue;

        // Update stats with animations
        animateCounter('totalBookings', bookingsData.totalBookings);
        animateCounter('totalOrders', ordersData.totalOrders);
        animateCounter('totalRevenue', totalRevenue, true);
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('Failed to load dashboard statistics', 'error');
    }
}

// Animate counter for better UX
function animateCounter(elementId, finalValue, isCurrency = false) {
    const element = document.getElementById(elementId);
    const duration = 1000; // Animation duration in milliseconds
    const start = parseInt(element.textContent.replace(/[^0-9.-]+/g, '')) || 0;
    const increment = (finalValue - start) / (duration / 16);
    let current = start;
    
    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= finalValue) || (increment < 0 && current <= finalValue)) {
            current = finalValue;
        }
        
        element.textContent = isCurrency 
            ? `$${current.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
            : Math.round(current).toString();
            
        if (current !== finalValue) {
            requestAnimationFrame(animate);
        }
    };
    
    animate();
}

// Load section data
async function loadSectionData(section) {
    switch (section) {
        case 'rooms':
            await loadRooms();
            break;
        case 'food':
            await loadFoodItems();
            break;
        case 'bookings':
            await loadBookings();
            break;
        case 'orders':
            await loadOrders();
            break;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu a')?.forEach(link => {
        link?.addEventListener('click', async function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // Update URL hash
            window.location.hash = section;
            
            // Load section data
            await loadSectionData(section);
            
            // Show section
            showSection(section);
        });
    });
    
    // Add room button
    const addRoomBtn = document.getElementById('addRoomBtn');
    const addRoomModal = document.getElementById('addRoomModal');
    if (addRoomBtn && addRoomModal) {
        addRoomBtn.addEventListener('click', () => {
            addRoomModal.style.display = 'block';
        });
    }
    
    // Add food button
    const addFoodBtn = document.getElementById('addFoodBtn');
    const addFoodModal = document.getElementById('addFoodModal');
    if (addFoodBtn && addFoodModal) {
        addFoodBtn.addEventListener('click', () => {
            addFoodModal.style.display = 'block';
        });
    }
    
    // Close modals
    document.querySelectorAll('.close')?.forEach(closeBtn => {
        closeBtn?.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Form submissions
    const addRoomForm = document.getElementById('addRoomForm');
    if (addRoomForm) {
        addRoomForm.addEventListener('submit', handleAddRoom);
    }
    
    const addFoodForm = document.getElementById('addFoodForm');
    if (addFoodForm) {
        addFoodForm.addEventListener('submit', handleAddFood);
    }

    // Image preview for room images
    const roomImagesInput = document.getElementById('roomImages');
    const roomImagesPreview = document.getElementById('roomImagesPreview');
    if (roomImagesInput && roomImagesPreview) {
        roomImagesInput.addEventListener('change', function() {
            roomImagesPreview.innerHTML = '';
            [...this.files].forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    roomImagesPreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    // Image preview for food image
    const foodImageInput = document.getElementById('foodImage');
    const foodImagePreview = document.getElementById('foodImagePreview');
    if (foodImageInput && foodImagePreview) {
        foodImageInput.addEventListener('change', function() {
            foodImagePreview.innerHTML = '';
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    foodImagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Show selected section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
        }
    });
}

// Show toast notification
function showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Handle adding new room
async function handleAddRoom(e) {
    e.preventDefault();
    
    try {
        const roomNumber = document.getElementById('roomNumber').value.trim();
        
        // Check if room number exists
        const checkResponse = await fetch(`http://localhost:5000/api/admin/rooms/check/${roomNumber}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            }
        });
        
        const checkData = await checkResponse.json();
        
        if (checkData.exists) {
            throw new Error('Room number already exists');
        }
        
        const roomData = {
            number: roomNumber,
            type: document.getElementById('roomType').value,
            name: document.getElementById('roomName').value.trim(),
            price: parseFloat(document.getElementById('roomPrice').value),
            capacity: parseInt(document.getElementById('roomCapacity').value),
            description: document.getElementById('roomDescription').value.trim(),
            amenities: Array.from(document.getElementById('roomAmenities').selectedOptions)
                .map(option => option.value),
            images: document.getElementById('roomImageUrls').value
                .split('\n')
                .map(url => url.trim())
                .filter(url => url.length > 0)
        };

        // Validate required fields
        if (!roomData.number) throw new Error('Room number is required');
        if (!roomData.name) throw new Error('Room name is required');
        if (!roomData.description) throw new Error('Room description is required');
        if (!roomData.price || roomData.price <= 0) throw new Error('Valid price is required');
        if (!roomData.capacity || roomData.capacity <= 0) throw new Error('Valid capacity is required');
        if (roomData.images.length === 0) throw new Error('At least one image URL is required');
        if (roomData.amenities.length === 0) throw new Error('At least one amenity must be selected');
        
        const response = await fetch('http://localhost:5000/api/admin/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            },
            body: JSON.stringify(roomData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to add room');
        }
        
        showToast('Room added successfully', 'success');
        document.getElementById('addRoomModal').style.display = 'none';
        document.getElementById('addRoomForm').reset();
        await loadRooms();
    } catch (error) {
        console.error('Error adding room:', error);
        showToast(error.message || 'Failed to add room');
    }
}

// Handle adding new food item
async function handleAddFood(e) {
    e.preventDefault();
    
    try {
        const foodData = {
            name: document.getElementById('foodName').value.trim(),
            category: document.getElementById('foodCategory').value,
            price: parseFloat(document.getElementById('foodPrice').value),
            description: document.getElementById('foodDescription').value.trim(),
            image: document.getElementById('foodImageUrl').value.trim()
        };

        // Validate required fields
        if (!foodData.name) throw new Error('Food name is required');
        if (!foodData.description) throw new Error('Food description is required');
        if (!foodData.price || foodData.price <= 0) throw new Error('Valid price is required');
        if (!foodData.image) throw new Error('Food image URL is required');
        
        const response = await fetch('http://localhost:5000/api/admin/food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            },
            body: JSON.stringify(foodData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to add food item');
        }
        
        showToast('Food item added successfully', 'success');
        document.getElementById('addFoodModal').style.display = 'none';
        document.getElementById('addFoodForm').reset();
        await loadFoodItems();
    } catch (error) {
        console.error('Error adding food item:', error);
        showToast(error.message || 'Failed to add food item');
    }
}

// Load rooms
async function loadRooms() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/rooms', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load rooms');
        
        const rooms = await response.json();
        renderRooms(rooms);
    } catch (error) {
        console.error('Error loading rooms:', error);
        showNotification('Failed to load rooms', 'error');
    }
}

// Load food items
async function loadFoodItems() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/food', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load food items');
        
        const foodItems = await response.json();
        renderFoodItems(foodItems);
    } catch (error) {
        console.error('Error loading food items:', error);
        showNotification('Failed to load food items', 'error');
    }
}

// Load bookings
async function loadBookings() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/bookings', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load bookings');
        
        const bookings = await response.json();
        renderBookings(bookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
        showToast('Failed to load bookings');
    }
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/food-orders', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load orders');
        
        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Failed to load orders');
    }
}

// Render bookings
function renderBookings(bookings) {
    const container = document.getElementById('bookingsList');
    if (!container) return;

    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <h3>Booking #${booking._id.slice(-6)}</h3>
                <span class="booking-status ${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-details">
                <p><i class="fas fa-user"></i> ${booking.user.name}</p>
                <p><i class="fas fa-bed"></i> ${booking.room.name} (${booking.room.number})</p>
                <p><i class="fas fa-calendar"></i> ${new Date(booking.checkIn).toLocaleDateString()} - ${new Date(booking.checkOut).toLocaleDateString()}</p>
                <p><i class="fas fa-dollar-sign"></i> ${booking.totalPrice.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Render orders
function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    if (!container) return;

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Order #${order._id.slice(-6)}</h3>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><i class="fas fa-user"></i> ${order.user.name}</p>
                <p><i class="fas fa-utensils"></i> ${order.items.length} items</p>
                <p><i class="fas fa-clock"></i> ${new Date(order.orderedAt).toLocaleString()}</p>
                <p><i class="fas fa-dollar-sign"></i> ${order.totalAmount.toFixed(2)}</p>
            </div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.food.name}</span>
                        <span>x${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Render rooms
function renderRooms(rooms) {
    const container = document.getElementById('roomsGrid');
    if (!container) return;

    container.innerHTML = rooms.map(room => `
        <div class="room-card">
            <div class="card-image">
                <img src="${room.images[0] || 'assets/images/room-placeholder.jpg'}" alt="${room.name}">
            </div>
            <div class="card-content">
                <h3 class="card-title">${room.name}</h3>
                <p class="card-price">$${room.price.toFixed(2)} per night</p>
                <p class="card-description">${room.description}</p>
                <div class="card-details">
                    <span><i class="fas fa-bed"></i> ${room.type}</span>
                    <span><i class="fas fa-user"></i> Capacity: ${room.capacity}</span>
                </div>
                <div class="card-amenities">
                    ${room.amenities.map(amenity => `
                        <span class="amenity-tag">${amenity}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Render food items
function renderFoodItems(items) {
    const container = document.getElementById('foodItemsGrid');
    if (!container) return;

    container.innerHTML = items.map(item => `
        <div class="food-card">
            <div class="card-image">
                <img src="${item.image || 'assets/images/food-placeholder.jpg'}" alt="${item.name}">
            </div>
            <div class="card-content">
                <h3 class="card-title">${item.name}</h3>
                <p class="card-price">$${item.price.toFixed(2)}</p>
                <p class="card-description">${item.description}</p>
                <span class="category-tag">${item.category}</span>
            </div>
        </div>
    `).join('');
} 