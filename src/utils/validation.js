import { User } from '../models/User.js';
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();


// Email validation
export const validateEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
};

// Password validation
export const validatePassword = (password) => {
  const regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,}$/;
  return regex.test(password);
};

// Username validation
export const validateUsername = (first_name, last_name) => {
  const regex1 = /^[a-zA-Z]{3,}$/;
  const regex2 = /^[a-zA-Z]{4,}$/;
  return regex1.test(first_name) && regex2.test(last_name);
};

// Check if email exists in MongoDB
export const checkEmailExists = async (email) => {
  const user = await User.findOne({ email });
  return !!user; // true if found
};

// Check if username (first + last) exists
export const checkUsernameExists = async (first_name, last_name) => {
  const user = await User.findOne({ first_name, last_name });
  return !!user;
};

export const sendOTPEmail = async (options) => {
  try {
    if (!options.to) {
      throw new Error("Recipient email (options.to) is undefined or empty.");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: options.to,
      subject: options.subject || "No Subject",
      text: options.text || "",
      html: options.html || "",
    };

    // Optional log
    console.log("Sending email to:", options.to);

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Email Sending Error:", error.message);
    throw error;
  }
};