const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Room = require('../models/Room');
const Food = require('../models/Food');
const Booking = require('../models/Booking');
const FoodOrder = require('../models/FoodOrder');
const User = require('../models/User');

// Get Dashboard Statistics
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Fetch today's revenue separately
        const todayRevenueData = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: today },
                    status: 'confirmed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const todayRevenue = todayRevenueData.length > 0 ? todayRevenueData[0].total : 0;

        const [
            totalRooms,
            occupiedRooms,
            activeGuests,
            newGuests,
            foodOrders,
            pendingOrders
        ] = await Promise.all([
            Room.countDocuments(),
            Room.countDocuments({ status: 'BOOKED' }),
            Booking.countDocuments({ 
                checkIn: { $lte: new Date() },
                checkOut: { $gte: new Date() },
                status: 'confirmed'
            }),
            User.countDocuments({ createdAt: { $gte: today } }),
            FoodOrder.countDocuments(),
            FoodOrder.countDocuments({ status: 'pending' })
        ]);

        res.json({
            rooms: {
                total: totalRooms,
                occupied: occupiedRooms,
                available: totalRooms - occupiedRooms
            },
            guests: {
                active: activeGuests,
                new: newGuests
            },
            orders: {
                total: foodOrders,
                pending: pendingOrders
            },
            revenue: {
                today: todayRevenue
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent bookings
router.get('/recent-bookings', auth, adminOnly, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('room', 'number type name')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get recent users
router.get('/recent-users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Toggle user active status
router.put('/users/:id/toggle-status', auth, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Prevent deactivating self
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: 'Cannot deactivate your own account' });
        }
        
        user.isActive = !user.isActive;
        await user.save();
        
        res.json({
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get dashboard statistics
router.get('/dashboard-stats', auth, adminOnly, async (req, res) => {
    try {
        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        
        // Get total bookings for current month
        const totalBookings = await Booking.countDocuments({
            checkIn: { $gte: firstDayOfMonth }
        });
        
        // Get total food orders for current month
        const totalOrders = await FoodOrder.countDocuments({
            orderedAt: { $gte: firstDayOfMonth }
        });
        
        // Calculate total revenue
        const bookingsRevenue = await Booking.aggregate([
            {
                $match: {
                    checkIn: { $gte: firstDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" }
                }
            }
        ]);
        
        const ordersRevenue = await FoodOrder.aggregate([
            {
                $match: {
                    orderedAt: { $gte: firstDayOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalAmount" }
                }
            }
        ]);
        
        const totalRevenue = (bookingsRevenue[0]?.total || 0) + (ordersRevenue[0]?.total || 0);
        
        res.json({
            totalBookings,
            totalOrders,
            totalRevenue
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get monthly report
router.get('/reports/:year/:month', auth, adminOnly, async (req, res) => {
    try {
        const { year, month } = req.params;
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        
        // Get bookings for the month
        const bookings = await Booking.find({
            checkIn: { $gte: startDate, $lte: endDate }
        });
        
        // Get food orders for the month
        const orders = await FoodOrder.find({
            orderedAt: { $gte: startDate, $lte: endDate }
        });
        
        // Calculate statistics
        const totalBookings = bookings.length;
        const totalOrders = orders.length;
        const bookingsRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
        const ordersRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
        
        res.json({
            totalBookings,
            totalOrders,
            totalRevenue: bookingsRevenue + ordersRevenue,
            bookings,
            orders
        });
    } catch (error) {
        console.error('Error generating monthly report:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new room
router.post('/rooms', auth, adminOnly, async (req, res) => {
    try {
        const { roomNumber, type, price, capacity } = req.body;
        
        // Check if room number already exists
        const existingRoom = await Room.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: 'Room number already exists' });
        }
        
        const room = new Room({
            roomNumber,
            type,
            price,
            capacity
        });
        
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new food item
router.post('/food', auth, adminOnly, async (req, res) => {
    try {
        const { name, category, price, description } = req.body;
        
        const food = new Food({
            name,
            category,
            price,
            description
        });
        
        await food.save();
        res.status(201).json(food);
    } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
