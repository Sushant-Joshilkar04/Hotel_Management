const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { auth } = require('../middleware/auth');

// Submit contact form (requires authentication)
router.post('/', auth, async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = new Contact({
            user: req.user._id,
            name,
            email,
            subject,
            message
        });

        await contact.save();

        res.status(201).json({ 
            message: 'Message sent successfully',
            contact
        });
    } catch (error) {
        console.error('Contact submission error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Get all messages (admin only)
router.get('/', auth, async (req, res) => {
    try {
        const messages = await Contact.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

// Get user's messages
router.get('/my-messages', auth, async (req, res) => {
    try {
        const messages = await Contact.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your messages' });
    }
});

// Update message status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
    try {
        const { status } = req.body;
        const message = await Contact.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error updating message status' });
    }
});

module.exports = router;