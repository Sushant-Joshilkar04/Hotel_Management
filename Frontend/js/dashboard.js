// Check authentication and role
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    initializeDashboard();
});

// Initialize Dashboard
const initializeDashboard = async () => {
    updateStats();
    initializeCharts();
    loadRecentActivity();
};

// Update Statistics
const updateStats = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const stats = await response.json();

        // Update stat cards
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = stats.totalRooms;
        document.querySelector('.stat-card:nth-child(1) .stat-detail').textContent = `${stats.occupiedRooms} Occupied`;
        
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = stats.activeGuests;
        document.querySelector('.stat-card:nth-child(2) .stat-detail').textContent = `${stats.newGuests} New Today`;
        
        document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = stats.foodOrders;
        document.querySelector('.stat-card:nth-child(3) .stat-detail').textContent = `${stats.pendingOrders} Pending`;
        
        document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = stats.totalBookings;
        document.querySelector('.stat-card:nth-child(4) .stat-detail').textContent = `${stats.newBookings} New Today`;
    } catch (error) {
        console.error('Error fetching stats:', error);
        showNotification('Error loading statistics', 'error');
    }
};

// Initialize Charts
const initializeCharts = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/charts', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const data = await response.json();

        // Occupancy Chart
        const occupancyCtx = document.getElementById('occupancyChart').getContext('2d');
        new Chart(occupancyCtx, {
            type: 'doughnut',
            data: {
                labels: ['Occupied', 'Available', 'Maintenance'],
                datasets: [{
                    data: [
                        data.occupancy.occupied,
                        data.occupancy.available,
                        data.occupancy.maintenance
                    ],
                    backgroundColor: [
                        '#2ecc71',
                        '#3498db',
                        '#e74c3c'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Room Occupancy'
                    }
                }
            }
        });

        // Bookings Chart
        const bookingsCtx = document.getElementById('bookingsChart').getContext('2d');
        new Chart(bookingsCtx, {
            type: 'bar',
            data: {
                labels: data.bookings.labels,
                datasets: [{
                    label: 'New Bookings',
                    data: data.bookings.data,
                    backgroundColor: '#3498db'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Monthly Bookings'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error loading charts:', error);
        showNotification('Error loading charts', 'error');
    }
};

// Load Recent Activity
const loadRecentActivity = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/admin/activity', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        const activities = await response.json();

        const activityList = document.querySelector('.activity-list');
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-details">
                    <p>${activity.description}</p>
                    <small>${formatDate(activity.timestamp)}</small>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading activities:', error);
        showNotification('Error loading recent activities', 'error');
    }
};

// Helper Functions
const getActivityIcon = (type) => {
    const icons = {
        booking: 'fa-calendar-check',
        food: 'fa-utensils',
        user: 'fa-user',
        room: 'fa-bed'
    };
    return icons[type] || 'fa-info-circle';
};

const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
};

// Refresh data periodically
setInterval(updateStats, 300000); // Every 5 minutes
setInterval(loadRecentActivity, 60000); // Every minute 