import { Note } from "../types/index";

const BASE_URL = "http://localhost:8085/api/v1";


// Получить заметку по id
export async function getNote(id: string): Promise<Note> {
  const res = await fetch(`${BASE_URL}/notes/${id}`);
  const json = await res.json();
  return json.data;
}

// Получить все заметки
export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${BASE_URL}/notes`);
  const json = await res.json();
  return json.data;
}

// Получить все заметки из корзины (is_deleted: true)
export async function fetchTrashNotes(): Promise<Note[]> {
  const res = await fetch(`${BASE_URL}/notes/trash`);
  const json = await res.json();
  return json.data;
}

// Восстановить заметку из корзины (is_deleted: false)
export async function restoreNoteFromTrash(id: string): Promise<Note> {
  const res = await fetch(`${BASE_URL}/notes/trash/${id}`);
  const json = await res.json();
  return json.data;
}

// Получить заметки по notebook_id
export async function fetchNotesByNotebook(
  notebookId: string
): Promise<Note[]> {
  const res = await fetch(`${BASE_URL}/notes/group/${notebookId}`);
  const json = await res.json();
  return json.data;
}

// Получить заметки по тегам (POST /notes/tag)
export async function fetchNotesByTags(tagIds: string[]): Promise<Note[]> {
  const res = await fetch(`${BASE_URL}/notes/tag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags: tagIds }),
  });
  const json = await res.json();
  return json.data;
}

// Создать новую заметку
export async function createNote(
  note: Omit<Note, "id" | "is_deleted">
): Promise<Note> {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...note,
      is_deleted: false, // по-умолчанию false
    }),
  });
  const json = await res.json();
  return json.data;
}

// Изменить заметку (без поля media, is_deleted, tags)
export async function updateNote(
  id: string,
  note: Pick<Note, "name" | "text" | "color" | "order" | "tags">
): Promise<Note> {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  const json = await res.json();
  return json.data;
}

// Изменить книгу у заметки (перемещение в другую книгу заметки)
export async function changeNoteNotebook(
  id: string,
  notebook_id: string
): Promise<Note> {
  const res = await fetch(`${BASE_URL}/notes/notebook/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notebook_id }),
  });
  const json = await res.json();
  return json.data;
}

// Добавить тег к заметке
export async function addTagToNote(
  noteId: string,
  tagId: string
): Promise<Note> {
  const res = await fetch(`${BASE_URL}/notes/tag/${noteId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag_id: tagId }),
  });
  const json = await res.json();
  return json.data;
}


// Убрать тег у заметки
export async function removeTagFromNote(
  noteId: string,
  tagId: string
): Promise<Note> {
  console.log("PATCH: ", noteId, tagId);
  const res = await fetch(`${BASE_URL}/notes/tag/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag_id: tagId }),
  });
  const json = await res.json();
  return json.data;
}

// Удалить заметку по id
export async function deleteNote(id: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  return json.data;
}

// Переместить заметку в корзину (is_deleted: true)
export async function moveNoteToTrash(id: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/notes/trash/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  return json.data;
}
