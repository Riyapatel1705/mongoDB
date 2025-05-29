import { User } from '../db/models/User.js';

// Update user info
export const update = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, updated_by } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Please provide Id" });
  }

  try {
    const findUser = await User.findById(id);
    if (!findUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        first_name,
        last_name,
        email,
        updated_by,
        updated_at: Date.now(),
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(400).json({ message: "Error in updating user" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Internal server error", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Please provide ID" });
  }
  
  try {
    const findUser = await User.findById(id);
    if (!findUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    await findUser.deleteOne(); // deletes the found user document

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Internal server error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
