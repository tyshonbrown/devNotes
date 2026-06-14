import User from "../models/User.js";
import Note from "../models/Note.js";
import Category from "../models/Category.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

// Create JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Signup User
export const signupUser = async (req, res) => {
  try {
    // get user info from request body
    const { username, email, password, confirmPassword } = req.body;

    // Check required fields
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check username length
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return res.status(400).json({
        message: "Username must be between 3 and 20 characters.",
      });
    }

    // Check username validity
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return res.status(400).json({
        message:
          "Username can only contain letters, numbers, underscores, and dashes.",
      });
    }

    // Check if username already in use
    const usernameExists = await User.findOne({ username: trimmedUsername });
    if (usernameExists) {
      return res.status(400).json({ message: "Username already in use" });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    // Confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check password length
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: cleanEmail });
    if (userExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      username: trimmedUsername,
      email: cleanEmail,
      password: hashedPassword,
    });

    // Default category for the new user
    const defaultCategory = await Category.create({
      user: user._id,
      name: "Getting Started",
    });

    // Default Welcome note for new user
    await Note.create({
      user: user._id,
      title: "Welcome to devNotes",
      category: defaultCategory._id,
      tags: ["welcome", "features", "devnotes"],
      tips: [
        {
          id: crypto.randomUUID(),
          text: "Use pinned notes to keep important notes at the top of your dashboard",
        },
        {
          id: crypto.randomUUID(),
          text: "Use categories and tags together to organize your coding notes better",
        },
      ],
      content: `
      <h2><span style="color: rgb(255, 255, 255);">Welcome to devNotes 👋</span></h2>

    <p><span style="color: rgb(255, 255, 255);">
      devNotes helps you create, organize, and manage your coding notes in one clean workspace.
    </span></p>

    <h3><span style="color: rgb(255, 255, 255);">What you can do</span></h3>

    <ul>
      <li><span style="color: rgb(255, 255, 255);">Create, edit, and delete notes</span></li>
      <li><span style="color: rgb(255, 255, 255);">Format notes with headings, bold text, lists, colors, links, and more</span></li>
      <li><span style="color: rgb(255, 255, 255);">Add code blocks for programming examples</span></li>
      <li><span style="color: rgb(255, 255, 255);">Organize notes with categories and tags</span></li>
      <li><span style="color: rgb(255, 255, 255);">Pin important notes to keep them easy to find</span></li>
      <li><span style="color: rgb(255, 255, 255);">Search notes by title, content, category, or tags</span></li>
      <li><span style="color: rgb(255, 255, 255);">Add tips for common coding problems</span></li>
    </ul>

    <h3><span style="color: rgb(255, 255, 255);">Example Code Block</span></h3>

    <pre><code class="language-javascript">const note = {
  title: "My First Note",
  category: "JavaScript",
  tags: ["arrays", "functions"],
};

console.log(note.title);</code></pre>

    <p><span style="color: rgb(255, 255, 255);">
      Start by editing this note or creating a new using the New Note button at the top of the sidebar.
    </span></p>
    `,
      isPinned: true,
      lastViewedAt: null,
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to signup user" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    // Get email and password from request body
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare password
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to login user",
    });
  }
};

// Update username
export const updateUsername = async (req, res) => {
  try {
    // Get name from request
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check username length
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      return res.status(400).json({
        message: "Username must be between 3 and 20 characters.",
      });
    }

    // Check username validity
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
      return res.status(400).json({
        message:
          "Username can only contain letters, numbers, underscores, and dashes.",
      });
    }

    // Update name and save
    user.username = trimmedUsername;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update name",
    });
  }
};

// Update user's email
export const updateEmail = async (req, res) => {
  try {
    // Get email from request
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        message: "Please enter a valid email",
      });
    }

    // Check if email already in use by another user
    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists && emailExists._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    // Find user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Update and save email
    user.email = cleanEmail;
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update email",
    });
  }
};

// Change user's password
export const changePassword = async (req, res) => {
  try {
    // Get password info from request
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: "All password fields required",
      });
    }

    // Check confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "New passwords do not match",
      });
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    // Check password length
    if (currentPassword === newPassword && newPassword === confirmPassword) {
      return res.status(400).json({
        message: "Choose a new password",
      });
    }

    // Get user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Check current password match
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and save
    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to change password",
    });
  }
};
