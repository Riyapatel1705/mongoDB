import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../db/models/User.js';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation.js';
export const register = async (req, res) => {
  const { first_name, last_name, email, password, created_by } = req.body;

  if (!validateUsername(first_name, last_name)) {
    return res.status(400).json({ error: 'Invalid username format.' });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Invalid password format.' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }

  try {
    const usernameExists = await User.findOne({ first_name, last_name });
    if (usernameExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ error: "This email's user already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      created_by
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully!' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Failed to register user!' });
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    console.log("Login endpoint hit for user:", user.email);

    res.json({ token });  // send token response once

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Database error' });
  }
};