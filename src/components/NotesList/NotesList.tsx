import React, { useState } from "react";
import styled from "styled-components";
import Header from "./Header";
import NoteListItem from "./NoteListItem";
import NoNotesMessage from "./NoNotesMessage";
import { Note } from "../../types/index";
import { Container, List as MuiList } from "@mui/material";

export interface NoteListProps {
  notes: Note[];
  activeNoteId: string;
  onSelectNote: (id: string) => void;
  onDeleteNote?: (id: string) => void | Promise<void>;
}

const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeNoteId,
  onSelectNote,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [allNotes, setAllNotes] = useState<Note[]>(notes);

  return (
    <Container>
      <Header
        activeNoteId={activeNoteId}
        notes={notes}
        setNotes={setAllNotes}
        setError={setError}
        onSelectNote={onSelectNote} // Передаем функцию на выбор заметки
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {allNotes.length ? (
        <List>
          <MuiList>
            {allNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                $active={activeNoteId === note.id}
                onClick={() => onSelectNote(note.id)} // Выбираем заметку
              />
            ))}
          </MuiList>
        </List>
      ) : (
        <NoNotesMessage />
      )}
    </Container>
  );
};

export default NoteList;

const ErrorMessage = styled.div`
  color: red;
  margin: 10px 0;
`;

const List = styled(MuiList)`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }

  /* Мобильная адаптация */
  @media (max-width: 767px) {
    max-height: 300px;
    padding-right: 5px;
  }

  @media (max-width: 480px) {
    max-height: 250px;
  }

  @media (min-width: 810px) {
    height: calc(
      100vh - 100px
    ); /* 100vh минус высота заголовка (например, 60px) и футера (например, 40px) */
    position: absolute;
    bottom: 0;
    width: 100%;
  }
`;
