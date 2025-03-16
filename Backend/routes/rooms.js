const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Get all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single room
router.get('/:id', async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add room (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { number, type, name, price, description, amenities, capacity, floor } = req.body;

        const room = new Room({
            number,
            type,
            name,
            price,
            description,
            amenities,
            capacity,
            floor,
            status: 'AVAILABLE'
        });

        await room.save();
        res.status(201).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update room (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const { number, type, name, price, description, amenities, capacity, floor, status } = req.body;

        if (number) room.number = number;
        if (type) room.type = type;
        if (name) room.name = name;
        if (price) room.price = price;
        if (description) room.description = description;
        if (amenities) room.amenities = amenities;
        if (capacity) room.capacity = capacity;
        if (floor) room.floor = floor;
        if (status) room.status = status;

        await room.save();
        res.json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete room (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        await room.deleteOne();
        res.json({ message: 'Room removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Check room availability
router.post('/check-availability', async (req, res) => {
    try {
        const { checkIn, checkOut, guests } = req.body;

        // Find rooms that are not booked for the given dates
        const bookedRooms = await Booking.find({
            $or: [
                {
                    checkIn: { $lte: checkOut },
                    checkOut: { $gte: checkIn }
                }
            ]
        }).distinct('room');

        // Find available rooms that can accommodate the guests
        const availableRooms = await Room.find({
            _id: { $nin: bookedRooms },
            capacity: { $gte: guests },
            status: 'AVAILABLE'
        });

        res.json(availableRooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 