const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Deluxe', 'Suite', 'Presidential']
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String,
        required: true
    }],
    status: {
        type: String,
        enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE'],
        default: 'AVAILABLE'
    },
    floor: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);