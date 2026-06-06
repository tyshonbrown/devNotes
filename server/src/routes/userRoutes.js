import express from "express";
import { updateAvatar, getCurrentUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getCurrentUser);
router.patch("/avatar", protect, updateAvatar);

export default router;