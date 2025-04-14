// server/server.js
require('dotenv').config({ path: __dirname + '/.env' });
console.log("Loaded from .env:", process.env.MONGO_URI);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db'); // Import database connection
const apiRoutes = require('./routes/api'); // Import API routes

const app = express();
const PORT = 5000; // You can choose a different port

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// server/server.js

// ... other imports
const path = require('path'); // Add this line at the top with other requires

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --> ADD THIS LINE: Serve static files from the 'public' directory <--
app.use(express.static(path.join(__dirname, '../public'))); // Assumes server.js is in server/ and public/ is one level up

// Use API Routes
app.use('/api', apiRoutes);

// Optional: Handle SPA fallback or direct HTML access if needed
// If someone navigates directly to /student-auth without .html
app.get('/student-auth', (req, res) => {
   res.sendFile(path.join(__dirname, '../public', 'student-auth.html'));
});
// Add similar lines for other HTML pages if needed


// Use API Routes
app.use('/api', apiRoutes); // All routes in api.js will be prefixed with /api


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});