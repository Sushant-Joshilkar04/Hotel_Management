// Add this function to load user's contact messages
async function loadUserMessages() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/contact/my-messages', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const messages = await response.json();
            const messagesList = document.getElementById('userMessages');
            
            if (messages.length === 0) {
                messagesList.innerHTML = '<p>No messages sent yet</p>';
                return;
            }

            messagesList.innerHTML = messages.map(msg => `
                <div class="message-card">
                    <h4>${msg.subject}</h4>
                    <p>${msg.message}</p>
                    <div class="message-footer">
                        <span class="status ${msg.status}">${msg.status}</span>
                        <span class="date">${new Date(msg.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}