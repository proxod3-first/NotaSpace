import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Tag } from "../types";
import { fetchTags, createTag, deleteTag } from "../services/tagsApi";
import { updateTag as updateTagApi } from "../services/tagsApi"; // Используем правильную функцию из API

// Интерфейс для контекста
interface TagContextType {
  tags: Tag[];
  addTag: (name: string, color: string) => Promise<void>;
  updateTag: (id: string, name: string, color: string) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  getTagById: (id: string) => Tag | undefined;
}

// Тип для пропсов компонента TagProvider, где children — это любой React компонент
interface TagProviderProps {
  children: ReactNode;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

// Провайдер контекста
export const TagProvider: React.FC<TagProviderProps> = ({ children }) => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    // Загрузка тегов при монтировании компонента
    const loadTags = async () => {
      const fetchedTags = await fetchTags();
      setTags(fetchedTags);
    };
    loadTags();
  }, []);

  const addTag = async (name: string, color: string) => {
    const newTag = await createTag({ name, color });
    if (newTag) {
      setTags((prevTags) => {
        return newTag ? [...prevTags, newTag] : prevTags;
      });
    } else {
      console.error("Error creating tag");
    }
  };

  const updateTag = async (id: string, name: string, color: string) => {
    // Здесь используем правильную функцию updateTagApi, чтобы избежать рекурсии
    const updatedTag = await updateTagApi(id, { name, color });

    if (updatedTag) {
      // Обновляем состояние с новым тегом
      setTags(
        (prevTags) => prevTags.map((tag) => (tag.id === id ? updatedTag : tag)) // Обновляем только тот тег, который был изменен
      );
    } else {
      console.error("Error updating tag");
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
      value={{ tags, addTag, updateTag, removeTag, getTagById }}
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
