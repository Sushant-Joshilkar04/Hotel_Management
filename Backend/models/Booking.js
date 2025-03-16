const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    guests: {
        adults: {
            type: Number,
            required: true,
            validate: {
                validator: Number.isInteger,
                message: 'Adults count must be a whole number'
            }
        },
        children: {
            type: Number,
            default: 0,
            validate: {
                validator: Number.isInteger,
                message: 'Children count must be a whole number'
            }
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'cash', 'bank_transfer'],
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
        default: 'confirmed'
    },
    specialRequests: String,
    foodOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodOrder'
    }],
    services: [{
        type: {
            type: String,
            enum: ['room_service', 'housekeeping', 'laundry', 'spa']
        },
        date: Date,
        status: {
            type: String,
            enum: ['requested', 'in_progress', 'completed'],
            default: 'requested'
        },
        notes: String
    }],
    cancellationReason: String,
    cancellationDate: Date,
    refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative']
    }
}, { timestamps: true });

// Validate dates before saving
bookingSchema.pre('validate', function(next) {
    // Skip validation if one of the dates is missing
    if (!this.checkIn || !this.checkOut) {
        return next();
    }
    
    // Ensure we're working with Date objects
    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);
    
    // Check if checkout is after checkin
    if (checkInDate >= checkOutDate) {
        this.invalidate('checkOut', 'Check-out date must be after check-in date');
        return next(new Error('Check-out date must be after check-in date'));
    }
    
    // Only check for past dates on new bookings (not on existing records)
    if (this.isNew) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison
        
        if (checkInDate < today) {
            this.invalidate('checkIn', 'Check-in date cannot be in the past');
            return next(new Error('Check-in date cannot be in the past'));
        }
    }
    
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;