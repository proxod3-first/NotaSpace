import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import { MainProvider } from "./contexts/NoteContext";
import { TagProvider } from "./contexts/TagContext";
import { NotebookProvider } from "./contexts/NotebookContext";
import GlobalStyle from "./styles/global";
import { NotesVisibilityProvider } from "./contexts/NotesVisibilityContext";

export default function App() {
  return (
    <MainProvider>
      <TagProvider>
        <NotebookProvider>
          <NotesVisibilityProvider>
            <GlobalStyle />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </NotesVisibilityProvider>
        </NotebookProvider>
      </TagProvider>
    </MainProvider>
  );
}
