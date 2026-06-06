import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { TextStyle, Color, FontFamily } from "@tiptap/extension-text-style";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { Extension } from "@tiptap/core";
import {
  Bold,
  Italic,
  UnderlineIcon,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Code,
  LinkIcon,
  Lightbulb,
  ChevronDown,
  Type,
  Plus,
} from "lucide-react";

// Every Tip has an id and text as string
type Tip = {
  id: string;
  text: string;
};

/*
Props are passed from parent Editor.tsx
value / onChange controls the TipTap note content
tips / setTips control the tips section
*/
type ContentProps = {
  value: string;
  onChange: (html: string) => void;
  onClick?: () => void;
  tips: Tip[];
  setTips: React.Dispatch<React.SetStateAction<Tip[]>>;
};

// Creates the syntax highlighter used by the code blocks
const lowlight = createLowlight(common);

/*
Custom TipTap extension changing what happens when a user presses
certain keys like Enter, {, [, ", and '
*/
const CodeBlockAutoIndent = Extension.create({
  name: "codeBlockAutoIndent",

  addKeyboardShortcuts() {
    return {
      // Only handles Enter if user is currently inside a code block
      Enter: ({ editor }) => {
        if (!editor.isActive("codeBlock")) {
          return false;
        }

        // Get editor state and current cursor position
        const { state } = editor;
        const { $from } = state.selection;

        // Get all text in current code block before the cursor
        const textBeforeCursor = $from.parent.textBetween(
          0,
          $from.parentOffset, // how far into the node the cursor is
          undefined,
          "\ufffc",
        );

        // Find the current line and copy its starting spaces for auto-indent
        const currentLine = textBeforeCursor.split("\n").pop() || "";
        const currentIndent = currentLine.match(/^\s*/)?.[0] || "";

        // Checks if user pressed ENTER after a line ending w/ {
        const shouldAutoCloseBrace = currentLine.trim().endsWith("{");

        if (shouldAutoCloseBrace) {
          // Creates blank middle line w/ indentation and closing brace lines up with original line
          const innerIndent = `${currentIndent}  `;
          const insertedText = `\n${innerIndent}\n${currentIndent}}`;

          // Cursor position: should go to middle indented line
          const cursorPosition = $from.pos + 1 + innerIndent.length;

          // Inserts the new lines and moves the cursor to the middle
          editor.chain().focus().insertContent(insertedText).run();
          editor.commands.setTextSelection(cursorPosition);

          return true;
        }

        // If line does not end with "{", ENTER just creates a new line with no auto-indent
        editor.chain().focus().insertContent(`\n${currentIndent}`).run();
        return true;
      },
      // Auto pair brackets
      "[": ({ editor }) => {
        // Check if user is in a code block
        if (!editor.isActive("codeBlock")) return false;

        // get current cursor position
        const { from } = editor.state.selection;

        // Add closing bracket and put cursor in the middle
        editor.chain().focus().insertContent("[]").run();
        editor.commands.setTextSelection(from + 1);

        return true;
      },

      // Auto pair quotes
      '"': ({ editor }) => {
        if (!editor.isActive("codeBlock")) return false;

        const { from } = editor.state.selection;

        editor.chain().focus().insertContent('""').run();
        editor.commands.setTextSelection(from + 1);

        return true;
      },

      "'": ({ editor }) => {
        if (!editor.isActive("codeBlock")) return false;

        const { from } = editor.state.selection;

        editor.chain().focus().insertContent("''").run();
        editor.commands.setTextSelection(from + 1);

        return true;
      },
    };
  },
});

const Content = ({ value, onChange, onClick, tips, setTips }: ContentProps) => {
  // Used only to force toolbar re-renders when the editor selection/state changes
  const [, setToolbarUpdate] = useState(0);

  // Ref to the tips section, so can auto scroll to it after addint a new tip
  const tipsSectionRef = useRef<HTMLDivElement | null>(null);

  // Tracks which toolbar dropdown is open. null means all menues are closed
  const [openMenu, setOpenMenu] = useState<
    "textStyle" | "align" | "insert" | null
  >(null);

  // Editor. Each extension gives the editor a feature
  const editor = useEditor({
    extensions: [
      // Common editing features, disabling link, underline, and codeblock
      StarterKit.configure({
        link: false,
        underline: false,
        codeBlock: false,
      }),

      // Syntax-highlited code blocks
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
        enableTabIndentation: true,
        tabSize: 2,
      }),

      // Custom extention for auto indent inside code block
      CodeBlockAutoIndent,

      // Extentions for more formatting options
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      FontFamily,
    ],
    // Load the saved note HTML, or start with an empty paragraph (<p>)
    content: value || "<p></p>",

    // Styling applied to the actual editable content area
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-40 w-full text-lg leading-7 text-gray-300 outline-none focus:outline-none",
      },
    },

    // Toolbar Updates
    // Runs when cursor moves or text is selected
    onSelectionUpdate: () => {
      setToolbarUpdate((prev) => prev + 1);
    },

    // runs when editor state changes
    onTransaction: () => {
      setToolbarUpdate((prev) => prev + 1);
    },

    // Send updated HTML back to parent whenever the note changes
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },

    // Prevent tiptap from rendering too early in Next.js
    immediatelyRender: false,
  });

  // When selected note changes, sync the new HTML into tiptap
  useEffect(() => {
    if (!editor) return;

    const currentHTML = editor.getHTML();

    if (value !== currentHTML) {
      editor.commands.setContent(value || "<p></p>", {
        emitUpdate: false, // prevents sync from triggering another save
      });
    }
  }, [value, editor]);

  // Add link
  const addLink = () => {
    // Asks user to enter URL
    const input = window.prompt("Enter URL");

    if (!input) return;

    // Makes sure the link is valid
    const url =
      input.startsWith("http://") || input.startsWith("https://")
        ? input
        : `https://${input}`;

    // Apply the link to the selected text
    editor?.chain().focus().setLink({ href: url }).run();
  };

  // Button Class Helpers
  // active true, button gets blue styling, otherwhich gray styling
  const toolbarIconButtonClass = (active: boolean) =>
    `flex h-9 w-9 items-center justify-center rounded-lg transition cursor-pointer ${
      active
        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
        : "text-gray-300 hover:bg-white/10 border border-transparent"
    }`;

  const menuButtonClass = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
      active
        ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
        : "text-gray-300 hover:bg-white/10 border border-transparent"
    }`;

  const dropdownItemClass = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition ${
      active
        ? "bg-blue-500/20 text-blue-300"
        : "text-gray-300 hover:bg-white/10"
    }`;

  // Determines label shown in the text style dropdown based on cursor position
  const getCurrentTextStyle = () => {
    if (editor?.isActive("heading", { level: 1 })) return "Header";
    if (editor?.isActive("heading", { level: 2 })) return "Subheader";
    return "Normal";
  };

  // Closes any open toolbar dropdown
  const closeMenus = () => setOpenMenu(null);

  // Add a blank tip
  const addTip = () => {
    setTips((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        text: "",
      },
    ]);

    // Scroll to the tip section after React renders the tip
    setTimeout(() => {
      tipsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0); // 0 because the scroll happens immediately
  };

  // Update only the tip that matches the given id
  const updateTip = (id: string, text: string) => {
    setTips((prev) =>
      prev.map((tip) => (tip.id === id ? { ...tip, text } : tip)),
    );
  };

  // Remove the tip with the matching id
  const deleteTip = (id: string) => {
    setTips((prev) => prev.filter((tip) => tip.id !== id));
  };

  // Font size options
  const fontSizes = [
    { label: "12", value: "12px" },
    { label: "14", value: "14px" },
    { label: "16", value: "16px" },
    { label: "18", value: "18px" },
    { label: "20", value: "20px" },
    { label: "24", value: "24px" },
    { label: "32", value: "32px" },
  ];

  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  // Wait until tiptap finish initializing before rendering the editor UI
  if (!editor) {
    return null;
  }

  return (
    // Clicking editor will notify parent that the editor is active
    <div onClick={onClick} className="flex flex-col">
      {/* Toolbar, sticks to top of editor area while user scrolls */}
      <div
        className="sticky top-0 z-20 -mx-12 flex w-[calc(100%+6rem)] flex-wrap 
  items-center gap-2 border-t border-b border-white/5 bg-zinc-950 px-12 py-3"
      >
        {/* Text Style Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              // Toggle text type dropdown. Re-click closes it
              setOpenMenu(openMenu === "textStyle" ? null : "textStyle")
            }
            className={menuButtonClass(
              editor.isActive("heading", { level: 1 }) ||
                editor.isActive("heading", { level: 2 }),
            )}
          >
            <Type size={17} />
            <span>{getCurrentTextStyle()}</span>
            <ChevronDown size={15} />
          </button>

          {openMenu === "textStyle" && (
            <div className="absolute left-0 top-11 z-50 w-44 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-xl">
              {/* commans use chain().focus().command().run() so formatting applies
                to the current selection/cursor */}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().setParagraph().run();
                  closeMenus();
                }}
                className={dropdownItemClass(editor.isActive("paragraph"))}
              >
                Normal
              </button>

              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                  closeMenus();
                }}
                className={dropdownItemClass(
                  editor.isActive("heading", { level: 1 }),
                )}
              >
                Header
              </button>

              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                  closeMenus();
                }}
                className={dropdownItemClass(
                  editor.isActive("heading", { level: 2 }),
                )}
              >
                Subheader
              </button>
            </div>
          )}
        </div>

        {/* Font Family, applies selected for to the current text selection */}
        <select
          onChange={(e) =>
            editor.chain().focus().setFontFamily(e.target.value).run()
          }
          className="h-9 rounded-lg border border-transparent bg-zinc-800 px-3 text-sm text-gray-300 hover:bg-white/10"
        >
          <option value="Inter">Inter</option>
          <option value="Georgia">Georgia</option>
          <option value="Arial">Arial</option>
          <option value="Courier New">Courier New</option>
        </select>

        {/* Bold, toggle bold and visually highlight the button when active */}
        <button
          type="button"
          title="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarIconButtonClass(editor.isActive("bold"))}
        >
          <Bold size={18} />
        </button>

        {/* Italic,  toggle italic and visuallly highlight the button when active */}
        <button
          type="button"
          title="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarIconButtonClass(editor.isActive("italic"))}
        >
          <Italic size={18} />
        </button>

        {/* Underline, toggle underline and visually highlight the button when active */}
        <button
          type="button"
          title="Underline"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={toolbarIconButtonClass(editor.isActive("underline"))}
        >
          <UnderlineIcon size={18} />
        </button>

        {/* Font Color */}
        {/* sr-only visually hides the color picker input */}
        <label title="Text color" className={toolbarIconButtonClass(false)}>
          <Palette size={18} />
          <input
            type="color"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            className="sr-only"
          />
        </label>

        {/* Highlight Color */}
        <label
          title="Highlight color"
          className={toolbarIconButtonClass(editor.isActive("highlight"))}
        >
          <Highlighter size={18} />
          <input
            type="color"
            onChange={(e) =>
              editor
                .chain()
                .focus()
                .toggleHighlight({ color: e.target.value })
                .run()
            }
            className="sr-only"
          />
        </label>

        {/* Alignment Menu */}
        <div className="relative">
          <button
            type="button"
            title="Paragraph alignment"
            onClick={() => setOpenMenu(openMenu === "align" ? null : "align")}
            className={menuButtonClass(
              editor.isActive({ textAlign: "center" }) ||
                editor.isActive({ textAlign: "right" }),
            )}
          >
            {editor.isActive({ textAlign: "center" }) ? (
              <AlignCenter size={18} />
            ) : editor.isActive({ textAlign: "right" }) ? (
              <AlignRight size={18} />
            ) : (
              <AlignLeft size={18} />
            )}

            <ChevronDown size={15} />
          </button>

          {openMenu === "align" && (
            <div className="absolute left-0 top-11 z-50 w-36 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-xl">
              <button
                type="button"
                title="Align left"
                onClick={() => {
                  editor.chain().focus().setTextAlign("left").run();
                  closeMenus();
                }}
                className={dropdownItemClass(
                  editor.isActive({ textAlign: "left" }),
                )}
              >
                <AlignLeft size={18} />
                Left
              </button>

              <button
                type="button"
                title="Align center"
                onClick={() => {
                  editor.chain().focus().setTextAlign("center").run();
                  closeMenus();
                }}
                className={dropdownItemClass(
                  editor.isActive({ textAlign: "center" }),
                )}
              >
                <AlignCenter size={18} />
                Center
              </button>

              <button
                type="button"
                title="Align right"
                onClick={() => {
                  editor.chain().focus().setTextAlign("right").run();
                  closeMenus();
                }}
                className={dropdownItemClass(
                  editor.isActive({ textAlign: "right" }),
                )}
              >
                <AlignRight size={18} />
                Right
              </button>
            </div>
          )}
        </div>

        {/* Bullet List */}
        <button
          type="button"
          title="Bullet list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarIconButtonClass(editor.isActive("bulletList"))}
        >
          <List size={19} />
        </button>

        {/* Numbered List */}
        <button
          type="button"
          title="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarIconButtonClass(editor.isActive("orderedList"))}
        >
          <ListOrdered size={19} />
        </button>

        {/* Insert Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === "insert" ? null : "insert")}
            className={menuButtonClass(false)}
          >
            <Plus size={18} />
            <span>Insert</span>
            <ChevronDown size={15} />
          </button>

          {openMenu === "insert" && (
            <div className="absolute right-0 top-11 z-50 w-44 rounded-xl border border-white/10 bg-zinc-900 p-2 shadow-xl">
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().toggleCodeBlock().run();
                  closeMenus();
                }}
                className={dropdownItemClass(editor.isActive("codeBlock"))}
              >
                <Code size={18} />
                Code Block
              </button>

              <button
                type="button"
                onClick={() => {
                  addLink();
                  closeMenus();
                }}
                className={dropdownItemClass(editor.isActive("link"))}
              >
                <LinkIcon size={18} />
                Link
              </button>

              <button
                type="button"
                onClick={() => {
                  addTip();
                  closeMenus();
                }}
                className={dropdownItemClass(false)}
              >
                <Lightbulb size={18} />
                Tip
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Renders editable content area using the editor instance */}
      <EditorContent
        editor={editor}
        className="w-full rounded-2xl bg-transparent pt-4"
      />

      {/* Only show tios section after first tip is added */}
      {tips.length > 0 && (
        <div
          ref={tipsSectionRef}
          className="mb-2 border-t border-white/10 pt-4 space-y-3"
        >
          <h3 className="text-md font-semibold uppercase tracking-wide text-yellow-200/80">
            Debugging Tips
          </h3>

          {/* Render each tip as a controlled text area ties to the tips array */}
          {tips.map((tip) => (
            <div
              key={tip.id}
              className="flex w-full items-start gap-3 mb-2 rounded-lg border-l-8 border-yellow-400 bg-yellow-400/10 px-4 py-2 text-yellow-100"
            >
              <span className="shrink-0 pt-1 font-semibold">💡 Tip:</span>

              <textarea
                value={tip.text}
                onChange={(e) => {
                  updateTip(tip.id, e.target.value);
                  autoResizeTextarea(e.target);
                }}
                onInput={(e) => autoResizeTextarea(e.currentTarget)}
                rows={1}
                placeholder="Write a debugging tip..."
                className="min-h-8 w-full resize-none overflow-hidden bg-transparent pt-1 font-normal leading-6 outline-none placeholder:text-yellow-100/40"
              />

              {/* Delete specific tip by id */}
              <button
                type="button"
                onClick={() => deleteTip(tip.id)}
                className="shrink-0 rounded-md px-2 py-1 text-sm opacity-60 transition hover:bg-white/10 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Content;
