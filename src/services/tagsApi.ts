import { Tag } from "../types";

const BASE_URL = "http://localhost:8085/api/v1";


// Получить тэг по ID
export async function getTag(id: string): Promise<Tag> {
  const res = await fetch(`${BASE_URL}/tags/${id}`);
  const json = await res.json();
  return json?.data || null;
}

// Получить все тэги
export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(`${BASE_URL}/tags`);
  const json = await res.json();
  return json.data;
}

// Создать тэг
export async function createTag(tag: Omit<Tag, "id">): Promise<Tag> {
  const res = await fetch(`${BASE_URL}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag),
  });
  const json = await res.json();
  return json.data;
}

// Изменить тэг
export async function updateTag(
  id: string,
  tag: Omit<Tag, "id">
): Promise<Tag> {
  const res = await fetch(`${BASE_URL}/tags/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tag),
  });
  const json = await res.json();
  return json.data;
}

// Удалить тэг
export async function deleteTag(id: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/tags/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  return json.data;
}
