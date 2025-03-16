// Booking Form Handler
const bookingModal = document.createElement('div');
bookingModal.className = 'modal';
bookingModal.id = 'bookingModal';
bookingModal.innerHTML = `
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Book a Room</h2>
        <form id="bookingForm">
            <div class="form-group">
                <label>Check-in Date</label>
                <input type="date" id="checkIn" required min="${new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <label>Check-out Date</label>
                <input type="date" id="checkOut" required>
            </div>
            <div class="form-group">
                <label>Adults</label>
                <input type="number" id="adults" min="1" max="4" value="1" required>
            </div>
            <div class="form-group">
                <label>Children</label>
                <input type="number" id="children" min="0" max="4" value="0">
            </div>
            <div class="form-group">
                <label>Special Requests</label>
                <textarea id="specialRequests"></textarea>
            </div>
            <div class="booking-summary">
                <h3>Booking Summary</h3>
                <p>Room Type: <span id="roomType"></span></p>
                <p>Price per Night: $<span id="pricePerNight"></span></p>
                <p>Total Nights: <span id="totalNights"></span></p>
                <p>Total Amount: $<span id="totalAmount"></span></p>
            </div>
            <button type="submit" class="btn-primary">Confirm Booking</button>
        </form>
    </div>
`;

document.body.appendChild(bookingModal);

// Initialize date inputs
const checkInInput = document.getElementById('checkIn');
const checkOutInput = document.getElementById('checkOut');
const adultsInput = document.getElementById('adults');
const childrenInput = document.getElementById('children');
const bookingSummary = document.querySelector('.booking-summary');

let selectedRoom = null;

// Function to check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists, false otherwise
}

// Handle Booking
const handleBooking = async (roomId) => {
    // Check if user is authenticated
    if (!checkAuthentication()) {
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification('Please log in to book a room', 'error');
        } else {
            alert('Please log in to book a room');
        }
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);
        return;
    }

    try {
        let room;
        if (window.utils && window.utils.apiCall) {
            room = await window.utils.apiCall(`rooms/${roomId}`, 'GET', null, false);
        } else {
            const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch room details');
            }
            room = await response.json();
        }
        
        // Check if room is available
        if (room.status === 'booked') {
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification('This room is already booked. Please select another room.', 'error');
            } else {
                alert('This room is already booked. Please select another room.');
            }
            return;
        }
        
        selectedRoom = room;

        // Update booking modal with room details
        document.getElementById('roomType').textContent = room.type;
        document.getElementById('pricePerNight').textContent = room.price;
        updateBookingSummary();

        // Show booking modal
        bookingModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching room details:', error);
        if (window.utils && window.utils.showNotification) {
            window.utils.showNotification('Error loading room details', 'error');
        } else {
            // Fallback if showNotification not available
            alert('Error loading room details');
        }
    }
};

// Update Booking Summary
const updateBookingSummary = () => {
    if (!selectedRoom) return;

    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights > 0) {
        document.getElementById('totalNights').textContent = nights;
        document.getElementById('totalAmount').textContent = (nights * selectedRoom.price).toFixed(2);
    }
};

// Event Listeners
checkInInput.addEventListener('change', () => {
    // Set minimum check-out date to day after check-in
    const minCheckOut = new Date(checkInInput.value);
    minCheckOut.setDate(minCheckOut.getDate() + 1);
    checkOutInput.min = minCheckOut.toISOString().split('T')[0];
    updateBookingSummary();
});

checkOutInput.addEventListener('change', updateBookingSummary);

// Close booking modal
const closeBookingModal = bookingModal.querySelector('.close');
closeBookingModal.addEventListener('click', () => {
    bookingModal.style.display = 'none';
});

// Handle Booking Form Submission
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check authentication again before submitting
        if (!checkAuthentication()) {
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification('Please log in to book a room', 'error');
            } else {
                alert('Please log in to book a room');
            }
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return;
        }

        if (!selectedRoom) {
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification('No room selected', 'error');
            } else {
                alert('No room selected');
            }
            return;
        }

        // Double-check room availability before submission
        try {
            // Fetch the latest room data to check availability
            let latestRoomData;
            if (window.utils && window.utils.apiCall) {
                latestRoomData = await window.utils.apiCall(`rooms/${selectedRoom._id}`, 'GET', null, false);
            } else {
                const response = await fetch(`http://localhost:5000/api/rooms/${selectedRoom._id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch latest room data');
                }
                latestRoomData = await response.json();
            }
            
            // If room is now booked, show error and prevent booking
            if (latestRoomData.status === 'booked') {
                if (window.utils && window.utils.showNotification) {
                    window.utils.showNotification('Sorry, this room was just booked by someone else. Please select another room.', 'error');
                } else {
                    alert('Sorry, this room was just booked by someone else. Please select another room.');
                }
                bookingModal.style.display = 'none';
                return;
            }
        } catch (error) {
            console.error('Error checking room availability:', error);
        }

        const checkIn = new Date(checkInInput.value);
        const checkOut = new Date(checkOutInput.value);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalAmount = parseFloat(document.getElementById('totalAmount').textContent);

        const bookingData = {
            roomId: selectedRoom._id,
            checkIn: window.utils.formatDate(checkInInput.value),
            checkOut: window.utils.formatDate(checkOutInput.value),
            guests: {
                adults: parseInt(adultsInput.value) || 1,
                children: parseInt(childrenInput.value) || 0
            },
            specialRequests: document.getElementById('specialRequests').value || '',
            totalAmount: totalAmount,
            paymentMethod: 'credit_card' // Default to credit card, add dropdown if multiple payment methods needed
        };

        // Validate dates
        if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
            window.utils.showNotification('Check-out date must be after check-in date', 'error');
            return;
        }

        console.log('Submitting booking with data:', bookingData);

        try {
            // Use the window.utils.apiCall for consistency if it exists
            let response;
            if (window.utils && window.utils.apiCall) {
                response = await window.utils.apiCall('bookings', 'POST', bookingData, true);
                window.utils.showNotification('Booking successful!', 'success');
            } else {
                // Fallback to direct fetch if utils is not available
                response = await fetch('http://localhost:5000/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(bookingData)
                });

                const data = await response.json();
                if (response.ok) {
                    alert('Booking successful!');
                } else {
                    throw new Error(data.message || 'Booking failed');
                }
            }

            // Close the booking modal
            bookingModal.style.display = 'none';
            
            // Refresh room display if the function exists
            if (typeof displayRooms === 'function') {
                displayRooms();
            }
            
            // Redirect to bookings page
            setTimeout(() => {
                window.location.href = '/bookings.html';
            }, 1500);
        } catch (error) {
            console.error('Booking error:', error);
            if (window.utils && window.utils.showNotification) {
                window.utils.showNotification(error.message || 'An error occurred during booking', 'error');
            } else {
                alert(error.message || 'An error occurred during booking');
            }
        }
    });
} 