const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Guard = require('../models/Guard');

// Route for Guard Sign Up
router.post('/signup', async (req, res) => {
    const { firstName, lastName, username, password } = req.body;

    try {
        // Check if the username already exists
        let guard = await Guard.findOne({ username });
        if (guard) {
            return res.status(400).json({ errors: { username: 'Username already exists.' } });
        }

        guard = new Guard({
            firstName,
            lastName,
            username,
            password,
        });

        await guard.save();

        res.status(201).json({ message: 'Guard registered successfully.' });
    } catch (err) {
        console.error('Error during guard signup:', err);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// Route for Guard Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const guard = await Guard.findOne({ username });

        if (!guard) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await guard.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // If login is successful, you might want to return a token or session information here
        res.json({ message: 'Login successful!' });
    } catch (err) {
        console.error('Error during guard login:', err);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;