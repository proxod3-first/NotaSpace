import React, { useEffect } from "react";
import { useNotes } from "../context/NotesContext";
import NoteForm from "../components/NoteForm";
import { fetchNotes, createNote, deleteNote } from "../services/notesApi";
import { Note } from "../types/index";

export default function Notes() {
  const { notes, setNotes, loading, setLoading, error, setError } = useNotes();

  useEffect(() => {
    setLoading(true);
    fetchNotes()
      .then((data) => {
        console.log("Извлеченные заметки:", data);
        setNotes(Array.isArray(data) ? data : []); // ✅ Защита от null/undefined
        setLoading(false);
      })
      .catch(() => {
        setError("Ошибка загрузки заметок");
        setLoading(false);
      });
  }, [setNotes, setLoading, setError]);

  const handleCreate = async (newNoteData: Omit<Note, "id" | "is_deleted">) => {
    try {
      await createNote(newNoteData);
      const updated = await fetchNotes();
      setNotes(updated);
    } catch {
      setError("Не удалось создать заметку");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
    } catch {
      setError("Не удалось удалить заметку");
    }
  };

  if (loading) return <div className="p-4">Загрузка...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <NoteForm onSubmit={handleCreate} />

      <div className="mt-6 space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="border border-gray-300 p-4 rounded shadow bg-white"
          >
            <div className="font-semibold text-lg">{note.name}</div>
            <p className="text-gray-700">{note.text}</p>
            <div className="mt-2 text-sm text-gray-500">Цвет: {note.color}</div>
            <button
              onClick={() => handleDelete(note.id)}
              className="mt-2 text-red-600 hover:underline"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
