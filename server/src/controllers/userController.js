import User from "../models/User.js";

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ message: "Avatar is required" });
    }

    if (!avatar.startsWith("/avatars/")) {
      return res.status(400).json({ message: "Invalid avatar path" });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update avatar error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
