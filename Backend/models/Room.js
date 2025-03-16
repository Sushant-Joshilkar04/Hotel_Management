const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['Deluxe', 'Suite', 'Presidential'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amenities: [{
        type: String
    }],
    images: [{
        type: String
    }],
    capacity: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'BOOKED', 'MAINTENANCE'],
        default: 'AVAILABLE'
    },
    floor: {
        type: Number,
        required: true,
        default: 1
    },
    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    }
});

// Calculate average rating before saving
roomSchema.pre('save', function(next) {
    if (this.reviews.length > 0) {
        this.averageRating = this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length;
    }
    next();
});

module.exports = mongoose.model('Room', roomSchema); 