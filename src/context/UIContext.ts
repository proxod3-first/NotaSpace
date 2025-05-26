import { createContext } from "react";

type UIContextProps = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isNoteListOpen: boolean;
  toggleNoteList: () => void;
};

export const UIContext = createContext<UIContextProps>({
  isSidebarOpen: false,
  toggleSidebar: () => {}, // Пустая функция по умолчанию
  isNoteListOpen: false,
  toggleNoteList: () => {}, // Пустая функция по умолчанию
});
