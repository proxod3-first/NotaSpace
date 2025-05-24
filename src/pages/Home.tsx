import React, { useEffect, useState } from "react";
import { useMainContext } from "../context/NoteContext";

import { fetchNotes, createNote, deleteNote } from "../services/notesApi";

import PreLoader from "../components/Shared/PreLoader";
import styled from "styled-components";
import { UIContext } from "../context/UIContext";
import { useToggleItem } from "../hooks/hooks";
import Sidebar from "../components/Sidebar/Sidebar";
import NoteList from "../components/NotesList/NotesList";
import Editor from "../components/Editor/Editor";

export default function Home() {
  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    loading,
    setLoading,
    error,
    setError,
  } = useMainContext();

  const [isSidebarOpen, toggleSidebar] = useToggleItem(false);
  const [isNoteListOpen, toggleNoteList] = useToggleItem(true);
  const [selectedTag, setSelectedTag] = useState<string>("");
  
  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag); // Сохраняем выбранный тег
  };

  useEffect(() => {
    setLoading(true);
    fetchNotes()
      .then((data) => {
        setNotes(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Ошибка загрузки заметок");
        setLoading(false);
      });
  }, [setNotes, setLoading, setError]);

  // Удаление заметки
  const handleDelete = async (id: string) => {
    await deleteNote(id);
  };

  // Обработчик выбора заметки из списка
  const handleSelectNote = (id: string) => {
    const note = notes.find((n) => n.id === id) || null;
    setActiveNote(note);
  };

  if (loading) return <PreLoader />;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <UIContext.Provider
      value={{ isSidebarOpen, toggleSidebar, isNoteListOpen, toggleNoteList }}
    >
      <Container>
        <Sidebar />
        <NoteList
          notes={notes}
          activeNoteId={activeNote?.id || ""}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDelete} 
        />
        {activeNote ? (
          <Editor
            note={activeNote}
            onDeleteNote={handleDelete}
            onMoveNote={(noteId, targetNotebookId, onSuccess, onError) => {
              // Тут можно вызвать moveNote из контекста или реализовать локально
            }}
          />
        ) : (
          <EmptyState>
            Выберите заметку слева, чтобы начать редактирование
          </EmptyState>
        )}
      </Container>
    </UIContext.Provider>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 100vh;
  grid-template-columns: 100vw;

  @media (min-width: 810px) {
    grid-template-columns: 340px calc(100vw - 340px);
  }

  @media (min-width: 1200px) {
    grid-template-columns: 240px 380px calc(100vw - 240px - 380px);
  }
`;

const EmptyState = styled.div`
  padding: 20px;
  font-size: 18px;
  color: #777;
`;
