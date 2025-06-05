import { Tag } from "../types";

const BASE_URL = `${process.env.REACT_APP_BASE_URL}/tags`;
// Получить тэг по ID
export async function getTag(id: string): Promise<Tag | null> {
  try {
    const res = await fetch(`${BASE_URL}/${id}`);
    if (!res.ok) {
      throw new Error(`Ошибка при получении тега: ${res.statusText}`);
    }
    const json = await res.json();
    return json?.data || null;
  } catch (error) {
    console.error("Произошла ошибка:", error);
    return null;
  }
}

// Получить все тэги
export async function fetchTags(): Promise<Tag[]> {
  try {
    const res = await fetch(`${BASE_URL}`);
    if (!res.ok) {
      throw new Error(`Ошибка при получении тегов: ${res.statusText}`);
    }
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка:", error);
    return [];
  }
}

// Создать тэг
export async function createTag(tag: Omit<Tag, "id">): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tag),
    });

    if (!res.ok) {
      throw new Error(`Ошибка при создании тега: ${res.statusText}`);
    }

    const json = await res.json();
    if (json.data) {
      return json.data; // Возвращаем id
    } else {
      console.error("Не удалось создать тег: нет данных в ответе");
      return null;
    }
  } catch (error) {
    console.error("Произошла ошибка при создании тега:", error);
    return null;
  }
}

// Изменить тэг
export async function updateTag(
  id: string,
  tag: Omit<Tag, "id">
): Promise<Tag | null> {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tag),
    });

    if (!res.ok) {
      throw new Error(`Ошибка при обновлении тега: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    console.error("Произошла ошибка при обновлении тега:", error);
    return null;
  }
}

// Удалить тэг
export async function deleteTag(id: string): Promise<number> {
  try {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Ошибка при удалении тега: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Произошла ошибка:", error);
    throw error; // Или можно вернуть что-то по умолчанию
  }
}
