const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Booking = require('../models/Booking');
const Room = require('../models/Room');

// Get all bookings (Admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('room')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('room')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create booking
router.post('/', auth, async (req, res) => {
    try {
        const { roomId, checkIn, checkOut, guests, specialRequests, totalAmount, paymentMethod } = req.body;

        // Check if room exists
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Check if room is available for the dates
        const existingBooking = await Booking.findOne({
            room: roomId,
            status: 'confirmed',
            $or: [
                { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
            ]
        });

        if (existingBooking) {
            return res.status(400).json({ message: 'Room is not available for these dates' });
        }

        // Create booking with all required fields
        const booking = new Booking({
            user: req.user.id,
            room: roomId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            guests: {
                adults: guests.adults || 1,
                children: guests.children || 0
            },
            totalAmount: totalAmount || room.price,
            paymentMethod: paymentMethod || 'credit_card',
            paymentStatus: 'pending',
            status: 'confirmed',
            specialRequests: specialRequests
        });

        // Log the booking for debugging
        console.log('Attempting to save booking:', {
            user: req.user.id,
            room: roomId,
            checkIn,
            checkOut,
            guests,
            totalAmount: totalAmount || room.price,
            paymentMethod
        });

        // Save booking with proper error handling
        await booking.save();

        // Update room status
        room.status = 'BOOKED';
        await room.save();

        // Populate room data for response
        await booking.populate('room');
        
        res.status(201).json(booking);
    } catch (error) {
        console.error('Booking creation error:', error);
        
        // Check for validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ 
                message: 'Validation error', 
                details: messages 
            });
        }
        
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update booking status (Admin only)
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        // If booking is cancelled, make room available
        if (status === 'cancelled') {
            const room = await Room.findById(booking.room);
            room.status = 'AVAILABLE';
            await room.save();
        }

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user is authorized to cancel this booking
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Make room available
        const room = await Room.findById(booking.room);
        room.status = 'AVAILABLE';
        await room.save();

        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 