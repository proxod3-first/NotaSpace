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
    setActiveNoteState,
    loading,
    setLoading,
    error,
    setError,
    deleteNoteApi,
  } = useMainContext();

  const [isSidebarOpen, toggleSidebar] = useToggleItem(false);
  const [isNoteListOpen, toggleNoteList] = useToggleItem(true);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]); // Состояние тегов

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
    setLoading(true);

    try {
      // Call the deleteNoteApi from context
      await deleteNoteApi(id);

      // Optionally, reset active note if the deleted note was the active one
      if (activeNote?.id === id) {
        setActiveNote(null); // Clear the active note
        setActiveNoteState(null); // Make sure it's not active
      }
    } catch (error) {
      setError(
        "Не удалось удалить заметку: " +
          (error instanceof Error ? error.message : "Неизвестная ошибка")
      );
    } finally {
      // Stop loading state after operation completes
      setLoading(false);
    }
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
      value={{
        isSidebarOpen,
        toggleSidebar,
        isNoteListOpen,
        toggleNoteList,
      }}
    >
      <Container>
        <Sidebar />
        <NoteList
          notes={notes}
          activeNoteId={activeNote?.id || ""}
          onSelectNote={handleSelectNote}
          onDeleteNote={handleDelete}
        />

        <EditorWrapper
          $isNoteListOpen={isNoteListOpen}
          $hasActiveNote={!!activeNote}
        >
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
        </EditorWrapper>
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

const EditorWrapper = styled.div<{
  $isNoteListOpen: boolean;
  $hasActiveNote: boolean;
}>`
  display: ${({ $isNoteListOpen, $hasActiveNote }) =>
    $isNoteListOpen ? "none" : $hasActiveNote ? "block" : "none"};

  @media (max-width: 810px) {
    display: ${({ $hasActiveNote }) => ($hasActiveNote ? "block" : "none")};
    z-index: ${({ $isNoteListOpen }) => ($isNoteListOpen ? "-1" : "100")};
    position: ${({ $isNoteListOpen }) => ($isNoteListOpen ? "none" : "fixed")};
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    overflow-y: auto;
  }
`;
// @media (max-width: 809px) {
//   display: ${({ $hasActiveNote }) => ($hasActiveNote ? "block" : "none")};
//   position: fixed;
//   top: 0;
//   left: 0;
//   overflow: auto;
//   height: 100vh;
//   width: 100vw;
//   background-color: ${({ $hasActiveNote }) => ($hasActiveNote ? "white" : )};
//   z-index: ${({ $hasActiveNote }) => ($hasActiveNote ? 100 : -1)};
// }

const EmptyState = styled.div`
  padding: 0px;
  font-size: 18px;
  color: #777;
`;
