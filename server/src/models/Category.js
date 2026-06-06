import mongoose from "mongoose";

// Defines a custom category for a note
const categorySchema = new mongoose.Schema(
  {
    // The user who owns this category
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Category name
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent one user from having duplicate category names
categorySchema.index({ user: 1, name: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
