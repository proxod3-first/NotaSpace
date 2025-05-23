import { Note } from "../types/index";

const BASE_URL = "http://localhost:8085/api/v1";

// Получить все заметки
export async function fetchNotes(): Promise<Note[]> {
  const res = await fetch(`${BASE_URL}/notes`);
  const json = await res.json();
  console.log("JSON get notes:", json);
  return json.data;
}

// Создать новую заметку
export async function createNote(
  note: Omit<Note, "id" | "is_deleted">
): Promise<string> {
  console.log("JSON post note:", note);
  const res = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...note,
      is_deleted: false,
    }),
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
  return json.data; // возвращает 1 при успехе
}
