const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const getNotes = async () => {
  const res = await fetch(`${API_URL}/notes`);

  if (!res.ok) {
    throw new Error("Failed to fetch notes");
  }

  return res.json();
};

export const getNoteById = async (id: string) => {
  const res = await fetch(`${API_URL}/notes/${id}`);

  if (!res.ok) {
    throw new Error("Failed to fetch note");
  }

  return res.json();
};

export const createNote = async (noteData: unknown) => {
  const res = await fetch(`${API_URL}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(noteData),
  });

  if (!res.ok) {
    throw new Error("Failed to create note");
  }

  return res.json();
};