export type Note = {
  id: string;
  title: string | null;
  content: string | null;
  folderId: string | null;
  created_at: string;
  updated_at: string;
};

export type Folder = {
  id: string;
  name: string;
  created_at: string;
};