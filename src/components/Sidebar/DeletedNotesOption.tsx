import React, { useEffect, useState } from "react";
import { fetchTrashNotes } from "../../services/notesApi";
import { Note } from "../../types";
import NoteList from "../NotesList/NotesList";
import styled from "styled-components";

const Container = styled.div`
  margin-top: 20px;
`;

const Message = styled.div`
  text-align: center;
  color: #888;
`;

interface DeletedNotesOptionProps {
  activeNoteId: string | null;
  onSelectNote: (newNoteId: string) => void;
}

const DeletedNotesOption: React.FC<DeletedNotesOptionProps> = ({
  activeNoteId,
  onSelectNote,
}) => {
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDeletedNotes = async () => {
      try {
        const notes = await fetchTrashNotes();
        setDeletedNotes(notes);
      } catch (error) {
        console.error("Error fetching deleted notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedNotes();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      {deletedNotes.length === 0 ? (
        <Message>No notes</Message>
      ) : (
        // Передаем заметки и функции в NoteList
        <NoteList
          notes={deletedNotes} // передаем удаленные заметки
          activeNoteId={activeNoteId} // передаем activeNoteId
          onSelectNote={onSelectNote} // передаем функцию выбора заметки
        />
      )}
    </Container>
  );
};

export default DeletedNotesOption;
