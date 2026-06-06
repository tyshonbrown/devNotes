"use client";

import Logo from "@/components/logo";
import Sidebar from "@/components/notes/Sidebar";
import Editor from "@/components/notes/Editor";
import AccountSettings from "@/components/account/AccountSettings";
import { useEffect, useState, useCallback } from "react";
import { avatars } from "@/data/avatars";

type Tip = {
  id: string;
  text: string;
};

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

// USER types
type User = {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
};

const Dashboard = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<"editor" | "account">("editor");

  // Fetch User
  const fetchUser = async () => {
    // Get token from local storage
    const token = sessionStorage.getItem("token");

    if (!token) return;

    try {
      // Verify token and get user data
      const res = await fetch("http://localhost:5050/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data.message || "Failed to fetch user");
        return;
      }

      // Success, set user
      setUser(data);
    } catch (error) {
      console.error("Fetch user error:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Fetch ALL Notes of user
  const fetchNotes = async () => {
    try {
      const token = sessionStorage.getItem("token");

      // Get notes and store data
      const res = await fetch("http://localhost:5050/api/notes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      // Errir
      if (!res.ok) {
        console.error(data.message || "Failed to fetch notes");
        setNotes([]);
        return;
      }

      setNotes(data);

      // By default,
      if (data.length > 0) {
        const savedNoteId = sessionStorage.getItem("selectedNoteId");

        const savedNote = data.find((note: Note) => note._id === savedNoteId);

        setSelectedNote(savedNote || data[0]);
      } else {
        setSelectedNote(null);
      }
    } catch (error) {
      console.log("Failed to fetch notes", error);
    }
  };

  // Get all the categories the user has from backend
  const fetchCategories = async () => {
    try {
      // Route is protected so send with token
      const token = sessionStorage.getItem("token");

      // Get categorues and store data
      const res = await fetch("http://localhost:5050/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      setCategories(data);
    } catch (error) {
      console.log("Failed to fetch categories", error);
    }
  };

  // Fetch notes on load
  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, []);

  // Set selected note
  const handleSelectedNote = (note: Note) => {
    setSelectedNote(note);
    sessionStorage.setItem("selectedNoteId", note._id);
    setActiveView("editor");
  };

  // Sort notes by when they were last edited
  const sortByEditDate = (a: Note, b: Note) => {
    return (
      new Date(b.updatedAt || b.createdAt || "").getTime() -
      new Date(a.updatedAt || a.createdAt || "").getTime()
    );
  };

  // Get pinned notes and sort by edit date
  const pinnedNotes = notes
    .filter((note) => note.isPinned)
    .sort(sortByEditDate);

  // Get (unpinned) and sort by edit date
  const unpinnedNotes = notes
    .filter((note) => !note.isPinned)
    .sort(sortByEditDate);

  // Create a Note
  const handleCreateNote = async () => {
    try {
      // Get token, verify it, and create note upon verification
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://localhost:5050/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Default values of a new note
        body: JSON.stringify({
          title: "Untitled Note",
          content: "",
          category: null,
          tags: [],
        }),
      });

      const data = await res.json();

      // Failure
      if (!res.ok) {
        console.log(data.message || "Failed to create note");
        return;
      }

      // Success
      setNotes((prev) => [data, ...prev]);
      setSelectedNote(data);
      sessionStorage.setItem("selectedNoteId", data._id);
    } catch (error) {
      console.log("Failed to create note", error);
    }
  };

  const handleNoteUpdated = useCallback((updatedNote: Note) => {
    setNotes((prev) =>
      prev.map((note) => (note._id === updatedNote._id ? updatedNote : note)),
    );

    setSelectedNote((currentSelectedNote) => {
      if (currentSelectedNote?._id !== updatedNote._id) {
        return currentSelectedNote;
      }

      return updatedNote;
    });
  }, []);

  const handleNoteDeleted = useCallback((deletedNoteId: string) => {
    setNotes((prevNotes) => {
      const remainingNotes = prevNotes.filter(
        (note) => note._id !== deletedNoteId,
      );

      const nextSelectedNote =
        remainingNotes.length > 0 ? remainingNotes[0] : null;

      setSelectedNote(nextSelectedNote);

      if (nextSelectedNote) {
        sessionStorage.setItem("selectedNoteId", nextSelectedNote._id);
      } else {
        sessionStorage.removeItem("selectedNoteId");
      }

      return remainingNotes;
    });
  }, []);

  return (
    <main className="h-screen overflow-hidden text-white bg-blue-950/20">
      <div className="flex h-full min-w-275 flex-col">
        {/* Top Bar */}
        <div className="flex shrink-0 flex-row px-6 mt-2 mb-2 justify-between">
          {/* Logo */}
          <Logo />

          {/* Account */}
          <button
            onClick={() => setActiveView("account")}
            className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-900 cursor-pointer"
          >
            <img
              src={user?.avatar}
              alt="Profile avatar"
              className="h-16 w-16 rounded-full bg-zinc-800 object-cover"
            />

            <span className="text-lg text-zinc-300 hover:text-white">
              {user?.username}
            </span>
          </button>
        </div>

        {/* Sidebar and Editor */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <Sidebar
            notes={notes}
            pinnedNotes={pinnedNotes}
            unpinnedNotes={unpinnedNotes}
            selectedNote={selectedNote}
            onSelectNote={handleSelectedNote}
            onCreateNote={handleCreateNote}
          />

          {activeView === "account" ? (
            <AccountSettings
              user={user}
              onUserUpdated={setUser}
              onBack={() => setActiveView("editor")}
            />
          ) : (
            <Editor
              key={selectedNote?._id ?? "no-note"}
              note={selectedNote}
              categories={categories}
              onCategoryCreated={(newCategory) => {
                setCategories((prev) => [...prev, newCategory]);
              }}
              onNoteUpdated={handleNoteUpdated}
              onNoteDeleted={handleNoteDeleted}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
