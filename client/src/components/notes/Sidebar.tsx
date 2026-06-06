import NoteCard from "./NoteCard";
import { useState } from "react";

// NOTE types
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

// SIDEBAR Props
type SidebarProps = {
  notes: Note[];
  pinnedNotes: Note[];
  unpinnedNotes: Note[];
  selectedNote: Note | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
};

// CATEGORY types
type Category = {
  _id: string;
  user: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

const Sidebar = ({
  notes,
  pinnedNotes,
  unpinnedNotes,
  selectedNote,
  onSelectNote,
  onCreateNote,
}: SidebarProps) => {
  const [searchItem, setSearchItem] = useState("");
  const [viewPinnedNotes, setViewPinnedNotes] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const allTags = Array.from(new Set(notes.flatMap((note) => note.tags ?? [])));
  const noteCategories = notes
    .map((note) => note.category)
    .filter((category): category is NonNullable<Note["category"]> =>
      Boolean(category),
    );
  const uniqueCategories = Array.from(
    new Map(
      noteCategories.map((category) => [category._id, category]),
    ).values(),
  );

  // Allow search based on title, content, category, and tags
  const searchValue = searchItem.toLowerCase().trim();
  const noteMatchesSearch = (note: Note) => {
    if (!searchValue) return true;

    const title = note.title?.toLowerCase() ?? "";
    const content = note.content?.toLowerCase() ?? "";
    const category = note.category?.name?.toLowerCase() ?? "";
    const tags = note.tags?.join(" ").toLowerCase() ?? "";

    return (
      title.includes(searchValue) ||
      content.includes(searchValue) ||
      category.includes(searchValue) ||
      tags.includes(searchValue)
    );
  };

  // Filters based on Category and Tags
  const noteMatchesFilters = (note: Note) => {
    const matchesCategory =
      selectedCategory === "all" || note.category?._id === selectedCategory;

    const matchesTag =
      selectedTag === "all" || note.tags?.includes(selectedTag);

    return matchesCategory && matchesTag;
  };

  // Helper to check updatedAt
  const getNoteTime = (date?: string) => {
    return date ? new Date(date).getTime() : 0;
  };

  // Sort Notes by newest, oldest, and title A-Z
  const sortNotes = (notesToSort: Note[]) => {
    return [...notesToSort].sort((a, b) => {
      if (sortOption === "oldest") {
        return getNoteTime(a.updatedAt) - getNoteTime(b.updatedAt);
      }

      if (sortOption === "title") {
        return a.title.localeCompare(b.title);
      }

      // default: newest first
      return getNoteTime(b.updatedAt) - getNoteTime(a.updatedAt);
    });
  };

  // Applying both search and sort filters
  const applySearchFiltersAndSort = (notesToFilter: Note[]) => {
    return sortNotes(
      notesToFilter.filter(noteMatchesSearch).filter(noteMatchesFilters),
    );
  };

  const filteredPinnedNotes = applySearchFiltersAndSort(pinnedNotes);
  const filteredUnpinnedNotes = applySearchFiltersAndSort(unpinnedNotes);

  return (
    <aside
      onClick={() => setShowFilters(false)}
      className="h-full w-96 shrink-0 overflow-y-auto p-2"
    >
      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Search bar*/}
          <input
            type="text"
            placeholder="Search notes..."
            value={searchItem}
            onChange={(e) => setSearchItem(e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-black py-2 px-4 text-sm 
          text-gray-100 outline-none focus:border-blue-400"
          />

          {/* Filter Options */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFilters(!showFilters);
            }}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-2xl
           border border-white/10 bg-black text-blue-300 hover:bg-zinc-900"
          >
            <i className="bx bx-filter text-2xl"></i>
          </button>
        </div>

        {showFilters && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-white/10 bg-zinc-900 p-4 shadow-xl"
          >
            {/* Filter by CATEGROY */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                Filter by Category
              </p>

              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setShowFilters(false);
                }}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-sm text-gray-100 outline-none focus:border-blue-400"
              >
                <option value="all">All categories</option>

                {uniqueCategories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by TAGS */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                Filter by Tag
              </p>

              <select
                value={selectedTag}
                onChange={(e) => {
                  setSelectedTag(e.target.value);
                  setShowFilters(false);
                }}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-sm text-gray-100 outline-none focus:border-blue-400"
              >
                <option value="all">All tags</option>

                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                Sort by
              </p>

              <select
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setShowFilters(false);
                }}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-sm text-gray-100 outline-none focus:border-blue-400"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="title">Title A-Z</option>
              </select>
            </div>

            {/* Clear Filters and Close */}
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedTag("all");
                setSortOption("newest");
                setShowFilters(false);
              }}
              className="w-full rounded-xl border border-white/10 bg-zinc-950 p-2 text-sm text-gray-300 hover:bg-zinc-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <button
        onClick={onCreateNote}
        className="mt-3 flex w-full cursor-pointer items-center justify-center gap-1 rounded-2xl bg-green-600 p-2 text-sm font-semibold text-white hover:bg-green-500"
      >
        <i className="bx bx-pencil text-lg"></i>
        New Note
      </button>

      {/* Pinned Notes */}
      <div className="mt-5 px-2">
        {/* Header */}
        <button
          onClick={() => setViewPinnedNotes(!viewPinnedNotes)}
          className="flex w-full cursor-pointer items-center justify-between 
          rounded-xl px-2 py-2 text-left hover:bg-zinc-900"
        >
          <h3 className="text-sm font-medium uppercase tracking-wide text-gray-300">
            Pinned Notes
          </h3>

          {/* Arrow */}
          <i
            className={`bx ${
              viewPinnedNotes ? "bx-chevron-up" : "bx-chevron-down"
            }
            text-xl text-gray-200`}
          ></i>
        </button>

        {/* Pinned Notes List */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            viewPinnedNotes
              ? "mt-2 max-h-96 opacity-100 translate-y-0"
              : "mt-0 max-h-0 opacity-0 -translate-y-1"
          }`}
        >
          <div className="flex flex-col gap-2">
            {filteredPinnedNotes.length === 0 ? (
              <p className="text-sm text-gray-500 px-2 tracking-wide">
                No pinned notes
              </p>
            ) : (
              filteredPinnedNotes.map((note) => (
                <NoteCard
                  key={note._id}
                  note={note}
                  isSelected={selectedNote?._id === note._id}
                  onClick={() => onSelectNote(note)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      <div className="mt-2 px-2">
        {/* Header */}
        <h3 className="text-sm px-2 py-2 font-medium uppercase tracking-wide text-gray-300">
          Recent Notes
        </h3>

        {/* Recent Notes List */}
        <div className="flex flex-col gap-2 py-2">
          {filteredUnpinnedNotes.length === 0 ? (
            <p className="text-sm text-gray-500 tracking-wide">
              No recent notes
            </p>
          ) : (
            filteredUnpinnedNotes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                isSelected={selectedNote?._id === note._id}
                onClick={() => onSelectNote(note)}
              />
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
