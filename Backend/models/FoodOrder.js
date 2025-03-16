const mongoose = require('mongoose');

const foodOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    foodName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    specialInstructions: String,
    deliveryTime: {
        type: Date,
        required: true
    },
    deliveryLocation: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'preparing', 'delivered', 'cancelled'],
        default: 'confirmed'
    },
    orderedAt: {
        type: Date,
        default: Date.now
    },
    totalAmount: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('FoodOrder', foodOrderSchema);
