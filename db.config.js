// db.config.js
const mongoose = require('mongoose');
require('dotenv').config()
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MongoURL);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    
  }
};

module.exports = {connectDB};
