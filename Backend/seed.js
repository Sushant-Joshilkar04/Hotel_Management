const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Room = require('./models/Room');
const Food = require('./models/Food');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Sample Data
const users = [
    {
        name: 'Admin User',
        email: 'admin@hotel.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true
    },
    {
        name: 'Staff Member',
        email: 'staff@hotel.com',
        password: 'staff123',
        role: 'staff',
        isVerified: true
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'guest123',
        role: 'guest',
        isVerified: true
    }
];

const rooms = [
    {
        number: '101',
        type: 'single',
        price: 100,
        description: 'Cozy single room with city view',
        amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar'],
        images: ['single-room-1.jpg', 'single-room-2.jpg'],
        capacity: 1,
        floor: 1
    },
    {
        number: '201',
        type: 'double',
        price: 150,
        description: 'Spacious double room with ocean view',
        amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'],
        images: ['double-room-1.jpg', 'double-room-2.jpg'],
        capacity: 2,
        floor: 2
    },
    {
        number: '301',
        type: 'suite',
        price: 300,
        description: 'Luxury suite with panoramic view',
        amenities: ['Wi-Fi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony', 'Jacuzzi'],
        images: ['suite-1.jpg', 'suite-2.jpg'],
        capacity: 4,
        floor: 3
    }
];

const foodItems = [
    {
        name: 'Classic Burger',
        description: 'Juicy beef patty with fresh vegetables',
        price: 15.99,
        category: 'lunch',
        type: 'non-veg',
        image: 'burger.jpg',
        preparationTime: 20,
        ingredients: ['beef', 'lettuce', 'tomato', 'cheese', 'bun'],
        nutritionalInfo: {
            calories: 650,
            protein: 35,
            carbohydrates: 45,
            fat: 25
        },
        spicyLevel: 'medium'
    },
    {
        name: 'Caesar Salad',
        description: 'Fresh romaine lettuce with classic Caesar dressing',
        price: 12.99,
        category: 'lunch',
        type: 'veg',
        image: 'caesar-salad.jpg',
        preparationTime: 15,
        ingredients: ['romaine lettuce', 'croutons', 'parmesan', 'caesar dressing'],
        nutritionalInfo: {
            calories: 320,
            protein: 10,
            carbohydrates: 25,
            fat: 15
        },
        spicyLevel: 'mild'
    },
    {
        name: 'Margherita Pizza',
        description: 'Classic Italian pizza with fresh basil',
        price: 18.99,
        category: 'dinner',
        type: 'veg',
        image: 'pizza.jpg',
        preparationTime: 25,
        ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'basil'],
        nutritionalInfo: {
            calories: 800,
            protein: 28,
            carbohydrates: 90,
            fat: 30
        },
        spicyLevel: 'mild'
    }
];

// Seed Database
const seedDatabase = async () => {
    try {
        // Clear existing data
        await User.deleteMany({});
        await Room.deleteMany({});
        await Food.deleteMany({});

        // Hash passwords and create users
        for (let user of users) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            await User.create(user);
        }
        

        await User.insertMany(hashedUsers);
        await Room.insertMany(rooms);
        await Food.insertMany(foodItems);

        console.log('Database seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase(); 