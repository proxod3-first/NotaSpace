import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import { MainProvider } from "./context/NoteContext";
import { TagProvider } from "./context/TagContext";
import { NotebookProvider } from "./context/NotebookContext";
import GlobalStyle from "./styles/global";

export default function App() {
  return (
    <MainProvider>
      <TagProvider>
        <NotebookProvider>
          <GlobalStyle />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </NotebookProvider>
      </TagProvider>
    </MainProvider>
  );
}
