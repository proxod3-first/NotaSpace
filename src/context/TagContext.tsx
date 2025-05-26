import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Tag } from "../types";
import { fetchTags, createTag, deleteTag, getTag } from "../services/tagsApi";
import { updateTag as updateTagApi } from "../services/tagsApi"; // Используем правильную функцию из API

// Интерфейс для контекста
interface TagContextType {
  tags: Tag[];
  addTag: (name: string, color: string) => Promise<void>;
  updateTag: (id: string, name: string, color: string) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  getTagById: (id: string) => Tag | undefined;
  loading: boolean; // Флаг загрузки
}

// Тип для пропсов компонента TagProvider, где children — это любой React компонент
interface TagProviderProps {
  children: ReactNode;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

// Провайдер контекста
export const TagProvider: React.FC<TagProviderProps> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Состояние для загрузки

  useEffect(() => {
    // Загрузка тегов при монтировании компонента
    const loadTags = async () => {
      const fetchedTags = await fetchTags();
      setTags(fetchedTags);
    };
    loadTags();
  }, []);

  const addTag = async (name: string, color: string): Promise<void> => {
    try {
      const newTagId = await createTag({ name, color });
      console.log("New tag ID from createTag:", newTagId);

      if (newTagId) {
        const newTag = await getTag(newTagId);
        console.log("Full new tag object:", newTag);

        if (newTag) {
          setTags((prevTags) => {
            if (Array.isArray(prevTags)) {
              return [...prevTags, newTag];
            } else {
              console.error("prevTags is not an array");
              return prevTags;
            }
          });
        } else {
          console.error("Error fetching full tag object.");
        }
      } else {
        console.error("Error creating tag: newTagId is undefined");
      }
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const updateTag = async (id: string, name: string, color: string) => {
    try {
      // Здесь используем правильную функцию updateTagApi, чтобы избежать рекурсии
      await updateTagApi(id, { name, color });

      // Обновляем только тот тег, который был изменен
      setTags((prevTags) =>
        prevTags.map(
          (tag) => (tag.id === id ? { ...tag, name, color } : tag) // Обновляем только тег с id === id
        )
      );
    } catch (error) {
      console.error("Error updating tag:", error);
    }
  };

  const removeTag = async (id: string) => {
    await deleteTag(id);
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
  };

  const getTagById = (id: string) => {
    return tags.find((tag) => tag.id === id);
  };

  return (
    <TagContext.Provider
      value={{ tags, addTag, updateTag, removeTag, getTagById, loading }}
    >
      {children}
    </TagContext.Provider>
  );
};

// Хук для использования контекста
export const useTags = () => {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error("useTags must be used within a TagProvider");
  }
  return context;
};
