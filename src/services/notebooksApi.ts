import { Notebook } from "../types";

const BASE_URL = `${process.env.REACT_APP_BASE_URL}/notebooks`;
// Получить книгу по ID
export async function getNotebook(id: string): Promise<Notebook | null> {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error(`Ошибка при получении книги: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Произошла ошибка при получении книги:", error);
    return null;
  }
}

// Получить все книги
export async function fetchNotebooks(): Promise<Notebook[]> {
  try {
    const res = await fetch(`${BASE_URL}`);
    if (!res.ok) {
      throw new Error(`Ошибка при получении списка книг: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error("Произошла ошибка при получении списка книг:", error);
    return [];
  }
}

// Создать книгу
export async function createNotebook(
  notebook: Omit<Notebook, "id">
): Promise<Notebook | null> {
  try {
    const res = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notebook),
    });
    if (!res.ok) {
      throw new Error(`Ошибка при создании книги: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data ? json.data[0] : null; // Возвращаем первую книгу из массива, если она есть
  } catch (error) {
    console.error("Произошла ошибка при создании книги:", error);
    return null;
  }
}

// Обновить книгу
export async function updateNotebook(
  id: string,
  notebook: Omit<Notebook, "id">
): Promise<Notebook | null> {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(notebook),
    });
    if (!res.ok) {
      throw new Error(`Ошибка при обновлении книги: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Произошла ошибка при обновлении книги:", error);
    return null;
  }
}

// Удалить книгу
export async function deleteNotebook(id: string): Promise<number | null> {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(`Ошибка при удалении книги: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Произошла ошибка при удалении книги:", error);
    return null;
  }
}
