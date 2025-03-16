document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Please login to send a message', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        try {
            const response = await fetch('http://localhost:5000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Message sent successfully!', 'success');
                contactForm.reset();
            } else {
                if (response.status === 401) {
                    showNotification('Please login again to send a message', 'error');
                    setTimeout(() => {
                        window.location.href = '/login.html';
                    }, 2000);
                } else {
                    showNotification(data.message || 'Failed to send message', 'error');
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showNotification('An error occurred while sending the message', 'error');
        }
    });

    // Pre-fill form if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.name && userData.email) {
        document.getElementById('name').value = userData.name;
        document.getElementById('email').value = userData.email;
    }

    // Notification system
    const showNotification = (message, type = 'info') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    };
});