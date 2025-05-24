export interface Note {
  id: string;
  name: string;
  text: string;
  color: string;
  media: string;
  order: number;
  is_deleted: boolean;
  notebook_id: string;
  tags: string[];
}

export interface Notebook {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}
