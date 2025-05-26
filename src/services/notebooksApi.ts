import { Notebook } from "../types";

const BASE_URL = "http://localhost:8085/api/v1";

// Получить книгу по ID
export async function getNotebook(id: string): Promise<Notebook> {
  const res = await fetch(`${BASE_URL}/notebooks/${id}`);
  const json = await res.json();
  return json.data;
}

// Получить все книги
export async function fetchNotebooks(): Promise<Notebook[]> {
  const res = await fetch(`${BASE_URL}/notebooks`);
  const json = await res.json();
  return json.data;
}

// Создать книгу
export async function createNotebook(
  notebook: Omit<Notebook, "id">
): Promise<Notebook> {
  const res = await fetch(`${BASE_URL}/notebooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notebook),
  });
  const json = await res.json();
  return json.data[0];
}

// Обновить книгу
export async function updateNotebook(
  id: string,
  notebook: Omit<Notebook, "id">
): Promise<Notebook> {
  const res = await fetch(`${BASE_URL}/notebooks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(notebook),
  });
  const json = await res.json();
  return json.data;
}

// Удалить книгу
export async function deleteNotebook(id: string): Promise<number> {
  const res = await fetch(`${BASE_URL}/notebooks/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  return json.data;
}
