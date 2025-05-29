import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const EventSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  short_description: {
    type: String,
    default: null,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
  is_virtual: {
    type: Boolean,
    default: false,
    required: true,
  },
  address: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 250,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  image_url: {
    type: String,
  },
  postal_code: {
    type: String,
  },
  contact_details: {
    type: Schema.Types.Mixed, // for flexible JSON data
  },
  organization_name: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updated_at: {
    type: Date,
  },
}, {
  collection: 'events',
  versionKey: false
});

export const Event = model('Event', EventSchema);
