import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Header from "./Header";
import NoteListItem from "./NoteListItem";
import NoNotesMessage from "./NoNotesMessage";
import { Note } from "../../types/index";
import { Container, List as MuiList } from "@mui/material";
import { getTag } from "../../services/tagsApi";
import { useNotebooks } from "../../contexts/NotebookContext";
import { useMainContext } from "../../contexts/NoteContext";
import { fetchNotes } from "../../services/notesApi";
import SearchField from "./SearchField";
import { useNotesVisibility } from "../../contexts/NotesVisibilityContext";

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
    setLoading,
    deleteNoteApi,
    archivedNotes,
    setArchivedNotes,
    trashedNotes,
    setTrashedNotes,
    fetchArchiveAllNotes,
    fetchTrashAllNotes,
  } = useMainContext();

  const [selectedNotesIds, setSelectedNotesIds] = useState<string[]>([]);
  const { activeNotebook, setActiveNotebook } = useNotebooks();
  const [tags, setTags] = useState<
    { id: string; name: string; color: string }[][]
  >([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Массив для хранения выбранных тегов
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(""); // Состояние для поискового запроса

  const { showArchived, setShowArchived, showTrashed, setShowTrashed } =
    useNotesVisibility(); // Получаем состояние из контекста

  useEffect(() => {
    if (activeNotebook) {
      setActiveNotebook(activeNotebook?.id);
    }
  }, [activeNotebook]);

  useEffect(() => {
    const loadTags = async () => {
      try {
        // Проверка, если заметки изменились (или selectedTags), загружаем теги
        if (notes && Array.isArray(notes)) {
          await fetchTags(); // Загружаем теги асинхронно
        }
      } catch (error) {
        console.error("Ошибка загрузки тегов:", error);
      }
    };

    loadTags(); // Вызов асинхронной функции
  }, [notes, selectedTags]);

  useEffect(() => {
    checkSelectedTags(selectedTags);
  }, [selectedTags, tags]);

  const handleTagClick = (tagId: string) => {
    setSelectedTags((prevTags) => {
      const updatedTags = prevTags.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId];

      checkSelectedTags(updatedTags); // Можем прямо здесь вызывать проверку
      return updatedTags;
    });
  };

  const fetchTags = async () => {
    if (!notes || !Array.isArray(notes)) {
      setNotes(notes || []);
      console.log(notes);
      throw new Error("Некорректный формат данных заметок");
    }

    try {
      const tagsForNotes = await Promise.all(
        notes.map(async (note) => {
          if (note.tags) {
            const noteTags = await Promise.all(
              note.tags.map(async (tagId) => {
                const tag = await getTag(tagId);
                if (tag) {
                  return { id: tag.id, name: tag.name, color: tag.color };
                }
                return null;
              })
            );
            return (
              (noteTags?.filter(Boolean) as {
                id: string;
                name: string;
                color: string;
              }[]) ?? []
            );
          }
          return [];
        })
      );
      setTags(tagsForNotes);
    } catch (error) {
      setError("Ошибка при загрузке тегов");
      console.error("Ошибка при загрузке тегов:", error);
    }
  };

  const filteredNotesInNotebook = useMemo(() => {
    if (activeNotebook) {
      console.log("NOTES: ");
      return (
        notes?.filter((note) => note.notebook_id === activeNotebook.id) ?? []
      );
    }
    return notes;
  }, [activeNotebook, notes]);

  const filteredNotesByTag = (notes: Note[]) => {
    if (selectedTags?.length > 0) {
      return (
        notes?.filter((note) =>
          note.tags?.some((tagId) => selectedTags.includes(tagId))
        ) ?? []
      );
    }
    return notes;
  };

  // Фильтрация заметок по поисковому запросу
  const filteredNotesBySearch = (notes: Note[]) => {
    if (searchQuery) {
      return (
        notes?.filter(
          (note) =>
            note.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.name?.toLowerCase().includes(searchQuery.toLowerCase())
        ) ?? []
      );
    }
    return notes;
  };

  useEffect(() => {
    console.log("Archived notes: ", archivedNotes);
  }, [archivedNotes]);

  useEffect(() => {
    console.log("Trashed notes: ", trashedNotes);
  }, [trashedNotes]);

  const filterNotes = (
    notes: Note[],
    showArchived: boolean,
    showTrashed: boolean
  ) => {
    if (!notes) return [];

    // Если показываем архивные заметки
    if (showArchived) {
      return archivedNotes?.filter((note) => note.is_archived) ?? [];
    }
    // Если показываем удалённые заметки
    if (showTrashed) {
      return trashedNotes?.filter((note) => note.is_deleted) ?? [];
    }
    // Если не показываем ни архивные, ни удалённые
    return notes?.filter((note) => !note.is_archived && !note.is_deleted) ?? [];
  };

  useEffect(() => {
    async function fetchNotess() {
      if (showArchived) {
        await fetchArchiveAllNotes(); // Загружаем архивные заметки
      } else if (showTrashed) {
        await fetchTrashAllNotes(); // Загружаем удалённые заметки
      }
    }

    fetchNotess();
  }, [showArchived, showTrashed]);

  // const filteredNotes = useMemo(() => {
  //   const filteredByArchivedOrTrashed = filterNotes(
  //     filteredNotesInNotebook,
  //     showArchived,
  //     showTrashed
  //   );
  //   const filteredByTag = filteredNotesByTag(filteredByArchivedOrTrashed);
  //   const filteredBySearch = filteredNotesBySearch(filteredByTag);
  //   return filteredBySearch;
  // }, [
  //   activeNotebook,
  //   notes,
  //   showArchived,
  //   showTrashed,
  //   trashedNotes,
  //   archivedNotes,
  //   selectedTags,
  //   searchQuery,
  //   filteredNotesInNotebook,
  //   filterNotes,
  //   filteredNotesByTag,
  //   filteredNotesBySearch,
  // ]);

  const filteredNotes = useMemo(() => {
    const filteredByArchivedOrTrashed = filterNotes(
      filteredNotesInNotebook,
      showArchived,
      showTrashed
    );
    const filteredByTag = filteredNotesByTag(filteredByArchivedOrTrashed);
    const filteredBySearch = filteredNotesBySearch(filteredByTag);
    return filteredBySearch;
  }, [
    activeNotebook,
    notes,
    showArchived,
    showTrashed,
    trashedNotes,
    archivedNotes,
    selectedTags,
    searchQuery,
    filteredNotesInNotebook,
  ]);

  const uniqueTags = useMemo(() => {
    const tagMap = new Map<
      string,
      { id: string; name: string; color: string }
    >();
    filteredNotes?.forEach((note) => {
      note.tags?.forEach((tagId) => {
        const tagObj = tags.flat()?.find((t) => t.id === tagId);
        if (tagObj && !tagMap.has(tagObj.id)) {
          tagMap.set(tagObj.id, tagObj);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [filteredNotes, tags]);

  const handleNoteClick = async (noteId: string) => {
    const updatedNotes = await fetchNotes();
    setNotes(updatedNotes);

    const selectedNote = updatedNotes?.find((n) => n.id === noteId) || null;
    setActiveNote(selectedNote);
  };

  const checkSelectedTags = (selectedTags: string[]) => {
    const validTags =
      selectedTags?.filter((tagId) =>
        tags.flat().some((tag) => tag.id === tagId)
      ) ?? [];
    if (validTags?.length !== selectedTags?.length) {
      // Если есть недействительные теги, обновляем состояние
      setSelectedTags(validTags);
    }
  };

  const handleNoteSelection = (noteId: string) => {
    setSelectedNotesIds((prevSelectedIds) => {
      if (prevSelectedIds.includes(noteId)) {
        return prevSelectedIds?.filter((id) => id !== noteId) ?? [];
      } else {
        return [...prevSelectedIds, noteId];
      }
    });
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  return (
    <Container>
      <Header />

      {/* Поле для поиска */}
      <SearchField onChange={handleSearchChange} />

      <div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <TagListContainer>
          {uniqueTags?.length > 0 ? (
            uniqueTags.map((tag) => (
              <TagButton
                key={tag.id}
                selected={selectedTags.includes(tag.id)} // Проверяем, выбран ли тег
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
          {filteredNotes?.length ? (
            <List>
              <MuiList>
                {filteredNotes.map((note) => {
                  const idx = notes.findIndex((n) => n.id === note.id);
                  const noteTagObjects = tags[idx] || [];

                  return (
                    <NoteListItem
                      key={note.id}
                      note={note}
                      tags={noteTagObjects}
                      active={note.id === activeNote?.id}
                      onClick={() => onSelectNote(note.id)}
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

// Стиль для контейнера
const ErrorMessage = styled.div`
  color: red;
  margin: 0px 0;
`;

const List = styled(MuiList)`
  display: flex;
  flex-direction: column;
  overflow-y: auto; /* Включает прокрутку, если элементы выходят за пределы контейнера */
  overflow-x: hidden; /* Отключает горизонтальную прокрутку */
  padding-right: 10px;
  max-height: calc(
    100vh - 177px
  ); /* Ограничивает высоту списка, чтобы он не выходил за пределы экрана */
  margin-bottom: 20px; /* Дополнительный отступ снизу для удобства */

  /* Устанавливаем стиль для полосы прокрутки */
  &::-webkit-scrollbar {
    width: 2px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
`;

const TagListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 10px 0;
  gap: 10px;
`;

const TagButton = styled.button<{ selected: boolean }>`
  background-color: ${(props) =>
    props.selected
      ? "#007bff"
      : "#f4f4f4"}; /* Если выбран - синий, если нет - обычный фон */
  border: 1px solid ${(props) => (props.selected ? "#ddd" : "#ddd")}; /* Темная граница для выбранных тегов */
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${(props) =>
    props.selected
      ? "0 0 10px rgba(0, 123, 255, 0.5)"
      : "none"}; /* Тень для выделенных тегов */

  &:hover {
    background-color: ${(props) =>
      props.selected
        ? "#0056b3"
        : "#e0e0e0"}; /* При наведении, для выбранных - темный оттенок */
    transform: scale(1.05);
  }

  &:active {
    box-shadow: 3px 4px 5px rgba(0, 0, 255, 0.3); /* Тень при фокусе */
    background-color: ${(props) =>
      props.selected ? "#004085" : "#ccc"}; /* При активном нажатии */
    transform: scale(0.98);
  }
`;

const NoTagsMessage = styled.p`
  color: #888;
  font-style: italic;
  margin: 10px 0;
`;
