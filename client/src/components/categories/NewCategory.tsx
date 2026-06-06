import { useState } from "react";
import { ChangeEventHandler, SubmitEventHandler } from "react";

type Note = {
  _id: string;
  title: string;
  content: string;
  category: Category | null;
  tags: string[];
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Category = {
  _id: string;
  user: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

type NewCategoryProps = {
  onClose: () => void;
  onCategoryCreated: (category: Category) => void;
};

type CategoryFormData = {
  name: string;
};

const NewCategory = ({ onClose, onCategoryCreated }: NewCategoryProps) => {
  const [form, setForm] = useState<CategoryFormData>({
    name: "",
  });

  // Update name on change
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;

    setForm({
      name: value,
    });
  };

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {

      // Get the token for the current user
      const token = sessionStorage.getItem("token");

      // Create the category with token verification
      const res = await fetch("http://localhost:5050/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message || "Failed to create category");
        return;
      }

      console.log("Category created:", data);
      onCategoryCreated(data);
      onClose();

    } catch (error) {
      console.log("Failed to create category", error);
    }
  };

  return (
    <div className="mt-3 w-72 rounded-4xl border border-white/10 bg-zinc-950 py-2 shadow-xl">
      <div className="mb-1 flex flex-col items-center justify-between">
        {/* Title */}
        <h3 className="text-sm font-semibold">Add New Category</h3>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-2">
          {/* Name Input */}
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Category name"
            className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-gray-100 outline-none placeholder:text-gray-600 focus:border-blue-400"
          />

          {/* Cancle / Add */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:text-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-zinc-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-400"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewCategory;
