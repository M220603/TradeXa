// const mongoose = require('mongoose');
import mongoose from 'mongoose';

// Define the user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regular expression for valid email format
  },
  phone: {
    type: String,
    unique: true, // Keep unique but remove `required`
    sparse: true,
    match: /^[0-9]{10}$/, // 10-digit phone number validation
  },
  password: {
    type: String,
    minlength: 6, // Minimum length for password
    // required: function() { return !this.isOAuthUser; }, // Required if not an OAuth user
  },
  isOAuthUser: {
    type: Boolean,
    default: false, // Indicates if the user registered via Google OAuth
  },
  virtualPoints: {
    type: Number,
    default: 10000,
  },
  
  
  portfolio: [
    {
      stockSymbol: { type: String, required: true }, // e.g., AAPL, TSLA
      companyName: { type: String, required: true },
      shares: { type: Number, required: true, min: 0 },
      avgPurchasePrice: { type: Number, required: true, min: 0 },
    },
  ],
  transactionHistory: [
    {
      stockSymbol: { type: String, required: true },
      companyName: { type: String, required: true },
      type: { type: String, enum: ['buy', 'sell'], required: true },
      shares: { type: Number, required: true, min: 1 },
      pricePerShare: { type: Number, required: true, min: 0 },
      date: { type: Date, default: Date.now },
      
    },
  ],
  preferences: {
    darkMode: { type: Boolean, default: false },
    notifications: { type: Boolean, default: true },
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});


// Create and export the User model based on the schema
// module.exports = mongoose.model('User', userSchema);

const User = mongoose.model("User", userSchema);
export default User;




