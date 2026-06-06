export type Note = {
  _id: string;
  title: string;
  category: string;
  topic?: string;
  tags: string[];
  content: string;
  codeSnippet?: string;
  language?: string;
  isPinned: boolean;
  isFavorite: boolean;
  lastViewedAt?: string;
  createdAt: string;
  updatedAt: string;
};
