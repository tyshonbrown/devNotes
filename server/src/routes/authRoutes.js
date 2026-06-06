import express from "express";
import {
    signupUser,
    loginUser,
    updateUsername,
    updateEmail,
    changePassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Routes
router.post("/signup", signupUser);
router.post("/login", loginUser);

// Protected routes
router.put("/username", protect, updateUsername);
router.put("/email", protect, updateEmail);
router.put("/password", protect, changePassword);

export default router;