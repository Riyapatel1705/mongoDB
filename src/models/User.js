import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    minlength: 3
  },
  last_name: {
    type: String,
    required: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  created_by: {
    type: String, // or ObjectId if referring to another collection
    required: true
  }
}, { timestamps: true });  // Adds createdAt and updatedAt automatically

export const User = mongoose.model('User', userSchema);