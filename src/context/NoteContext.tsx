import React, { createContext, useContext, useState } from "react";
import { Note, Notebook } from "../types/index";
import { deleteNote } from "../services/notesApi";

type MainContextType = {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;

  notebooks: Notebook[];
  setNotebooks: React.Dispatch<React.SetStateAction<Notebook[]>>;

  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  setActiveNoteState: (id: string | null) => void;

  activeNotebook: Notebook | null;
  setActiveNotebook: (notebook: Notebook | null) => void;

  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;

  deleteNoteApi: (id: string) => Promise<void>;

  moveNote: (
    noteId: string,
    targetNotebookId: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => void;

  // Архивация
  archiveNote: (noteId: string) => void;
  restoreNote: (noteId: string) => void;
  permanentlyDeleteNote: (noteId: string) => void;

  // Получаем архивированные и удаленные заметки
  archivedNotes: Note[];
  deletedNotes: Note[];
};
const NoteContext = createContext<MainContextType | undefined>(undefined);

export function MainProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteNoteApi = async (id: string) => {
    try {
      console.log("Deleting ID", id);
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setActiveNote((prev) => (prev?.id === id ? null : prev));
    } catch (error) {
      console.error(error);
      setError("Не удалось удалить заметку");
    }
  };

  const moveNote = (
    noteId: string,
    targetNotebookId: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => {
    try {
      setNotes((prev) => {
        const idx = prev.findIndex((n) => n.id === noteId);
        if (idx === -1) {
          onError("Заметка не найдена");
          return prev;
        }
        const updated = [...prev];
        updated[idx] = { ...updated[idx], notebook_id: targetNotebookId };
        onSuccess();
        return updated;
      });
    } catch (error) {
      onError("Ошибка при перемещении");
    }
  };

  const setActiveNoteState = (id: string | null) => {
    const note = notes.find((note) => note.id === id);
    setActiveNote(note || null); // Если книга найдена, устанавливаем её, иначе null
  };

  // Архивируем заметку
  const archiveNote = (noteId: string) => {
    setNotes((prev) => {
      const updatedNotes = prev.map((note) =>
        note.id === noteId ? { ...note, is_archived: true } : note
      );
      return updatedNotes;
    });
  };

  // Восстанавливаем заметку из архива
  const restoreNote = (noteId: string) => {
    setNotes((prev) => {
      const updatedNotes = prev.map((note) =>
        note.id === noteId
          ? { ...note, is_archived: false, is_deleted: false }
          : note
      );
      return updatedNotes;
    });
  };

  // Окончательное удаление заметки
  const permanentlyDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  // Фильтруем архивированные и удаленные заметки
  const archivedNotes = notes.filter((note) => note.is_archived);
  const deletedNotes = notes.filter((note) => note.is_deleted);
  
  return (
    <NoteContext.Provider
      value={{
        notes,
        setNotes,
        notebooks,
        setNotebooks,
        activeNote,
        setActiveNote,
        setActiveNoteState,
        activeNotebook,
        setActiveNotebook,
        loading,
        setLoading,
        error,
        setError,
        archiveNote,
        restoreNote,
        permanentlyDeleteNote,
        archivedNotes,
        deletedNotes,
        deleteNoteApi,
        moveNote,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useMainContext() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error("useMainContext must be used within a MainProvider");
  }
  return context;
}
