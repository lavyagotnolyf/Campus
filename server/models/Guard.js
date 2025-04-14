const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const GuardSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // You can add other relevant fields for guards here
});

// Hash the password before saving
GuardSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Method to compare password
GuardSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Guard', GuardSchema, 'guards'); // 'guards' is the name of your collection