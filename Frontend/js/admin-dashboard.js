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
    // Load overview data
    await loadOverviewData();
    
    // Initialize charts
    initializeCharts();
    
    // Load initial rooms and food items
    loadRooms();
    loadFoodItems();
    
    // Setup report date options
    setupReportDateOptions();
}

// Load overview data
async function loadOverviewData() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load dashboard stats');
        
        const data = await response.json();
        
        // Update stats
        document.getElementById('totalBookings').textContent = data.totalBookings;
        document.getElementById('totalOrders').textContent = data.totalOrders;
        document.getElementById('totalRevenue').textContent = `$${data.totalRevenue.toFixed(2)}`;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showNotification('Failed to load dashboard statistics', 'error');
    }
}

// Initialize charts
function initializeCharts() {
    // Bookings chart
    const bookingsCtx = document.getElementById('bookingsChart').getContext('2d');
    new Chart(bookingsCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Room Bookings',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#b18b50',
                tension: 0.1
            }]
        }
    });
    
    // Orders chart
    const ordersCtx = document.getElementById('ordersChart').getContext('2d');
    new Chart(ordersCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Food Orders',
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: '#b18b50'
            }]
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
    
    // Add room button
    document.getElementById('addRoomBtn').addEventListener('click', () => {
        document.getElementById('addRoomModal').style.display = 'block';
    });
    
    // Add food button
    document.getElementById('addFoodBtn').addEventListener('click', () => {
        document.getElementById('addFoodModal').style.display = 'block';
    });
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Form submissions
    document.getElementById('addRoomForm').addEventListener('submit', handleAddRoom);
    document.getElementById('addFoodForm').addEventListener('submit', handleAddFood);
    document.getElementById('generateReport').addEventListener('click', generateReport);
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

// Handle adding new room
async function handleAddRoom(e) {
    e.preventDefault();
    
    const roomData = {
        roomNumber: document.getElementById('roomNumber').value,
        type: document.getElementById('roomType').value,
        price: document.getElementById('roomPrice').value,
        capacity: document.getElementById('roomCapacity').value
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            },
            body: JSON.stringify(roomData)
        });
        
        if (!response.ok) throw new Error('Failed to add room');
        
        showNotification('Room added successfully', 'success');
        document.getElementById('addRoomModal').style.display = 'none';
        loadRooms();
    } catch (error) {
        console.error('Error adding room:', error);
        showNotification('Failed to add room', 'error');
    }
}

// Handle adding new food item
async function handleAddFood(e) {
    e.preventDefault();
    
    const foodData = {
        name: document.getElementById('foodName').value,
        category: document.getElementById('foodCategory').value,
        price: document.getElementById('foodPrice').value,
        description: document.getElementById('foodDescription').value
    };
    
    try {
        const response = await fetch('http://localhost:5000/api/admin/food', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            },
            body: JSON.stringify(foodData)
        });
        
        if (!response.ok) throw new Error('Failed to add food item');
        
        showNotification('Food item added successfully', 'success');
        document.getElementById('addFoodModal').style.display = 'none';
        loadFoodItems();
    } catch (error) {
        console.error('Error adding food item:', error);
        showNotification('Failed to add food item', 'error');
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

// Setup report date options
function setupReportDateOptions() {
    const monthSelect = document.getElementById('reportMonth');
    const yearSelect = document.getElementById('reportYear');
    
    // Add months
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index + 1;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
    
    // Add years (current year and 2 years back)
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 2; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Generate monthly report
async function generateReport() {
    const month = document.getElementById('reportMonth').value;
    const year = document.getElementById('reportYear').value;
    
    if (!month || !year) {
        showNotification('Please select both month and year', 'warning');
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5000/api/admin/reports/${year}/${month}`, {
            headers: {
                'Authorization': `Bearer ${sessionStorage.getItem('userToken') || localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to generate report');
        
        const report = await response.json();
        renderReport(report);
    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('Failed to generate report', 'error');
    }
}

// Render report
function renderReport(report) {
    const container = document.getElementById('reportContainer');
    container.innerHTML = `
        <div class="report-summary">
            <h3>Monthly Report Summary</h3>
            <div class="report-stats">
                <div class="report-stat">
                    <h4>Total Bookings</h4>
                    <p>${report.totalBookings}</p>
                </div>
                <div class="report-stat">
                    <h4>Total Orders</h4>
                    <p>${report.totalOrders}</p>
                </div>
                <div class="report-stat">
                    <h4>Total Revenue</h4>
                    <p>$${report.totalRevenue.toFixed(2)}</p>
                </div>
            </div>
        </div>
    `;
} 