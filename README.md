# Hotel Management System

A modern and interactive hotel management system with features for room booking, food ordering, and staff management.

## Features

### Admin Panel
- Manage room bookings and availability
- Approve/reject food orders
- Track hotel revenue and analytics
- Manage users (block/unblock accounts)
- Upload hotel menus and room details with images
- Assign staff to tasks

### User Features
- Book rooms with real-time availability checking
- Order food from the hotel restaurant
- View hotel amenities and photos
- Cancel or modify reservations
- View booking history
- Schedule food delivery to rooms

### Security
- JWT-based authentication
- OTP verification for sign-ups
- Role-based access control

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Modern UI with animations
- Responsive design

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Nodemailer for OTP

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd hotel-management
```

2. Install backend dependencies:
```bash
cd Backend
npm install
```

3. Configure environment variables:
- Create a `.env` file in the Backend directory
- Add the following variables:
  ```
  PORT=5000
  MONGODB_URI=mongodb://localhost:27017/hotel_management
  JWT_SECRET=your_jwt_secret_key_here
  EMAIL_USER=your_email@gmail.com
  EMAIL_PASS=your_email_app_password
  NODE_ENV=development
  ```

4. Start MongoDB:
- Make sure MongoDB is installed and running on your system
- The default connection URL is: `mongodb://localhost:27017/hotel_management`

5. Start the backend server:
```bash
npm run dev
```

6. Open the frontend:
- Navigate to the Frontend directory
- Open `index.html` in a modern web browser

## API Documentation

### Authentication Endpoints
- POST /api/auth/register - Register a new user
- POST /api/auth/verify-otp - Verify OTP for registration
- POST /api/auth/login - User login
- GET /api/auth/me - Get current user details

### Room Endpoints
- GET /api/rooms - Get all rooms
- GET /api/rooms/:id - Get room details
- POST /api/rooms - Add new room (Admin only)
- PUT /api/rooms/:id - Update room details (Admin only)
- DELETE /api/rooms/:id - Delete room (Admin only)

### Booking Endpoints
- POST /api/bookings - Create new booking
- GET /api/bookings/user - Get user's bookings
- PUT /api/bookings/:id - Update booking
- DELETE /api/bookings/:id - Cancel booking

### Food Order Endpoints
- GET /api/food - Get menu items
- POST /api/food/order - Place food order
- GET /api/food/orders - Get user's food orders
- PUT /api/food/orders/:id - Update food order status (Admin/Staff only)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. #   H o t e l _ M a n a g e m e n t  
 