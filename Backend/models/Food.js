const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
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
    category: {
        type: String,
        required: true,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Desserts']
    },
    isVeg: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        default: 'https://cdn.vectorstock.com/i/1000x1000/90/77/plate-fork-and-spoon-on-white-background-vector-20419077.webp'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Food', foodSchema);
