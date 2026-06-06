import express from "express";
import {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    togglePinNote,
} from "../controllers/noteController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getNotes);
router.get("/:id",protect, getNoteById);
router.post("/",protect, createNote);
router.put("/:id",protect, updateNote);
router.delete("/:id",protect, deleteNote)
router.patch("/:id/pin", protect, togglePinNote);

export default router;