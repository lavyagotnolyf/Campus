// server/routes/api.js
const express = require('express');
const router = express.Router();
const Student = require('../models/students'); // Import the Student model

// Route to search students
router.get('/search-student', async (req, res) => {
    const searchTerm = req.query.term;

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required.' });
    }

    try {
        const students = await Student.find({
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { studentId: { $regex: searchTerm, $options: 'i' } }
            ]
        });
        res.json(students);
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ message: 'Error searching students.' });
    }
});

module.exports = router;