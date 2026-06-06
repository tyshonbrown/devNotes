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

// NOTE CARD Propes
type NoteCardProps = {
  note: Note;
  isSelected: boolean;
  onClick: () => void;
};

// CATEGROY types
type Category = {
  _id: string;
  user: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
};

const formatLastUpdated = (dateString?: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const today = new Date();

  // Date
  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  // Today's date
  const todyaOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Yesterday's date
  const yesterDayOnly = new Date(todyaOnly);
  yesterDayOnly.setDate(todyaOnly.getDate() - 1);

  // Display update time if note was last updated TODAY
  if (dateOnly.getTime() == todyaOnly.getTime()) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  // Display "Yesterday" if note was last updated YESTERDAY
  if (dateOnly.getTime() === yesterDayOnly.getTime()) {
    return "Yesterday";
  }

  // Display last updated date if not was updated anytime before yesterday
  return date.toLocaleDateString([], {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
};

// All note cards will be displayed in the Sidebar
// Click a note card to open it in the Editor
const NoteCard = ({ note, isSelected, onClick }: NoteCardProps) => {
  const lastUpdated = formatLastUpdated(note.updatedAt || note.createdAt);

  // Preview Text function, takes in html and preview shows up to 120 characters
  const getPlainTextPreview = (html: string, maxLength = 120) => {
    // Check if there is content
    if (!html) return "No content";

    // Converts html string to an html doc for js to read
    const doc = new DOMParser().parseFromString(html, "text/html");

    // adds a new line after each block element
    doc.body
      .querySelectorAll("p, h1, h2, h3, li, blockquote, pre, div") // find all block-level elemtents in note
      .forEach((element) => {
        // Adds a new line after each block element
        element.insertAdjacentText("afterend", "\n");
      });

    // Finds each break tag and adds a new line
    doc.body.querySelectorAll("br").forEach((br) => {
      br.replaceWith("\n");
    });

    // Gets text only from the html
    const text = doc.body.textContent?.replace(/\n\s*\n/g, "\n").trim() || "";

    // Check if final clean text is empty
    if (!text) return "No content";

    // return text, if length is larger than the max, it shows ...
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200 ${
        isSelected
          ? "border-blue-300/40 bg-blue-500/30 shadow-[0_0_0_1px_rgba(96,165,250,0.15)]"
          : "border-white/10 bg-black hover:border-blue-300/40"
      }`}
    >
      {/* Note Title and Last Updated */}
      <div className="flex items-center justify-between gap-3">
        <h3
          className={`min-w-0 flex-1 truncate font-medium ${
            isSelected ? "text-blue-100" : "text-gray-100"
          }`}
        >
          {note.title || "Untitled Note"}
        </h3>

        {lastUpdated && (
          <span
            className={`shrink-0 text-xs ${
              isSelected ? "text-blue-100/60" : "text-gray-500"
            }`}
          >
            {lastUpdated}
          </span>
        )}
      </div>

      {/* Note Content */}
      <p
        className={`mt-1 line-clamp-2 text-sm whitespace-pre-line leading-5 ${
          isSelected ? "text-blue-100/70" : "text-gray-500"
        }`}
      >
        {getPlainTextPreview(note.content)}
      </p>
    </button>
  );
};

export default NoteCard;
