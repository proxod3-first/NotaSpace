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

const NoteList: React.FC<NoteListProps> = ({
  activeNoteId,
  onSelectNote,
  onDeleteNote,
}) => {
  const { notes, setNotes } = useMainContext();
  const { activeNotebook } = useNotebooks(); // Получаем активный блокнот
  const [tags, setTags] = useState<
    { id: string; name: string; color: string }[][]
  >([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // Состояние для выбранного тега
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNotes(notes);
  }, [notes]);
  
  const fetchTags = async () => {
    const tagsForNotes = await Promise.all(
      notes.map(async (note) => {
        // Проверяем, что у заметки есть теги, и если есть, загружаем их
        if (note.tags) {
          const noteTags = await Promise.all(
            note.tags.map((tagId) => getTag(tagId)) // Получаем тег по ID
          );
          return noteTags.filter(Boolean); // Фильтруем null и undefined
        }
        return []; // Если тегов нет, возвращаем пустой массив
      })
    );
    setTags(tagsForNotes); // Сохраняем в состоянии
  };

  useEffect(() => {
    fetchTags(); // Загружаем теги при изменении заметок
  }, [notes]);

  const handleTagClick = (tagId: string | null) => {
    setSelectedTag((prevTag) => (prevTag === tagId ? null : tagId));
  };

  const filteredNotesTags = useMemo(() => {
    if (selectedTag) {
      return notes.filter(
        (note) => note.tags && note.tags.includes(selectedTag)
      );
    } else {
      return notes;
    }
  }, [selectedTag, notes]);

  const filteredNotesInNotebook = useMemo(() => {
    if (activeNotebook) {
      return notes.filter((note) => note.notebook_id === activeNotebook.id);
    }
    return notes; // Если книга не выбрана, показываем все заметки
  }, [activeNotebook, notes]);

  useEffect(() => {}, [notes]);

  return (
    <Container>
      <Header />

      {/* Отображаем список тегов */}
      <div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <TagListContainer>
          {Array.isArray(tags) && tags.length > 0 ? (
            tags.map((tagArray, index) => (
              <div key={index}>
                {tagArray.map((tag) => (
                  <TagButton
                    key={tag.id}
                    selected={selectedTag?.toString === index.toString} // Проверяем, выбран ли тег
                    onClick={() => handleTagClick(tag.id)} // При клике фильтруем по тегу
                    style={{ backgroundColor: tag.color }} // Цвет фона можно менять в зависимости от тега
                  >
                    {tag.name}
                  </TagButton>
                ))}
              </div>
            ))
          ) : (
            <p>
              {" "}
              {selectedTag === null && (
                <NoTagsMessage>Нет выбранных тегов</NoTagsMessage>
              )}
            </p>
          )}
        </TagListContainer>
      </div>
      {/* 
      {notes.length ? (
        <List>
          <MuiList>
            {filteredNotesTags.map((note, index) => (
              <NoteListItem
                key={note.id}
                note={note}
                $active={activeNoteId === note.id}
                onClick={() => onSelectNote(note.id)} // Выбираем заметку
                tags={tags[index] || []} // Получаем теги для текущей заметки по индексу
              />
            ))}
          </MuiList>
        </List>
      ) : (
        <NoNotesMessage />
      )} */}

      <div>
        {filteredNotesInNotebook.length ? (
          <List>
            <MuiList>
              {filteredNotesInNotebook.map((note, index) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  $active={activeNoteId === note.id}
                  onClick={() => onSelectNote(note.id)}
                  tags={tags[index] || []}
                />
              ))}
            </MuiList>
          </List>
        ) : (
          <NoNotesMessage />
        )}
      </div>
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

const TagListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0;
`;

const TagButton = styled.button<TagButtonProps>`
  background-color: ${(props) =>
    props.selected ? "#d1d1d1" : props.style?.backgroundColor || "#f4f4f4"};
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
