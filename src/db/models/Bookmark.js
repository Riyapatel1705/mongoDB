import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const BookmarkSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',         // Reference to User model
    required: true,
  },
  event_id: {
    type: Schema.Types.ObjectId,
    ref: 'Event',        // Reference to Event model
    required: true,
  }
}, {
  collection: 'bookmarks', // Optional: specify collection name
  timestamps: true         // Optional: if you want createdAt/updatedAt fields
});

export const Bookmark = model('Bookmark', BookmarkSchema);
