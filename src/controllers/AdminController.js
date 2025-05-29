import { Admin } from "../db/models/Admin.js";
import jwt from 'jsonwebtoken';

export const registerAdmin = async (req, res) => {
  try {
    const { Admin_id, name, role, email } = req.body;

    // Validate required fields
    if (!Admin_id || !name || !role) {
      return res.status(400).json({ message: "Admin_id, name, and role are required." });
    }

    // Log inputs
    console.log("Registering admin with data:", { Admin_id, name, role, email });

    // Check if admin with Admin_id or email already exists (optional but recommended)
    const existingAdmin = await Admin.findOne({ $or: [{ Admin_id }, { email }] });
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin with this ID or email already exists" });
    }

    // Create admin
    const admin = await Admin.create({ Admin_id, name, role, email });

    return res.status(200).json({ message: "Admin created successfully", admin });

  } catch (err) {
    console.error("Error in registerAdmin:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const loginAdmin = async (req, res) => {
  const { Admin_id, email } = req.body;
  console.log("Login API Hit");

  if (!Admin_id || !email) {
    return res.status(400).json({ message: "Admin_id and email are required" });
  }

  try {
    // Find admin by Admin_id and email
    const admin = await Admin.findOne({ Admin_id, email });

    if (!admin) {
      return res.status(401).json({ message: "Admin does not exist or invalid credentials" });
    }

    const role = admin.role;

    const token = jwt.sign(
      { id: admin._id, Admin_id: admin.Admin_id, email: admin.email, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({ token });

  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.query; 

    if (!id) {
      return res.status(400).json({ message: "No admin ID has been provided" });
    }

    // Find admin by _id
    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "The admin does not exist" });
    }

    await Admin.findByIdAndDelete(id);

    return res.status(200).json({ message: "Admin has been deleted successfully!" });

  } catch (err) {
    console.error("Error deleting admin:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
