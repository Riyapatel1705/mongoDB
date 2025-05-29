import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    _id: {
      type: String, // Using UUID for primary key
      default: uuidv4,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1.0,
      max: 5.0,
    },
    comment: {
      type: String,
      default: null,
    },
    created_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
    updated_at: {
      type: Date,
      default: null,
    },

    // Foreign key references
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    event_id: {
      type: String, // Since `Event` uses UUID string
      ref: "Event",
      required: true,
    },
  },
  {
    collection: "feedbacks",
    timestamps: false, // Controlled manually
  }
);

export const Feedback = mongoose.model("Feedback", feedbackSchema);
