const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Log all requests for debugging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Handle all routes by serving the corresponding HTML file or fallback to index.html
app.get('*', (req, res) => {
    const requestedPath = req.path;
    const htmlPath = path.join(__dirname, requestedPath.endsWith('.html') ? requestedPath : `${requestedPath}.html`);
    
    // Check if the requested file exists
    try {
        if (require('fs').existsSync(htmlPath)) {
            return res.sendFile(htmlPath);
        }
    } catch (err) {
        console.error('Error checking for file:', err);
    }
    
    // Otherwise, send index.html
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`);
    console.log('Make sure the backend server is running on port 5000');
}); 