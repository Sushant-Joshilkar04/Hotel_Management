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
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        enum: ['Starters', 'Main Course', 'Desserts', 'Beverages'],
        required: true
    },
    image: {
        type: String,
        required: true
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    preparationTime: {
        type: Number, 
        default: 20
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    spicyLevel: {
        type: String,
        enum: ['Mild', 'Medium', 'Hot'],
        default: 'Medium'
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
        comment: String
    }],
    averageRating: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

// Calculate average rating before saving
foodSchema.pre('save', function(next) {
    if (this.reviews.length > 0) {
        this.averageRating = parseFloat(
            (this.reviews.reduce((acc, review) => acc + review.rating, 0) / this.reviews.length).toFixed(1)
        );
    }
    next();
});

module.exports = mongoose.model('Food', foodSchema);
