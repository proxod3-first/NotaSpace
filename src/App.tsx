import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import { NotesProvider } from "./context/NotesContext";

export default function App() {
  return (
    <NotesProvider>
      <nav className="p-4 border-b flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/notess">Notes</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/notess" element={<Notes />} />
      </Routes>
    </NotesProvider>
  );
}
