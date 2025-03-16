const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const Food = require('../models/Food');
const FoodOrder = require('../models/FoodOrder');
const mongoose = require('mongoose');

// Create a model for the foods collection using the same schema as Food
const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    isVeg: { type: Boolean, default: false },
    image: { type: String, required: true }
});

// Create a model specifically for the foods collection - different name to avoid conflicts
const FoodItem = mongoose.model('foods', foodSchema);



// GET all food items from the foods collection
router.get('/items', async (req, res) => {
    try {
        console.log('Attempting to fetch food items from the foods collection...');
        const foodItems = await FoodItem.find();
        console.log(`Found ${foodItems.length} food items in the foods collection`);
        res.json(foodItems);
    } catch (err) {
        console.error('Error fetching food items:', err);
        res.status(500).json({ message: 'Server error while fetching food items' });
    }
});

// Process food orders - specific endpoint
router.post('/orders', auth, async (req, res) => {
    try {
        const { foodId, foodName, quantity, specialInstructions, deliveryTime, deliveryLocation, totalAmount } = req.body;
        
        console.log('Received food order:', { 
            userId: req.user.id,
            foodId, 
            foodName, 
            quantity, 
            specialInstructions, 
            deliveryTime, 
            deliveryLocation,
            totalAmount 
        });
        
        if (!foodId || !foodName || !quantity) {
            console.error('Missing required fields in food order');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if the foodId is a valid MongoDB ObjectId
        let foodItem;
        let foodObjectId;
        
        if (mongoose.Types.ObjectId.isValid(foodId)) {
            // Use the existing valid ObjectId
            foodObjectId = foodId;
            // Try to find the food item in the database
            foodItem = await FoodItem.findById(foodId);
        } else {
            // For sample/generated IDs, create a new ObjectId
            foodObjectId = new mongoose.Types.ObjectId();
        }
        
        // If we couldn't find the food item, create a dummy entry
        if (!foodItem) {
            console.log('Food item not found in database, creating temporary entry');
            
            // Create a temporary food document with valid ObjectId
            const tempFoodItem = new FoodItem({
                _id: foodObjectId,
                name: foodName,
                description: `Order for ${foodName}`,
                price: totalAmount / parseInt(quantity) || 10.00,
                category: 'Other',
                isVeg: false,
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
            });
            
            // Save the temporary food item
            try {
                foodItem = await tempFoodItem.save();
                console.log('Created temporary food item:', foodItem._id);
            } catch (saveError) {
                console.error('Failed to save temporary food item:', saveError);
                // Use the temporary item even if save fails
                foodItem = tempFoodItem;
            }
        }
        
        // Create new order
        const order = new FoodOrder({
            user: req.user.id,
            food: foodItem._id, // Now this is always a valid ObjectId
            foodName,
            quantity: parseInt(quantity),
            specialInstructions,
            deliveryTime,
            deliveryLocation,
            status: 'confirmed',
            orderedAt: new Date(),
            totalAmount: totalAmount || (foodItem.price * parseInt(quantity))
        });
        
        console.log('Order object created:', order);
        
        const savedOrder = await order.save();
        console.log('Order saved successfully:', savedOrder._id);
        res.status(201).json(savedOrder);
    } catch (error) {
        console.error('Error creating food order:', error);
        res.status(500).json({ message: 'Server error while creating order', error: error.message });
    }
});

// Get food by category
router.get('/category/:category', async (req, res) => {
    try {
        const food = await Food.find({ category: req.params.category });
        res.json(food);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Place food order with multiple items
router.post('/order', auth, async (req, res) => {
    try {
        const { items, roomNumber, specialInstructions } = req.body;

        // Fetch food items to get their prices
        const foodIds = items.map(item => item.foodId);
        const foodItems = await Food.find({ _id: { $in: foodIds } });
        
        // Create a map of food IDs to prices for quick lookup
        const foodPriceMap = {};
        foodItems.forEach(food => {
            foodPriceMap[food._id.toString()] = food.price;
        });

        const order = new FoodOrder({
            user: req.user.id,
            items: items.map(item => ({
                food: item.foodId,
                quantity: item.quantity,
                price: foodPriceMap[item.foodId]
            })),
            roomNumber,
            specialInstructions,
            status: 'pending',
            totalAmount: items.reduce((total, item) => {
                return total + (foodPriceMap[item.foodId] * item.quantity);
            }, 0)
        });

        await order.save();
        
        // Populate food items details
        await order.populate('items.food');
        
        res.status(201).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get order status
router.get('/order/:id', auth, async (req, res) => {
    try {
        const order = await FoodOrder.findById(req.params.id).populate('items.food');
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized to view this order
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all food items
router.get('/', async (req, res) => {
    try {
        const food = await Food.find();
        res.json(food);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add food item (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { 
            name, 
            description, 
            price, 
            category, 
            image, 
            isVegetarian, 
            preparationTime,
            spicyLevel,
            isAvailable
        } = req.body;

        const food = new Food({
            name,
            description,
            price,
            category,
            image,
            isVegetarian: isVegetarian || false,
            preparationTime: preparationTime || 20,
            spicyLevel: spicyLevel || 'Medium',
            isAvailable: isAvailable !== undefined ? isAvailable : true
        });

        await food.save();
        res.status(201).json(food);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update food item (Admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        const { 
            name, 
            description, 
            price, 
            category, 
            image, 
            isVegetarian, 
            preparationTime,
            spicyLevel,
            isAvailable
        } = req.body;

        if (name) food.name = name;
        if (description) food.description = description;
        if (price) food.price = price;
        if (category) food.category = category;
        if (image) food.image = image;
        if (isVegetarian !== undefined) food.isVegetarian = isVegetarian;
        if (preparationTime) food.preparationTime = preparationTime;
        if (spicyLevel) food.spicyLevel = spicyLevel;
        if (isAvailable !== undefined) food.isAvailable = isAvailable;

        await food.save();
        res.json(food);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete food item (Admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ message: 'Food item not found' });
        }

        await food.deleteOne();
        res.json({ message: 'Food item removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Health check route for food API - check DB connection
router.get('/health', async (req, res) => {
    try {
        // Test MongoDB connection
        if (mongoose.connection.readyState !== 1) {
            return res.status(500).json({ 
                status: 'error', 
                message: 'MongoDB not connected',
                readyState: mongoose.connection.readyState 
            });
        }
        
        // Test foods collection access
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        // Get count of food items
        const foodCount = await FoodItem.countDocuments();
        
        res.status(200).json({ 
            status: 'OK', 
            message: 'Food API is running', 
            database: mongoose.connection.name,
            collections: collectionNames,
            foodCount: foodCount
        });
    } catch (err) {
        console.error('Health check error:', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

module.exports = router; 