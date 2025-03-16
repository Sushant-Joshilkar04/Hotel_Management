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

// Get all rooms route
router.get('/rooms', auth, adminOnly, async (req, res) => {
    try {
        const rooms = await Room.find({}).sort({ number: 1 });
        res.json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ message: 'Error fetching rooms' });
    }
});

// Add new room
router.post('/rooms', auth, adminOnly, async (req, res) => {
    try {
        const { number, type, name, description, price, capacity, floor, amenities, images, status } = req.body;
        
        // Validate required fields
        if (!number || !type || !name || !price || !capacity || !floor) {
            return res.status(400).json({ 
                message: 'Please provide all required fields: number, type, name, price, capacity, floor' 
            });
        }

        // Check if room number already exists
        const existingRoom = await Room.findOne({ number });
        if (existingRoom) {
            return res.status(400).json({ message: 'Room number already exists' });
        }

        // Create new room matching the Room model schema
        const room = new Room({
            number,
            type,
            name,
            description,
            price,
            capacity,
            floor,
            amenities: amenities || [],
            images: images || [],
            status: status || 'AVAILABLE'
        });

        await room.save();
        res.status(201).json({ 
            message: 'Room added successfully',
            room 
        });
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ 
            message: error.message || 'Error adding room'
        });
    }
});

// Add new food item route
router.post('/food', auth, adminOnly, async (req, res) => {
    try {
        const { name, description, price, category, isVeg } = req.body;
        
        // Validate required fields
        if (!name || !description || !price || !category) {
            return res.status(400).json({ 
                message: 'Please provide all required fields: name, description, price, category' 
            });
        }

        // Create new food item
        const food = new Food({
            name,
            description,
            price: parseFloat(price),
            category,
            isVeg: isVeg === 'true' || isVeg === true,
            // Default image is set by the schema
        });

        const savedFood = await food.save();
        
        res.status(201).json({ 
            message: 'Food item added successfully',
            food: savedFood 
        });
    } catch (error) {
        console.error('Error adding food item:', error);
        res.status(500).json({ 
            message: error.message || 'Error adding food item' 
        });
    }
});

module.exports = router;
