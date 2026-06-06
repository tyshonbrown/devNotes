import { useEffect, useState, useRef, useCallback } from "react";
import { ChangeEventHandler, KeyboardEventHandler } from "react";
import NewCategory from "../categories/NewCategory";
import Content from "./Content";

// NOTE types
type Note = {
  _id: string;
  title: string;
  content: string;
  category: Category | null;
  tags: string[];
  tips?: Tip[];
  isPinned?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// CATEGORY types
type Category = {
  _id: string;
  user: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

// EDITOR Props
type EditorProps = {
  note: Note | null;
  categories: Category[];
  onCategoryCreated: (category: Category) => void;
  onNoteUpdated: (updatedNote: Note) => void;
  onNoteDeleted: (noteId: string) => void;
};

// NOTE FORM DATA types
type NoteFormData = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  tips: Tip[];
};

type Tip = {
  id: string;
  text: string;
};

const getInitialForm = (note: Note | null): NoteFormData => ({
  title: note?.title ?? "",
  content: note?.content ?? "",
  category: note?.category?._id ?? "",
  tags: note?.tags ?? [],
  tips: note?.tips ?? [],
});

const Editor = ({
  note,
  categories,
  onCategoryCreated,
  onNoteUpdated,
  onNoteDeleted,
}: EditorProps) => {
  const [form, setForm] = useState<NoteFormData>(() => getInitialForm(note));
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const justLoadedNote = useRef(true);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved",
  );

  const noteId = note?._id;

  // Called whenever the note being viewed changes
  useEffect(() => {
    // Re initialize form to default values
    setForm(getInitialForm(note));

    // note being loaded set to true
    justLoadedNote.current = true;

    // Make sure category form is closed
    setShowCategoryForm(false);

    // Make sure tag input is closed and reset
    setShowTagInput(false);
    setTagInput("");

    setSaveStatus("saved");
  }, [noteId]);

  // Function to Save a Note
  const saveNote = useCallback(
    async (noteData: NoteFormData) => {
      // If no note is being viewed
      if (!noteId) return;

      // Get the stored token from the local storage
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("No authentication token found");
        return;
      }

      try {
        setSaveStatus("saving");

        // Verify the token and update the note based on the form note data
        const res = await fetch(`http://localhost:5050/api/notes/${noteId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(noteData),
        });

        // Await response and store into data, check status
        const data = await res.json();
        if (!res.ok) {
          console.log(data.message || "Failed to save note");
          setSaveStatus("error");
          return;
        }

        // Success, note is updated, call function to handle what happens after
        onNoteUpdated(data);
        setSaveStatus("saved");

        // Error
      } catch (error) {
        console.log("Failed to save note", error);
        setSaveStatus("error");
      }
    },
    [noteId, onNoteUpdated],
  );

  // AUTO_SAVE, automatically call save note function
  // Happens when form changes, note changes
  useEffect(() => {
    // Check if a note is being viewed
    if (!noteId) return;

    // Prevents auto-save when note was JUST loaded
    if (justLoadedNote.current) {
      justLoadedNote.current = false;
      return;
    }

    // Every 400ms call the saveNote function to save any changes
    const timeout = setTimeout(() => {
      saveNote(form);
    }, 400);

    return () => clearTimeout(timeout);
  }, [form, noteId, saveNote]);

  // Handle changes to text input, like title and content
  const handleTextChange: ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    // Get input data
    const { name, value } = e.target;

    // Text only changes, handles only title and content changes
    if (name !== "title" && name !== "content") {
      return;
    }

    // Update form
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle changes to category
  const handleCategoryChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    // Get the selection
    const value = e.target.value;

    // If selection is to create a new category, show that form and exit here
    if (value === "add-new") {
      setShowCategoryForm(true);
      return;
    }

    setShowCategoryForm(false);

    // Update the category selection int he form
    setForm((prev) => ({
      ...prev,
      category: value,
    }));
  };

  // Toggle Pin Note
  const handlePinNote = async () => {
    if (!note?._id) return;

    try {
      // Get and verify token, then toggle pin
      const token = sessionStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5050/api/notes/${note._id}/pin`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      // Failure
      if (!res.ok) {
        console.log(data.message || "Failed to pin/unpin note");
        return;
      }

      // Success
      console.log("Updated pinned status:", data);
      onNoteUpdated(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Note
  const handleDelete = async () => {
    // Check a note is being viewed
    if (!note?._id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${note.title || "Untitled Note"}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    // Get token from local storage
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.log("No authentication token found");
      return;
    }

    try {
      // Verify token and delete the note
      const res = await fetch(`http://localhost:5050/api/notes/${note._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check the response
      let data = null;
      if (res.status !== 204) {
        data = await res.json();
      }
      if (!res.ok) {
        console.log(data.message || "Failed to delete note");
        return;
      }

      // Handle what happens after a note is deleted
      onNoteDeleted(note._id);

      // Error
    } catch (error) {
      console.error(error);
    }
  };

  // Add Tag
  const handleAddTag: KeyboardEventHandler<HTMLInputElement> = (e) => {
    // If enter (save) isnt selected do nothing yet
    if (e.key !== "Enter") return;

    e.preventDefault();

    // Get new tag input data
    const newTag = tagInput.trim();
    if (!newTag) return;

    setForm((prev) => {
      // Check the new tag doesnt already exist
      const tagAlreadyExists = prev.tags.some(
        (tag) => tag.toLowerCase() === newTag.toLowerCase(),
      );
      if (tagAlreadyExists) {
        return prev;
      }

      // Add the tag
      return {
        ...prev,
        tags: [...prev.tags, newTag],
      };
    });

    // Reset tag states
    setTagInput("");
    setShowTagInput(false);
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    // Filter tags only keeping the ones that dont match tagToRemove
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  if (!note) {
    return (
      <section className="min-h-0 flex-1 overflow-y-auto rounded-3xl bg-zinc-900 p-12">
        <div className="flex min-h-125 items-center justify-center text-center">
          <div className="max-w-md">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950/70 text-blue-300 border border-white/10">
              <i className="bx bx-note text-3xl"></i>
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-gray-100">
              No notes yet
            </h2>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Create your first note using the New Note button in the sidebar.
            </p>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="relative min-h-0 flex-1 overflow-y-auto rounded-3xl bg-black">
      <div className="px-12 pt-12">
        {/* Top Right Actions */}
        <div className="absolute right-8 top-8 flex items-center gap-2">
          {/* Pin Note */}
          <button
            type="button"
            aria-label={note?.isPinned ? "Unpin note" : "Pin note"}
            title={note?.isPinned ? "Unpin Note" : "Pin Note"}
            onClick={handlePinNote}
            className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition ${
              note?.isPinned
                ? "border-yellow-400/40 bg-yellow-500/30 text-yellow-300 hover:border-red-400/40 hover:bg-red-500/30 hover:text-red-300"
                : "border-white/10 bg-zinc-950/70 text-gray-300 hover:border-green-400/40 hover:bg-green-500/30 hover:text-green-300"
            }`}
          >
            <i className="bx bxs-pin text-xl"></i>
          </button>

          {/* Delete Note */}
          <button
            type="button"
            aria-label="Delete note"
            title="Delete Note"
            onClick={handleDelete}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-zinc-950/70 text-gray-300 transition hover:border-red-400/40 hover:bg-red-500/30 hover:text-red-300"
          >
            <i className="bx bxs-trash text-xl"></i>
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Autosave Status */}
          <p className="text-sm text-gray-500">
            {saveStatus === "saving" && "Saving changes..."}
            {saveStatus === "saved" && "Changes saved."}
            {saveStatus === "error" && "Could not save changes."}
          </p>

          {/* Title Input */}
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleTextChange}
            onClick={() => setShowCategoryForm(false)}
            placeholder="Untitled note"
            className="w-full bg-transparent text-3xl font-semibold tracking-tight text-gray-100 outline-none placeholder:text-gray-600"
          />

          {/* Note Details */}
          <div className="flex flex-wrap items-center gap-3 pb-2">
            <div className="relative">
              {/* Category */}
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 px-2 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <i className="bx bx-category text-xl"></i>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleCategoryChange}
                    className="cursor-pointer bg-transparent text-sm font-medium text-blue-300 outline-none"
                  >
                    <option value="" disabled>
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}

                    <option value="add-new">+ Add New</option>
                  </select>
                </div>
              </div>

              {/* New Category form */}
              {showCategoryForm && (
                <div className="absolute left-0 top-full z-50 mt-2">
                  <NewCategory
                    onClose={() => setShowCategoryForm(false)}
                    onCategoryCreated={(category) => {
                      onCategoryCreated(category);
                      setForm((prev) => ({
                        ...prev,
                        category: category._id,
                      }));

                      setShowCategoryForm(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            <div
              onClick={() => setShowCategoryForm(false)}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 px-2 py-2"
            >
              {/* Tag Icon */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <i className="bx bx-purchase-tag text-xl"></i>
              </div>

              {/* Tags Title */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                  Tags
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-gray-400 hover:text-red-400 cursor-pointer"
                      >
                        <i className="bx bx-x"></i>
                      </button>
                    </span>
                  ))}

                  {showTagInput ? (
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      onBlur={() => {
                        setShowTagInput(false);
                        setTagInput("");
                      }}
                      autoFocus
                      placeholder="New tag"
                      className="w-24 bg-transparent text-sm text-gray-200 utline-none placeholder:text-gray-600"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowTagInput(true)}
                      className="text-sm font-medium text-gray-200 hover:text-blue-300 cursor-pointer"
                    >
                      <i className="bx bx-plus"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <Content
            // Send saved note HTML into tiptap
            value={form.content}

            // When tiptap changes, update only form.content
            onChange={(html) =>
              setForm((prev) => ({
                ...prev,
                content: html,
              }))
            }

            // Close the category form when editor is clicked
            onClick={() => setShowCategoryForm(false)}

            // Send current tips into Content
            tips={form.tips}
            
            // Let Content update tips while keeping them inside form state
            // Content edits the data, but Editor owns the data
            setTips={(updater) =>
              setForm((prev) => ({
                ...prev,
                tips:
                  typeof updater === "function" ? updater(prev.tips) : updater,
              }))
            }
          />
        </div>
      </div>
    </section>
  );
};

export default Editor;
