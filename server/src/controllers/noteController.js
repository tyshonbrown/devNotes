import Note from "../models/Note.js";

// Get all notes
export const getNotes = async (req, res) => {
  try {
    //Find all the notes, put in an array sorted by when they were created, newest first
    const notes = await Note.find({ user: req.user._id })
      .populate("category")
      .sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    // 500 - server error
    res.status(500).json({ message: "Failed to get notes" });
  }
};

// Get a single note by Id
export const getNoteById = async (req, res) => {
  try {
    // Find note by id and update the time for when its last viewed to now
    const note = await Note.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      { lastViewedAt: new Date() },
      { new: true },
    ).populate("category");

    // if noted does not exist
    if (!note) {
      // 404 - not found error
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: "Failed to get note by Id" });
  }
};

// Create a new Note
export const createNote = async (req, res) => {
  try {
    const note = await Note.create({
      user: req.user._id,
      title: req.body.title || "Untitled Note",
      content: req.body.content || "",
      category: req.body.category || null,
      tags: req.body.tags || [],
      tips: req.body.tips || [],
    });

    const populatedNote = await note.populate("category");

    res.status(201).json(populatedNote);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create note" });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.title = req.body.title ?? note.title;
    note.content = req.body.content ?? note.content;
    note.category = req.body.category || null;
    note.tags = req.body.tags ?? note.tags;
    note.tips = req.body.tips ?? note.tips;

    const updatedNote = await note.save();
    await updatedNote.populate("category");

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Failed to update note" });
  }
};

// Toggle pin note
export const togglePinNote = async (req, res) => {
  try {
    // Get the note
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    // Note not found
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Toggle isPinned
    note.isPinned = !note.isPinned;

    // Save note
    const updatedNote = await note.save();

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: "Failed to update pinned status" });
  }
};

// Delete note
export const deleteNote = async (req, res) => {
  try {
    // Find not by id and delete it
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete note" });
  }
};
