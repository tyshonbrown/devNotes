import mongoose from "mongoose";

// Defines what a Note should contain
const noteSchema = new mongoose.Schema(
  {
    // user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Note title
    // Untitled note is the title by default
    title: {
      type: String,
      required: true,
      trim: true,
      default: "Untitled Note",
    },

    // Category the note belongs to
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // Tags
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        tags.map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-")),
    },
    
    tips: {
      type: [
        {
          id: {
            type: String,
            required: true,
          },
          text: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },

    // Main note content
    // Not required because a new note can start empty
    content: {
      type: String,
      default: "",
    },

    // Optional code snippet attached to the note
    codeSnippet: {
      type: String,
      default: "",
    },

    // Programming language for the code snippet
    language: {
      type: String,
      default: "javascript",
      trim: true,
    },

    // Pinned notes will appear at the top of the sidebar
    isPinned: {
      type: Boolean,
      default: false,
    },

    // Used if you want to track the last note the user opened
    lastViewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Model creation, gives access to database methods like Note.find(), .create()...
const Note = mongoose.model("Note", noteSchema);

export default Note;
