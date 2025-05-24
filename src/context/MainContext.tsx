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
};
const MainContext = createContext<MainContextType | undefined>(undefined);

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

  return (
    <MainContext.Provider
      value={{
        notes,
        setNotes,
        notebooks,
        setNotebooks,
        activeNote,
        setActiveNote,
        activeNotebook,
        setActiveNotebook,
        loading,
        setLoading,
        error,
        setError,
        deleteNoteApi,
        moveNote,
      }}
    >
      {children}
    </MainContext.Provider>
  );
}

export function useMainContext() {
  const context = useContext(MainContext);
  if (!context) {
    throw new Error("useMainContext must be used within a MainProvider");
  }
  return context;
}
