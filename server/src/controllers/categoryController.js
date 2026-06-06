import Category from "../models/Category.js";
import Note from "../models/Note.js";

// Get all categories for logged-in user
export const getCategories = async (req, res) => {
  try {
    // fetch the categories and sort by name
    const categories = await Category.find({ user: req.user._id }).sort({
      name: 1,
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get categories",
    });
  }
};

// Create a new categoru
export const createCategory = async (req, res) => {
  try {
    // Get name from input
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Category name required",
      });
    }

    // Create category
    const category = await Category.create({
      user: req.user._id,
      name: name.trim(),
    });

    // Success
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create category",
    });
  }
};

// Delete a category
export const deleteCategory = async (req, res) => {
  try {
    // Finds the category and deletes it
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    // Category not found
    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    // Disconnect this category from all Notes that used it
    await Note.updateMany(
      {
        user: req.user._id,
        category: category._id,
      },
      {
        $set: { category: null },
      }
    );

    // Success
    res.json({
      message: "Category deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete category",
    });
  }
};
