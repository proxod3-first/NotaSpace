import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UIContext } from "../../context/UIContext";
import { useMainContext } from "../../context/NoteContext";
import { fetchNotes } from "../../services/notesApi";
import { useNotebooks } from "../../context/NotebookContext";

const AllNotesOption = () => {
  const { toggleSidebar } = useContext(UIContext);
  const { activeNote, setNotes, setActiveNote, setActiveNoteId } =
    useMainContext();
  const { setActiveNotebook } = useNotebooks();
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      toggleSidebar();
      setActiveNotebook("");
      navigate("/");
    } catch (error) {
      console.error("Failed to load all notes:", error);
    }
  };

  return { handleClick };
};

export default AllNotesOption;
