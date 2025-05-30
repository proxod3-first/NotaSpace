import React, { createContext, useContext, useState, ReactNode } from "react";

interface NotesVisibilityContextType {
  showArchived: boolean;
  setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
  showTrashed: boolean;
  setShowTrashed: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotesVisibilityContext = createContext<
  NotesVisibilityContextType | undefined
>(undefined);

export const NotesVisibilityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showArchived, setShowArchived] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
    
  return (
    <NotesVisibilityContext.Provider
      value={{ showArchived, setShowArchived, showTrashed, setShowTrashed }}
    >
      {children}
    </NotesVisibilityContext.Provider>
  );
};

export const useNotesVisibility = (): NotesVisibilityContextType => {
  const context = useContext(NotesVisibilityContext);
  if (!context) {
    throw new Error(
      "useNotesVisibility must be used within a NotesVisibilityProvider"
    );
  }
  return context;
};
