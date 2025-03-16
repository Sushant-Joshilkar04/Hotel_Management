// Add this at the top of the file
const roomTypeImages = {
    'Deluxe': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
    'Suite': 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061',
    'Presidential': 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'
};

const roomDefaults = {
    'Deluxe': {
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
        basePrice: 200,
        baseCapacity: 2,
        description: 'Luxurious Deluxe room with modern amenities'
    },
    'Suite': {
        image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061',
        basePrice: 350,
        baseCapacity: 3,
        description: 'Spacious Suite with separate living area'
    },
    'Presidential': {
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
        basePrice: 500,
        baseCapacity: 4,
        description: 'Luxurious Presidential Suite with premium amenities'
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = '/login.html';
        return;
    }

    // Load dashboard stats
    await loadDashboardStats();
    
    // Setup event listeners
    setupEventListeners();
});

async function loadDashboardStats() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        
        // Update dashboard stats with animation
        animateCounter('totalBookings', data.totalBookings);
        animateCounter('totalOrders', data.totalOrders);
        animateCounter('totalRevenue', data.totalRevenue, true);
    } catch (error) {
        console.error('Error loading stats:', error);
        showNotification('Failed to load dashboard statistics', 'error');
    }
}

function setupEventListeners() {
    // Room Modal
    const addRoomBtn = document.getElementById('addRoomBtn');
    const addRoomModal = document.getElementById('addRoomModal');
    const addRoomForm = document.getElementById('addRoomForm');
    
    addRoomBtn.onclick = () => addRoomModal.style.display = 'block';
    
    // Food Modal
    const addFoodBtn = document.getElementById('addFoodBtn');
    const addFoodModal = document.getElementById('addFoodModal');
    const addFoodForm = document.getElementById('addFoodForm');
    
    addFoodBtn.onclick = () => addFoodModal.style.display = 'block';
        
    // Close Modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.onclick = function() {
            this.closest('.modal').style.display = 'none';
        }
    });

    // Handle form submissions
    addRoomForm.onsubmit = handleAddRoom;
    addFoodForm.onsubmit = handleAddFood;
}

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Update the handleAddRoom function
async function handleAddRoom(e) {
    e.preventDefault();
    
    const roomType = document.getElementById('roomType').value;
    
    // Create room data object matching the backend expectations
    const roomData = {
        number: document.getElementById('roomNumber').value,
        type: roomType,
        name: document.getElementById('roomName').value,
        description: document.getElementById('roomDescription').value,
        price: parseFloat(document.getElementById('roomPrice').value),
        capacity: parseInt(document.getElementById('roomCapacity').value),
        floor: parseInt(document.getElementById('roomFloor').value),
        amenities: Array.from(document.getElementById('roomAmenities').selectedOptions).map(opt => opt.value),
        images: [roomDefaults[roomType].image],
        status: 'AVAILABLE'
    };

    // Validate required fields before sending
    const requiredFields = ['number', 'type', 'name', 'price', 'capacity', 'floor'];
    const missingFields = requiredFields.filter(field => !roomData[field]);
    
    if (missingFields.length > 0) {
        showToast(`Missing required fields: ${missingFields.join(', ')}`, 'error');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/admin/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        await loadDashboardStats();
        await loadRooms(); // Refresh the rooms list
    } catch (error) {
        console.error('Error adding room:', error);
        showToast(error.message, 'error');
    }
}

// Update the handleAddFood function
async function handleAddFood(e) {
    e.preventDefault();
    
    const foodData = {
        name: document.getElementById('foodName').value,
        category: document.getElementById('foodCategory').value,
        price: parseFloat(document.getElementById('foodPrice').value),
        description: document.getElementById('foodDescription').value,
        imageUrl: document.getElementById('foodImageUrl').value || 
                 `https://source.unsplash.com/800x600/?${encodeURIComponent(document.getElementById('foodName').value)}+food`
    };

    try {
        const response = await fetch('http://localhost:5000/api/admin/food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(foodData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to add food item');
        }

        showToast('Food item added successfully');
        document.getElementById('addFoodModal').style.display = 'none';
        document.getElementById('addFoodForm').reset();
        await loadDashboardStats();
    } catch (error) {
        console.error('Error adding food item:', error);
        showToast(error.message, 'error');
    }
}

function animateCounter(elementId, finalValue, isCurrency = false) {
    const element = document.getElementById(elementId);
    const duration = 1000;
    const start = parseInt(element.innerText.replace(/[^0-9]/g, '')) || 0;
    const increment = (finalValue - start) / (duration / 16);
    let current = start;

    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= finalValue) || 
            (increment < 0 && current <= finalValue)) {
            current = finalValue;
        }
        
        element.innerText = isCurrency ? 
            `$${Math.round(current).toLocaleString()}` : 
            Math.round(current).toLocaleString();

        if (current !== finalValue) {
            requestAnimationFrame(animate);
        }
    };

    animate();
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
       
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
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

// Update the loadRooms function
async function loadRooms() {
    try {
        const token = sessionStorage.getItem('userToken') || localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/admin/rooms', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to load rooms');
        }
           
        const rooms = await response.json();
        renderRooms(rooms);
        showToast('Rooms loaded successfully', 'success');
    } catch (error) {
        console.error('Error loading rooms:', error);
        showToast(error.message || 'Failed to load rooms', 'error');
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

function updateRoomDefaults() {
    const roomType = document.getElementById('roomType').value;
    const defaults = roomDefaults[roomType];
    
    if (defaults) {
        document.getElementById('roomPrice').value = defaults.basePrice;
        document.getElementById('roomCapacity').value = defaults.baseCapacity;
        document.getElementById('roomDescription').value = defaults.description;
        document.getElementById('roomName').value = `${roomType} Room`;
    }
}

// Add toast notification styles
const toastStyles = `
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 2rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
    }
    .toast.show {
        opacity: 1;
        transform: translateY(0);
    }
    .toast.success { background: #2ecc71; }
    .toast.error { background: #e74c3c; }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = toastStyles;
document.head.appendChild(styleSheet);