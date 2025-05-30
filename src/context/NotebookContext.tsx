import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Notebook, Note } from "../types";
import {
  fetchNotebooks,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  getNotebook,
} from "../services/notebooksApi";

// Интерфейс для контекста
interface NotebookContextType {
  notebooks: Notebook[];
  setNotebooks: React.Dispatch<React.SetStateAction<Notebook[]>>;
  notesInNotebook: (id: string) => Note[];

  getNotebookById: (id: string) => Promise<Notebook | null>; // Обновили тип, так как функция асинхронная

  activeNotebook: Notebook | null;
  setActiveNotebook: (id: string) => void;

  addNotebook: (name: string, description: string) => Promise<void>;
  updateNotebookInList: (
    id: string,
    name: string,
    description: string
  ) => Promise<void>;
  removeNotebook: (id: string) => Promise<void>;
}

// Тип для пропсов компонента NotebookProvider
interface NotebookProviderProps {
  children: ReactNode;
}

const NotebookContext = createContext<NotebookContextType | undefined>(
  undefined
);

export const NotebookProvider: React.FC<NotebookProviderProps> = ({
  children,
}) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]); // Инициализация с типом Notebook[]
  const [activeNotebookState, setActiveNotebookState] =
    useState<Notebook | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchAllNotebooks = async () => {
      try {
        const loadNotebooks = async () => {
          const fetchedNotebooks = await fetchNotebooks();
          setNotebooks(fetchedNotebooks);
        };
        loadNotebooks(); // Заполняем состояние данными
      } catch (error) {
        console.error("Error fetching notebooks:", error);
      }
    };

    fetchAllNotebooks();
  }, []);

  // Добавление новой книги
  const addNotebook = async (name: string, description: string) => {
    const newNotebook = await createNotebook({
      name,
      description,
      is_active: true,
    });
    if (newNotebook) {
      setNotebooks((prevNotebooks) => [...prevNotebooks, newNotebook]);
      setActiveNotebookState(newNotebook); // <-- здесь!
    } else {
      console.error("Error creating notebook");
    }
  };

  // Обновление информации о книге
  const updateNotebookInList = async (
    id: string,
    name: string,
    description: string
  ) => {
    const updatedNotebook = await updateNotebook(id, {
      name,
      description,
      is_active: true,
    });
    if (updatedNotebook) {
      setNotebooks((prevNotebooks) =>
        prevNotebooks.map((notebook) =>
          notebook.id === id ? updatedNotebook : notebook
        )
      );
    } else {
      console.error("Error updating notebook");
    }
  };

  // Удаление книги
  const removeNotebook = async (id: string) => {
    await deleteNotebook(id);
    setNotebooks((prevNotebooks) =>
      prevNotebooks?.filter((notebook) => notebook.id !== id)
    );
  };

  // Получение книги по ID
  // Типизация функции для получения книги по ID
  // Типизация функции для получения книги по ID
  const getNotebookById = async (id: string): Promise<Notebook | null> => {
    try {
      const notebook = await getNotebook(id); // предполагаем, что getNotebook возвращает Promise<Notebook | null>

      if (notebook === null) {
        return null; // Если возвращается null, вернем undefined
      }

      return notebook; // Возвращаем полученную книгу
    } catch (error) {
      console.error("Error fetching notebook:", error);
      return null; // В случае ошибки возвращаем undefined
    }
  };

  // Получение всех заметок в определенной книге
  const notesInNotebook = (id: string) => {
    return notes?.filter((note) => note.notebook_id === id);
  };

  const setActiveNotebook = (id: string) => {
    const notebook = notebooks?.find((notebook) => notebook.id === id);
    console.log("setActiveNotebook =", notebook);
    setActiveNotebookState(notebook || null); // Если книга найдена, устанавливаем её, иначе null
  };

  return (
    <NotebookContext.Provider
      value={{
        notebooks,
        setNotebooks,
        addNotebook,
        updateNotebookInList,
        removeNotebook,
        getNotebookById,
        activeNotebook: activeNotebookState,
        setActiveNotebook,
        notesInNotebook,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
};

// Хук для использования контекста
export const useNotebooks = () => {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error("useNotebooks must be used within a NotebookProvider");
  }
  return context;
};
