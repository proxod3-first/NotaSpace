import { useMemo, useState } from "react";
import { Notebook } from "../types";

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
