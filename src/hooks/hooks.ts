import { useMemo, useState } from "react";
import { Notebook } from "../types";
import {  useEffect } from 'react';
import { Tag } from '../types'; // Тип для тега


export const useToggleItem = (defaultValue = false): [boolean, () => void] => {
  const [isActive, setIsActive] = useState(defaultValue);
  const toggle = () => setIsActive(!isActive);

  return [isActive, toggle];
};

interface UseActiveNotebookParams {
  notebookId: string | null;
  notebooks: Record<string, Notebook>;
}

export const useGetActiveNotebook = ({
  notebookId,
  notebooks,
}: UseActiveNotebookParams): Notebook | null => {
  return useMemo(() => {
    if (!notebookId) {
      // "Все заметки" — это не настоящая тетрадь, возвращаем null
      return null;
    }

    return notebooks[notebookId] || null;
  }, [notebookId, notebooks]);
};



export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('http://localhost:8085/api/v1/tags');
        const data = await response.json();
        setTags(data.data);
      } catch (error) {
        console.error('Ошибка при загрузке тегов', error);
      }
    };

    fetchTags();
  }, []);

  return tags;
};