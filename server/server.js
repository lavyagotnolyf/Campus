require('dotenv').config({ path: __dirname + '/../.env' });
console.log("Loaded from .env:", process.env.MONGO_URI);
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db'); // Import database connection
const apiRoutes = require('./routes/api'); // Import API routes
const authRoutes = require('./routes/auth'); // Import authentication routes // ADDED THIS LINE
const path = require('path');

const app = express();
const PORT = 5000;

// Connect to Database
connectDB();

// Middleware
const corsOptions = {
    origin: 'http://127.0.0.1:5500', // Replace with your Live Server URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to handle cookies or authorization headers
    optionsSuccessStatus: 204, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  };
  
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Use API Routes for student data
app.use('/api', apiRoutes);

// Use Authentication Routes for guards
app.use('/auth', authRoutes); // ADDED THIS LINE

// Optional: Handle SPA fallback or direct HTML access
app.get('/student-auth', (req, res) => {
   res.sendFile(path.join(__dirname, '../public', 'student-auth.html'));
});
// Add similar lines for other HTML pages if needed

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
