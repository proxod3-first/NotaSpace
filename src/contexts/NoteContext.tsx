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

  archivedNotes: Note[];
  setArchivedNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  trashedNotes: Note[];
  setTrashedNotes: React.Dispatch<React.SetStateAction<Note[]>>;

  // API функции для работы с заметками
  fetchNotes: () => void;
  fetchNoteById: (id: string) => void;
  fetchNotesByNoteBook: (notebookId: string) => void;
  fetchNotesByTagS: (tagIds: string[]) => void;
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

  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]); // Список архивированных заметок
  const [trashedNotes, setTrashedNotes] = useState<Note[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setActiveNoteId = (id: string | null) => {
    const note = notes?.find((note) => note.id === id);
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
      setError("Ошибка при загрузке заметок из книги");
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
            note.id === updatedNote.id
              ? { ...note, notebook_id: notebookId }
              : note
          )
        );
        setLoading(false);
      } else {
        setError("Не удалось переместить заметку в книгу");
        setLoading(false);
      }
    } catch (error) {
      console.error(
        "Произошла ошибка при перемещении заметки в новую книгу:",
        error
      );
      setError("Произошла ошибка при перемещении заметки");
      setLoading(false);
    }
  };

  //////////////////////////////////////////////////////

  // Загрузка всех заметок из корзины
  const fetchTrashAllNotesHandler = async () => {
    try {
      const temp_trashNotes = await fetchTrashNotes();
      setTrashedNotes(temp_trashNotes);
    } catch (error) {
      setError("Ошибка при загрузке заметок из корзины");
    } finally {
      setLoading(false);
    }
  };

  // Загрузка всех архивных заметок
  const fetchArchiveAllNotesHandler = async () => {
    try {
      const temp_archivedNotes = await fetchArchivedNotes();
      setArchivedNotes(temp_archivedNotes);
    } catch (error) {
      setError("Ошибка при загрузке архивных заметок");
    } finally {
      setLoading(false);
    }
  };

  // Перемещение заметки в корзину
  const moveNoteIntoTrashHandler = async (noteId: string) => {
    try {
      setLoading(true);
      await moveNoteToTrash(noteId);

      // Обновляем статус заметки в основной коллекции
      setNotes((prev) =>
        prev?.map((note) =>
          note.id === noteId ? { ...note, is_deleted: true } : note
        )
      );

      // Перемещаем заметку в корзину
      setTrashedNotes((prevTrashedNotes) => {
        const updatedTrashedNotes = Array.isArray(prevTrashedNotes)
          ? [
              ...prevTrashedNotes,
              notes?.find((note) => note.id === noteId) as Note,
            ]
          : [notes?.find((note) => note.id === noteId) as Note]; // если prevTrashedNotes не массив, создаём новый массив с одной заметкой
        return updatedTrashedNotes;
      });
    } catch (error) {
      setError("Ошибка при перемещении в корзину");
    } finally {
      setLoading(false);
    }
  };

  // Восстановление заметки из корзины
  const restoreNoteTrashHandler = async (noteId: string) => {
    try {
      setLoading(true);
      await restoreNoteFromTrash(noteId);

      // Обновляем статус заметки в основной коллекции
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, is_deleted: false } : note
        )
      );

      // Удаляем заметку из корзины
      setTrashedNotes((prev) => prev?.filter((note) => note.id !== noteId));
    } catch (error) {
      setError("Ошибка при восстановлении из корзины");
    } finally {
      setLoading(false);
    }
  };

  // Удаление заметки окончательно
  const deleteNoteApi = async (id: string) => {
    try {
      setLoading(true);
      await deleteNote(id);

      // Удаляем заметку из всех коллекций
      setNotes((prev) => prev?.filter((note) => note.id !== id));
      setTrashedNotes((prev) => prev?.filter((note) => note.id !== id));
      setArchivedNotes((prev) => prev?.filter((note) => note.id !== id));
    } catch (error) {
      setError("Не удалось удалить заметку");
    } finally {
      setLoading(false);
    }
  };

  // Перемещение заметки в архив
  const moveNoteIntoArchiveHandler = async (noteId: string) => {
    try {
      setLoading(true);
      await moveNoteToArchive(noteId);

      // Обновляем статус заметки в основной коллекции
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, is_archived: true } : note
        )
      );

      // Перемещаем заметку в архив
      setArchivedNotes((prevArchivedNotes) => {
        const updatedArchivedNotes = Array.isArray(prevArchivedNotes)
          ? [
              ...prevArchivedNotes,
              notes?.find((note) => note.id === noteId) as Note,
            ]
          : [notes?.find((note) => note.id === noteId) as Note]; // если prevArchivedNotes не массив, создаём новый массив с одной заметкой
        return updatedArchivedNotes;
      });
    } catch (error) {
      setError("Ошибка при перемещении в архив");
    } finally {
      setLoading(false);
    }
  };

  // Восстановление заметки из архива
  const restoreNoteArchiveHandler = async (noteId: string) => {
    try {
      setLoading(true);
      await restoreNoteFromArchive(noteId);

      // Обновляем статус заметки в основной коллекции
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, is_archived: false, is_deleted: false }
            : note
        )
      );

      // Удаляем заметку из архива
      setArchivedNotes((prev) => prev?.filter((note) => note.id !== noteId));
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
        setArchivedNotes,
        trashedNotes,
        setTrashedNotes,

        fetchNotes: fetchNotesHandler,
        fetchNoteById: fetchNoteByIdHandler,
        fetchNotesByNoteBook: fetchNotesByNotebookHandler,
        fetchNotesByTagS: fetchNotesByTagsHandler,
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
  const contexts = useContext(NoteContext);
  if (!contexts) {
    throw new Error("useMainContext must be used within a MainProvider");
  }
  return contexts;
}
