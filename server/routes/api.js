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
        let query = {};

        // Check if the search term is exactly 8 digits (all numerical)
        if (/^\d{8}$/.test(searchTerm)) {
            query = { studentId: searchTerm }; // Exact match for student ID
        } else {
            query = { name: { $regex: searchTerm, $options: 'i' } }; // Partial, case-insensitive match for name
        }

        const students = await Student.find(query);

        if (students && students.length > 0) {
            res.json(students);
        } else {
            res.status(404).json({ message: 'Student not found.' }); // Return 404 if no student matches
        }
    } catch (error) {
        console.error('Error searching students:', error);
        res.status(500).json({ message: 'Error searching students.' });
    }
});

module.exports = router;

/* // server/routes/api.js
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

module.exports = router; */