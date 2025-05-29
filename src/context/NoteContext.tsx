import React, { createContext, useContext, useState } from "react";
import { Note, Notebook } from "../types/index";
import {
  getNote,
  fetchNotes,
  deleteNote,
  fetchNotesByNotebook,
  fetchNotesByTags,
  moveNoteToTrash,
  restoreNoteFromTrash,
  createNote,
  updateNote,
  addTagToNote,
  removeTagFromNote,
  fetchTrashNotes,
  fetchArchivedNotes,
  moveNoteToArchive,
  restoreNoteFromArchive,
  changeNoteNotebook,
} from "../services/notesApi";

type MainContextType = {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;

  notebooks: Notebook[];
  setNotebooks: React.Dispatch<React.SetStateAction<Notebook[]>>;

  activeNote: Note | null;
  setActiveNote: (note: Note | null) => void;
  setActiveNoteId: (id: string | null) => void;

  activeNotebook: Notebook | null;
  setActiveNotebook: (notebook: Notebook | null) => void;

  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;

  moveNoteToNewNotebook: (
    noteId: string,
    targetNotebookId: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => void;

  // Архивация
  fetchArchiveAllNotes: () => void; // Добавлено сюда
  moveNoteIntoArchive: (noteId: string) => void;
  restoreNoteArchive: (noteId: string) => void;

  deleteNoteApi: (id: string) => Promise<void>;

  // Корзина
  fetchTrashAllNotes: () => void; // Добавлено сюда
  moveNoteIntoTrash: (noteId: string) => void;
  restoreNoteTrash: (noteId: string) => void;

  // Получаем архивированные и удаленные заметки
  archivedNotes: Note[];
  trashedNotes: Note[];

  // API функции для работы с заметками
  fetchNotes: () => void;
  fetchNoteById: (id: string) => void;
  fetchNotesByNotebook: (notebookId: string) => void;
  fetchNotesByTags: (tagIds: string[]) => void;
  createNoteApi: (
    note: Omit<Note, "id" | "is_deleted" | "is_archived">
  ) => void;
  updateNoteApi: (
    id: string,
    note: Pick<Note, "name" | "text" | "color" | "order" | "tags">
  ) => void;
  addTagToNoteApi: (noteId: string, tagId: string) => void;
  removeTagFromNoteApi: (noteId: string, tagId: string) => void;
};

const NoteContext = createContext<MainContextType | undefined>(undefined);

export function MainProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);

  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setActiveNoteId = (id: string | null) => {
    const note = notes.find((note) => note.id === id);
    console.log("setActiveNote: ", note);
    setActiveNote(note || null);
  };

  // API Функции для работы с заметками
  const fetchNotesHandler = async () => {
    try {
      setLoading(true);
      const fetchedNotes = await fetchNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      setError("Ошибка при загрузке заметок");
    } finally {
      setLoading(false);
    }
  };

  const fetchNoteByIdHandler = async (id: string) => {
    try {
      setLoading(true);
      const note = await getNote(id);
      setActiveNote(note);
    } catch (error) {
      setError("Ошибка при загрузке заметки");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotesByNotebookHandler = async (notebookId: string) => {
    try {
      setLoading(true);
      const notesByNotebook = await fetchNotesByNotebook(notebookId);
      setNotes(notesByNotebook);
    } catch (error) {
      setError("Ошибка при загрузке заметок из блокнота");
    } finally {
      setLoading(false);
    }
  };

  const fetchNotesByTagsHandler = async (tagIds: string[]) => {
    try {
      setLoading(true);
      const notesByTags = await fetchNotesByTags(tagIds);
      setNotes(notesByTags);
    } catch (error) {
      setError("Ошибка при загрузке заметок по тегам");
    } finally {
      setLoading(false);
    }
  };

  const createNoteApiHandler = async (
    note: Omit<Note, "id" | "is_deleted" | "is_archived">
  ) => {
    try {
      setLoading(true);
      const createdNote = await createNote(note);
      setNotes((prev) => {
        const validNotes = createdNote ? [...prev, createdNote] : prev; // Добавляем только если createdNote не null
        return validNotes;
      });
    } catch (error) {
      setError("Ошибка при создании заметки");
    } finally {
      setLoading(false);
    }
  };

  const updateNoteApiHandler = async (
    id: string,
    note: Pick<Note, "name" | "text" | "color" | "order" | "tags">
  ) => {
    try {
      setLoading(true);
      const updatedNote = await updateNote(id, note);
      setNotes((prev) =>
        prev.map((n) => (n.id === id && updatedNote ? updatedNote : n))
      );
    } catch (error) {
      setError("Ошибка при обновлении заметки");
    } finally {
      setLoading(false);
    }
  };

  const addTagToNoteApiHandler = async (noteId: string, tagId: string) => {
    try {
      setLoading(true);
      const updatedNote = await addTagToNote(noteId, tagId);
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId && updatedNote ? updatedNote : n))
      );
    } catch (error) {
      setError("Ошибка при добавлении тэга");
    } finally {
      setLoading(false);
    }
  };

  const removeTagFromNoteApiHandler = async (noteId: string, tagId: string) => {
    try {
      setLoading(true);
      const updatedNote = await removeTagFromNote(noteId, tagId);
      setNotes((prev) =>
        prev.map((n) => (n.id === noteId && updatedNote ? updatedNote : n))
      );
    } catch (error) {
      setError("Ошибка при удалении тэга");
    } finally {
      setLoading(false);
    }
  };



  const moveNoteToNewNotebook = async (noteId: string, notebookId: string) => {
  try {
    setLoading(true);
    // Используем уже существующую ручку
    const updatedNote = await changeNoteNotebook(noteId, notebookId);
    
    if (updatedNote) {
      // Обновляем заметки в контексте, если операция успешна
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === updatedNote.id ? { ...note, notebook_id: notebookId } : note
        )
      );
      setLoading(false);
    } else {
      setError("Не удалось переместить заметку в блокнот");
      setLoading(false);
    }
  } catch (error) {
    console.error("Произошла ошибка при перемещении заметки в новый блокнот:", error);
    setError("Произошла ошибка при перемещении заметки");
    setLoading(false);
  }
};


  //////////////////////////////////////////////////////

  // Фильтруем архивированные и удаленные заметки
  const archivedNotes = notes.filter((note) => note.is_archived);
  const trashedNotes = notes.filter((note) => note.is_deleted);

  const fetchTrashAllNotesHandler = async () => {
    try {
      setLoading(true);
      const trashNotes = await fetchTrashNotes();
      setNotes(trashNotes);
    } catch (error) {
      setError("Ошибка при загрузке заметок из корзины");
    } finally {
      setLoading(false);
    }
  };

  const moveNoteIntoTrashHandler = async (noteId: string) => {
    try {
      setLoading(true);
      await moveNoteToTrash(noteId);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, is_deleted: true } : note
        )
      );
    } catch (error) {
      setError("Ошибка при перемещении в корзину");
    } finally {
      setLoading(false);
    }
  };

  const restoreNoteTrashHandler = async (noteId: string) => {
    try {
      setLoading(true);
      await restoreNoteFromTrash(noteId);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, is_deleted: false } : note
        )
      );
    } catch (error) {
      setError("Ошибка при восстановлении из корзины");
    } finally {
      setLoading(false);
    }
  };

  const deleteNoteApi = async (id: string) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((note) => note.id !== id));
      setActiveNote((prev) => (prev?.id === id ? null : prev));
    } catch (error) {
      setError("Не удалось удалить заметку");
    }
  };

  const fetchArchiveAllNotesHandler = async () => {
    try {
      setLoading(true);
      const archivedNotes = await fetchArchivedNotes();
      setNotes(archivedNotes);
    } catch (error) {
      setError("Ошибка при загрузке архивных заметок");
    } finally {
      setLoading(false);
    }
  };

  const moveNoteIntoArchiveHandler = async (noteId: string) => {
    try {
      setLoading(true);
      await moveNoteToArchive(noteId);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, is_archived: true } : note
        )
      );
    } catch (error) {
      setError("Ошибка при перемещении в архив");
    } finally {
      setLoading(false);
    }
  };

  const restoreNoteArchiveHandler = async (noteId: string) => {
    try {
      setLoading(true);
      await restoreNoteFromArchive(noteId);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, is_archived: false, is_deleted: false }
            : note
        )
      );
    } catch (error) {
      setError("Ошибка при восстановлении из архива");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        setNotes,
        notebooks,
        setNotebooks,
        activeNote,
        setActiveNote,
        setActiveNoteId,
        activeNotebook,
        setActiveNotebook,
        loading,
        setLoading,
        error,
        setError,
        deleteNoteApi,

        moveNoteToNewNotebook,

        fetchTrashAllNotes: fetchTrashAllNotesHandler,
        moveNoteIntoTrash: moveNoteIntoTrashHandler,
        restoreNoteTrash: restoreNoteTrashHandler,

        fetchArchiveAllNotes: fetchArchiveAllNotesHandler,
        moveNoteIntoArchive: moveNoteIntoArchiveHandler,
        restoreNoteArchive: restoreNoteArchiveHandler,

        archivedNotes,
        trashedNotes,

        fetchNotes: fetchNotesHandler,
        fetchNoteById: fetchNoteByIdHandler,
        fetchNotesByNotebook: fetchNotesByNotebookHandler,
        fetchNotesByTags: fetchNotesByTagsHandler,
        createNoteApi: createNoteApiHandler,
        updateNoteApi: updateNoteApiHandler,
        addTagToNoteApi: addTagToNoteApiHandler,
        removeTagFromNoteApi: removeTagFromNoteApiHandler,
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
