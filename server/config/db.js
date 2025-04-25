// server/config/db.js
const mongoose = require('mongoose');
// Load environment variables from .env file
// Note: It's generally recommended to load dotenv once in your main server file (server.js)
// However, if this file needs access to process.env.MONGO_URI independently, keep this line.
// If dotenv is already loaded in server.js, this line is redundant but harmless.
require('dotenv').config();

const connectDB = async () => {
    try {
        console.log('MONGO_URI:', process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI, {
            // These options are deprecated and have no effect in Mongoose v6.0+
            // Removing them to clear the warnings.
            // useNewUrlParser: true,
            // useUnifiedTopology: true,

            // useCreateIndex: true, // May not be needed with newer Mongoose versions
            // useFindAndModify: false, // May not be needed with newer Mongoose versions
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
