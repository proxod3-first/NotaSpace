import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Header from "./Header";
import NoteListItem from "./NoteListItem";
import NoNotesMessage from "./NoNotesMessage";
import { Note } from "../../types/index";
import { Container, List as MuiList } from "@mui/material";
import { getTag } from "../../services/tagsApi";
import { useGetActiveNotebook } from "../../hooks/hooks";
import { useNotebooks } from "../../context/NotebookContext";
import { useMainContext } from "../../context/NoteContext";
import { fetchNotes, fetchNotesByNotebook } from "../../services/notesApi";

export interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (id: string) => void;
  OnRenameNote?: (id: string) => void;
  onDeleteNote?: (id: string) => void | Promise<void>;
}

interface TagButtonProps {
  selected: boolean;
  style?: React.CSSProperties;
}

const NoteList: React.FC<NoteListProps> = ({ onSelectNote, onDeleteNote }) => {
  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    setActiveNoteId,
    notebooks,
    setNotebooks,
    setLoading,
    deleteNoteApi,
    moveNote,
    archiveNote,
    restoreNote,
    permanentlyDeleteNote,
    archivedNotes,
    deletedNotes,
  } = useMainContext();

  const { activeNotebook, setActiveNotebook } = useNotebooks(); // Получаем активный блокнот
  const [tags, setTags] = useState<
    { id: string; name: string; color: string }[][]
  >([]);

  const [selectedTag, setSelectedTag] = useState<string | null>(null); // Состояние для выбранного тега
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(notes);
  }, [notes]);

  useEffect(() => {
    if (activeNotebook) {
      setActiveNotebook(activeNotebook.id);
    }
  }, [activeNotebook]);

  useEffect(() => {
    fetchTags(); // Загружаем теги при изменении заметок
  }, [notes]);

  const handleTagClick = (tagId: string | null) => {
    setSelectedTag((prevTag) => (prevTag === tagId ? null : tagId));
  };

  const fetchTags = async () => {
    try {
      // Получаем теги для каждой заметки, не используя кэш
      const tagsForNotes = await Promise.all(
        notes.map(async (note) => {
          if (note.tags) {
            const noteTags = await Promise.all(
              note.tags.map(async (tagId) => {
                const tag = await getTag(tagId); // Запрос к серверу для получения тега по ID
                if (tag) {
                  return { id: tag.id, name: tag.name, color: tag.color }; // Возвращаем тег
                }
                return null;
              })
            );
            // Фильтруем null значения, если не удалось получить тег
            return noteTags.filter(Boolean) as {
              id: string;
              name: string;
              color: string;
            }[];
          }
          return [];
        })
      );

      // Обновляем состояние тегов
      setTags(tagsForNotes);
    } catch (error) {
      setError("Ошибка при загрузке тегов");
      console.error("Ошибка при загрузке тегов:", error);
    }
  };

  const filteredNotesInNotebook = useMemo(() => {
    if (activeNotebook) {
      setActiveNotebook(activeNotebook.id);
      return notes.filter((note) => note.notebook_id === activeNotebook.id);
    }
    return notes; // Если книга не выбрана, показываем все заметки
  }, [activeNotebook, notes]);

  const uniqueTags = useMemo(() => {
    const tagMap = new Map();
    filteredNotesInNotebook.forEach((note) => {
      console.log("UNIQUE TAGS: ", note);
      note.tags?.forEach((tagId) => {
        const tagObj = tags.flat().find((t) => t.id === tagId);
        if (tagObj && !tagMap.has(tagObj.id)) {
          tagMap.set(tagObj.id, tagObj);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [filteredNotesInNotebook, tags]);

  const filteredNotesByTag = useMemo(() => {
    let notesToFilter = filteredNotesInNotebook;
    if (selectedTag) {
      notesToFilter = notesToFilter.filter(
        (note) => note.tags && note.tags.includes(selectedTag)
      );
    }
    console.log("filteredNotesInNotebook: ", notesToFilter);
    return notesToFilter;
  }, [selectedTag, filteredNotesInNotebook]);

  const handleNoteClick = async (noteId: string) => {
    const updatedNotes = await fetchNotes();
    setNotes(updatedNotes);

    // 2. Находим именно ту заметку, по которой кликнули
    const selectedNote = updatedNotes.find((n) => n.id === noteId) || null;
    console.log("noteId: ", noteId);
    console.log("noteId: ", selectedNote);

    // 3. Устанавливаем и активную заметку, и её ID
    setActiveNote(selectedNote);
  };

  return (
    <Container>
      <Header />

      {/* Отображаем список тегов */}
      <div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <TagListContainer>
          {uniqueTags.length > 0 ? (
            uniqueTags.map((tag) => (
              <TagButton
                key={tag.id}
                selected={selectedTag === tag.id}
                onClick={() => handleTagClick(tag.id)}
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </TagButton>
            ))
          ) : (
            <NoTagsMessage>{}</NoTagsMessage>
          )}
        </TagListContainer>

        <div>
          {filteredNotesByTag.length ? (
            <List>
              <MuiList>
                {filteredNotesByTag.map((note) => {
                  // находим позицию этой заметки в общем массиве notes
                  const idx = notes.findIndex((n) => n.id === note.id);
                  // берём её теги из tags[idx] или пустой массив
                  const noteTagObjects = tags[idx] || [];

                  return (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      tags={noteTagObjects}
                      active={note.id === activeNote?.id}
                      onClick={handleNoteClick}
                    />
                  );
                })}
              </MuiList>
            </List>
          ) : (
            <NoNotesMessage />
          )}
        </div>
      </div>
    </Container>
  );
};

export default NoteList;

// interface ContainerProps {
//   $isNoteListOpen?: boolean;
// }

const ErrorMessage = styled.div`
  color: red;
  margin: 0px 0;
`;

const List = styled(MuiList)`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
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
    max-height: 100vh;
    padding-right: 5px;
  }

  @media (max-width: 480px) {
    max-height: 100vh;
  }

  @media (min-width: 810px) {
    height: calc(
      100vh - 115px
    ); /* 100vh минус высота заголовка (например, 60px) и футера (например, 40px) */
    position: absolute;
    bottom: 0;
    width: 100%;
  }
`;

const TagListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0;
`;

const TagButton = styled.button<TagButtonProps>`
  background-color: ${(props) =>
    props.selected ? "#ddd" : props.style?.backgroundColor || "#f4f4f4"};
  border: 1px solid #ddd;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.23s ease;

  &:hover {
    background-color: ${(props) => (props.selected ? "#b5b5b5" : "#e0e0e0")};
    transform: scale(1.05);
  }

  &:active {
    background-color: ${(props) => (props.selected ? "#a0a0a0" : "#ccc")};
    transform: scale(0.98);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 0, 255, 0.3);
  }
`;

const NoTagsMessage = styled.p`
  color: #888;
  font-style: italic;
  margin: 10px 0;
`;
