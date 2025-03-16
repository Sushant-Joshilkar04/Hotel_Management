const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');
const Room = require('./models/Room');
const Food = require('./models/Food');

// Sample Users
const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin'
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: bcrypt.hashSync('user123', 10),
        role: 'user'
    }
];

// Sample Rooms
const rooms = [
    {
        number: '101',
        type: 'Deluxe',
        name: 'Deluxe City View',
        description: 'Luxurious room with stunning city views',
        price: 200,
        capacity: 2,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304'],
        status: 'AVAILABLE',
        floor: 1
    },
    {
        number: '201',
        type: 'Suite',
        name: 'Executive Suite',
        description: 'Spacious suite with separate living area',
        price: 350,
        capacity: 3,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning', 'Living Room', 'Work Desk'],
        images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061'],
        status: 'AVAILABLE',
        floor: 2
    },
    {
        number: '301',
        type: 'Presidential',
        name: 'Presidential Suite',
        description: 'Ultimate luxury with panoramic views',
        price: 500,
        capacity: 4,
        amenities: ['WiFi', 'TV', 'Mini Bar', 'Air Conditioning', 'Living Room', 'Kitchen', 'Private Balcony'],
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b'],
        status: 'AVAILABLE',
        floor: 3
    }
];

// Sample Food Items
const foodItems = [
    {
        name: 'Classic Burger',
        description: 'Juicy beef patty with fresh vegetables',
        price: 15.99,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
        isVegetarian: false,
        preparationTime: 20,
        spicyLevel: 'Medium'
    },
    {
        name: 'Margherita Pizza',
        description: 'Fresh tomatoes, mozzarella, and basil',
        price: 18.99,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
        isVegetarian: true,
        preparationTime: 25,
        spicyLevel: 'Mild'
    },
    {
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with classic Caesar dressing',
        price: 12.99,
        category: 'Starters',
        image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9',
        isVegetarian: true,
        preparationTime: 15,
        spicyLevel: 'Mild'
    },
    {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with ganache',
        price: 8.99,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
        isVegetarian: true,
        preparationTime: 10,
        spicyLevel: 'Mild'
    }
];

// Function to populate database
async function populateDatabase() {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Room.deleteMany({});
        await Food.deleteMany({});

        // Add sample data
        await User.insertMany(users);
        await Room.insertMany(rooms);
        await Food.insertMany(foodItems);

        console.log('Sample data added successfully!');
        process.exit();
    } catch (error) {
        console.error('Error adding sample data:', error);
        process.exit(1);
    }
}

// Run the population script
populateDatabase(); 