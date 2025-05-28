import { Note } from "../types/index";

const BASE_URL = "http://localhost:8085/api/v1";

// Получить заметку по id
export async function getNote(id: string): Promise<Note | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/${id}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при получении заметки:", error);
    return null;
  }
}

// Получить все заметки
export async function fetchNotes(): Promise<Note[]> {
  try {
    const res = await fetch(`${BASE_URL}/notes`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при получении списка заметок:", error);
    return [];
  }
}

// Получить все заметки из корзины (is_deleted: true)
export async function fetchTrashNotes(): Promise<Note[]> {
  try {
    const res = await fetch(`${BASE_URL}/notes/trash`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при получении заметок из корзины:", error);
    return [];
  }
}

// Восстановить заметку из корзины (is_deleted: false)
export async function restoreNoteFromTrash(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/trash/${id}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error(
      "Произошла ошибка при восстановлении заметки из корзины:",
      error
    );
    return null;
  }
}

// Получить все заметки из архива
export async function fetchArchivedNotes(): Promise<Note[]> {
  try {
    const res = await fetch(`${BASE_URL}/notes/archive`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при получении заметок из архива:", error);
    return [];
  }
}

// Восстановить заметку из архива
export async function restoreNoteFromArchive(
  id: string
): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/archive/${id}`, {
      method: "GET",
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data; // сообщение об успехе
  } catch (error) {
    console.error(
      "Произошла ошибка при восстановлении заметки из архива:",
      error
    );
    return null;
  }
}

// Получить заметки по notebook_id
export async function fetchNotesByNotebook(
  notebookId: string
): Promise<Note[]> {
  try {
    const res = await fetch(`${BASE_URL}/notes/group/${notebookId}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при получении заметок по книжке:", error);
    return [];
  }
}

// Получить заметки по тегам (POST /notes/tag)
export async function fetchNotesByTags(tagIds: string[]): Promise<Note[]> {
  try {
    const res = await fetch(`${BASE_URL}/notes/tag`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags: tagIds }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при получении заметок по тегам:", error);
    return [];
  }
}

// Создать новую заметку
export async function createNote(
  note: Omit<Note, "id" | "is_deleted" | "is_archived">
): Promise<Note | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...note,
        is_deleted: false, // по-умолчанию false
        is_archived: false, // по-умолчанию false
      }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при создании заметки:", error);
    return null;
  }
}

// Изменить заметку (без поля is_deleted, is_archived, tags)
export async function updateNote(
  id: string,
  note: Pick<Note, "name" | "text" | "color" | "order" | "tags">
): Promise<Note | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при изменении заметки:", error);
    return null;
  }
}

// Изменить книгу у заметки (перемещение в другую книгу заметки)
export async function changeNoteNotebook(
  id: string,
  notebook_id: string
): Promise<Note | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/notebook/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notebook_id }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при изменении книги заметки:", error);
    return null;
  }
}

// Добавить тег к заметке
export async function addTagToNote(
  noteId: string,
  tagId: string
): Promise<Note | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/tag/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_id: tagId }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при добавлении тега к заметке:", error);
    return null;
  }
}

// Удалить тег у заметки
export async function removeTagFromNote(
  noteId: string,
  tagId: string
): Promise<Note | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/tag/${noteId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag_id: tagId }),
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при удалении тега у заметки:", error);
    return null;
  }
}

// Удалить заметку по id
export async function deleteNote(id: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при удалении заметки:", error);
    return null;
  }
}

// Переместить заметку в корзину (is_deleted: true)
export async function moveNoteToTrash(id: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/trash/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка при перемещении заметки в корзину:", error);
    return null;
  }
}

// Переместить заметку в архив (изменить значение поля is_archived на true)
export async function moveNoteToArchive(id: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/notes/archive/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.data; // сообщение об успехе
  } catch (error) {
    console.error("Произошла ошибка при перемещении заметки в архив:", error);
    return null;
  }
}
