// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone_no: { type: String, required: true }, // Changed to String to match input
});

module.exports = mongoose.model('User', userSchema);