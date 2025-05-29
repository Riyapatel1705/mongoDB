import mongoose from 'mongoose';
import { User } from './User.js'; // Import User model if needed (optional)

const adminSchema = new mongoose.Schema({
  Admin_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',          // Reference to User collection
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  }
}, {
  collection: 'admins'   // optional, specify collection name if you want
});

export const Admin = mongoose.model('Admin', adminSchema);
