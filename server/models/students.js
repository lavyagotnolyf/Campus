// server/models/Student.js
const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    studentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    rollNumber: { type: String },
    department: { type: String },
    photoUrl: { type: String },
    // faceDescriptors: [Array] // We'll add this later
});

module.exports = mongoose.model('Student', StudentSchema, 'students'); // 'students' is the name of your collection