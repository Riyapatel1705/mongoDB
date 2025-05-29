import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const { Schema } = mongoose;

const organizationSchema = new Schema(
  {
    _id: {
      type: String, // UUID for primary key
      default: uuidv4,
      required: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId, // Assuming Admin uses ObjectId
      ref: "Admin",
      required: true,
    },
    organization_name: {
      type: String,
      required: true,
      unique: true,
    },
    organization_type: {
      type: String,
      required: true,
    },
    contact_email: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
        },
        message: "Please provide a valid email address.",
      },
    },
    website: {
      type: String,
      default: null,
    },
  },
  {
    collection: "organizations",
    timestamps: true, // createdAt and updatedAt will be automatically added
  }
);

export const Organization = mongoose.model("Organization", organizationSchema);
