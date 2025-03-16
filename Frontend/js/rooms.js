// DOM Elements
const roomTypeButtons = document.querySelectorAll('.room-type-btn');
const roomsContainer = document.querySelector('.rooms-container');
const searchRoomsBtn = document.getElementById('searchRoomsBtn');
const checkInInput = document.getElementById('checkIn');
const checkOutInput = document.getElementById('checkOut');
const roomModal = document.getElementById('roomModal');

// Initialize date inputs
function initializeDateInputs() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates for input fields
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    // Set min dates
    checkInInput.min = formatDate(today);
    checkOutInput.min = formatDate(tomorrow);
    
    // Set default values
    checkInInput.value = formatDate(today);
    checkOutInput.value = formatDate(tomorrow);
    
    // Update checkout min date when checkin changes
    checkInInput.addEventListener('change', () => {
        const newMinCheckout = new Date(checkInInput.value);
        newMinCheckout.setDate(newMinCheckout.getDate() + 1);
        checkOutInput.min = formatDate(newMinCheckout);
        
        if (new Date(checkOutInput.value) <= new Date(checkInInput.value)) {
            checkOutInput.value = formatDate(newMinCheckout);
        }
    });
}

// Load and display rooms
async function loadRooms() {
    try {
        const rooms = await apiService.rooms.getAll();
        updateRoomsDisplay(rooms);
    } catch (error) {
        showNotification('Error loading rooms', 'error');
    }
}

// Update rooms display
function updateRoomsDisplay(rooms) {
    if (!roomsContainer) return;
    
    // Group rooms by type
    const roomsByType = rooms.reduce((acc, room) => {
        if (!acc[room.type]) {
            acc[room.type] = [];
        }
        acc[room.type].push(room);
        return acc;
    }, {});
    
    // Create room type sections
    roomsContainer.innerHTML = Object.entries(roomsByType).map(([type, rooms]) => `
        <div class="room-type-section" data-type="${type.toLowerCase()}">
            <h2 class="type-title">${type}</h2>
            <div class="rooms-grid">
                ${rooms.map(room => createRoomCard(room)).join('')}
            </div>
        </div>
    `).join('');
    
    // Initialize AOS
    AOS.refresh();
    
    // Add event listeners to book buttons
    addBookButtonListeners();
}

// Create room card
function createRoomCard(room) {
    // Determine if room is available or booked
    const isBooked = room.status === 'booked';
    const statusBadge = isBooked ? 
        '<span class="room-badge booked">Booked</span>' : 
        '<span class="room-badge available">Available</span>';
    
    // Create book button based on availability
    const bookButton = isBooked ?
        '<button class="btn-secondary book-btn disabled" disabled>Already Booked</button>' :
        `<button class="btn-primary book-btn" data-room-id="${room._id}">Book Now</button>`;
    
    return `
        <div class="room-card ${isBooked ? 'booked' : 'available'}" data-type="${room.type.toLowerCase()}" data-aos="fade-up">
            <img src="${room.image || 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061'}" alt="${room.name}">
            <div class="room-details">
                <div class="room-status">
                    ${statusBadge}
                </div>
                <h3>${room.name}</h3>
                <p>${room.description}</p>
                <div class="room-meta">
                    <span class="price">$${room.price.toFixed(2)} / night</span>
                    <span class="capacity"><i class="fas fa-user"></i> ${room.capacity} guests</span>
                </div>
                <div class="room-amenities">
                    ${room.amenities.map(amenity => `
                        <span class="amenity"><i class="fas fa-check"></i> ${amenity}</span>
                    `).join('')}
                </div>
                ${bookButton}
            </div>
        </div>
    `;
}

// Handle room type filter
roomTypeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        roomTypeButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');
        
        const type = button.dataset.type;
        filterRooms(type);
    });
});

// Filter rooms by type
function filterRooms(type) {
    const sections = document.querySelectorAll('.room-type-section');
    sections.forEach(section => {
        if (type === 'all' || section.dataset.type === type) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Search available rooms
async function searchAvailableRooms() {
    const checkIn = checkInInput.value;
    const checkOut = checkOutInput.value;
    
    if (!checkIn || !checkOut) {
        showNotification('Please select check-in and check-out dates', 'error');
        return;
    }
    
    try {
        const availableRooms = await apiService.rooms.checkAvailability(checkIn, checkOut);
        updateRoomsDisplay(availableRooms);
        
        if (availableRooms.length === 0) {
            showNotification('No rooms available for selected dates', 'info');
        }
    } catch (error) {
        showNotification('Error checking room availability', 'error');
    }
}

// Add event listeners to book buttons
function addBookButtonListeners() {
    const bookButtons = document.querySelectorAll('.book-btn:not(.disabled)');
    bookButtons.forEach(button => {
        button.addEventListener('click', () => {
            const roomId = button.dataset.roomId;
            if (typeof handleBooking === 'function') {
                handleBooking(roomId);
            } else if (typeof showBookingModal === 'function') {
                showBookingModal(roomId);
            }
        });
    });
}

// Show booking modal
async function showBookingModal(roomId) {
    try {
        const room = await apiService.rooms.getById(roomId);
        
        const modalContent = roomModal.querySelector('.room-details');
        modalContent.innerHTML = `
            <div class="room-preview">
                <img src="${room.image}" alt="${room.name}">
                <div class="room-info">
                    <h3>${room.name}</h3>
                    <p>${room.description}</p>
                    <div class="price">$${room.price.toFixed(2)} / night</div>
                </div>
            </div>
            <form id="bookingForm" data-room-id="${roomId}" data-price="${room.price}">
                <div class="form-group">
                    <label for="guestName">Guest Name</label>
                    <input type="text" id="guestName" required>
                </div>
                <div class="form-group">
                    <label for="guestEmail">Email</label>
                    <input type="email" id="guestEmail" required>
                </div>
                <div class="form-group">
                    <label for="guestPhone">Phone</label>
                    <input type="tel" id="guestPhone" required>
                </div>
                <div class="form-group">
                    <label for="specialRequests">Special Requests</label>
                    <textarea id="specialRequests"></textarea>
                </div>
                <div class="booking-summary">
                    <div class="dates">
                        <p>Check-in: ${checkInInput.value}</p>
                        <p>Check-out: ${checkOutInput.value}</p>
                    </div>
                    <div class="total-amount">
                        Total: $<span id="totalAmount">${calculateTotalAmount(room.price)}</span>
                    </div>
                </div>
                <button type="submit" class="btn-primary">Confirm Booking</button>
            </form>
        `;
        
        // Add form submit handler
        const bookingForm = document.getElementById('bookingForm');
        bookingForm.addEventListener('submit', handleBookingSubmit);
        
        roomModal.style.display = 'block';
    } catch (error) {
        showNotification('Error loading room details', 'error');
    }
}

// Calculate total amount
function calculateTotalAmount(pricePerNight) {
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    return (pricePerNight * nights).toFixed(2);
}

// Handle booking submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const roomId = form.dataset.roomId;
    const guestName = document.getElementById('guestName').value;
    const guestEmail = document.getElementById('guestEmail').value;
    const guestPhone = document.getElementById('guestPhone').value;
    const specialRequests = document.getElementById('specialRequests').value;
    
    try {
        await apiService.bookings.create({
            roomId,
            checkIn: checkInInput.value,
            checkOut: checkOutInput.value,
            guestName,
            guestEmail,
            guestPhone,
            specialRequests,
            totalAmount: parseFloat(document.getElementById('totalAmount').textContent)
        });
        
        showNotification('Booking confirmed successfully!', 'success');
        roomModal.style.display = 'none';
        
        // Refresh available rooms
        searchAvailableRooms();
    } catch (error) {
        showNotification(error.message || 'Failed to confirm booking', 'error');
    }
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === roomModal) {
        roomModal.style.display = 'none';
    }
});

// Add search button event listener
if (searchRoomsBtn) {
    searchRoomsBtn.addEventListener('click', searchAvailableRooms);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeDateInputs();
    loadRooms();
}); 