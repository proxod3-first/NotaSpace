import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import Header from "./Header";
import NoteListItem from "./NoteListItem";
import NoNotesMessage from "./NoNotesMessage";
import { Note } from "../../types/index";
import { Container, Menu, MenuItem, List as MuiList } from "@mui/material";
import { getTag } from "../../services/tagsApi";
import { useNotebooks } from "../../contexts/NotebookContext";
import { useMainContext } from "../../contexts/NoteContext";
import { fetchNotes, getNote } from "../../services/notesApi";
import SearchField from "./SearchField";
import { useNotesVisibility } from "../../contexts/NotesVisibilityContext";
import ArrowTooltip from "../Shared/ArrowTooltip";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { baseIconButton } from "../../styles/mixins";

export interface NoteListProps {
  notes: Note[];
  activeNoteId: string | null;
  // onSelectNote: (id: string) => void;
  // OnRenameNote?: (id: string) => void;
  onDeleteNote?: (id: string) => void | Promise<void>;
}

interface TagButtonProps {
  selected: boolean;
  style?: React.CSSProperties;
}

const NoteList: React.FC<NoteListProps> = ({ onDeleteNote }) => {
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

  const [sortOrder, setSortOrder] = useState<string | null>(null); // Состояние для выбранного типа сортировки

  const [searchQuery, setSearchQuery] = useState<string>(""); // Состояние для поискового запроса
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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
  }, [notes, showArchived, showTrashed, selectedTags]);

  const checkSelectedTags = (selectedTags: string[]) => {
    const validTags =
      selectedTags?.filter((tagId) =>
        tags?.flat()?.some((tag) => tag.id === tagId)
      ) ?? [];
    if (validTags?.length !== selectedTags?.length) {
      // Если есть недействительные теги, обновляем состояние
      setSelectedTags(validTags);
    }
  };

  useEffect(() => {
    checkSelectedTags(selectedTags);
  }, [selectedTags, tags]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null); // Закрываем меню при выборе или клике за пределами
  };

  const handleSortChange = (order: string) => {
    setSortOrder(order);
    handleClose(); // Закрываем меню после выбора
  };

  const sortNotesByPriority = (notes: Note[]) => {
    return notes.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.order - b.order; // По возрастанию
      }
      return b.order - a.order; // По убыванию
    });
  };

  const handleTagClick = (tagId: string) => {
    setSelectedTags((prevTags) => {
      const updatedTags = prevTags?.includes(tagId)
        ? prevTags.filter((id) => id !== tagId)
        : [...prevTags, tagId];

      checkSelectedTags(updatedTags); // Можем прямо здесь вызывать проверку
      return updatedTags;
    });
  };

  const fetchTags = async () => {
    // Объединяем все заметки: обычные, архивированные и удаленные
    const allNotes = [
      ...(notes || []),
      ...(archivedNotes || []),
      ...(trashedNotes || []),
    ];

    if (!allNotes || !Array.isArray(allNotes)) {
      setNotes(allNotes || []);
      // console.log(allNotes);
      throw new Error("Некорректный формат данных заметок");
    }

    try {
      const tagsForNotes = await Promise.all(
        allNotes?.map(async (note) => {
          if (note?.tags) {
            const noteTags = await Promise.all(
              note.tags?.map(async (tagId) => {
                const tag = await getTag(tagId);
                if (tag) {
                  return { id: tag.id, name: tag.name, color: tag.color };
                }
                return null;
              })
            );
            // console.log("TAGS FOR NOTES: ", noteTags);

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
      // console.log("NOTES: ");
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
          note.tags?.some((tagId) => selectedTags?.includes(tagId))
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
            note.text?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
            note.name?.toLowerCase()?.includes(searchQuery.toLowerCase())
        ) ?? []
      );
    }
    return notes;
  };

  useEffect(() => {
    // console.log("Archived notes: ", archivedNotes);
  }, [archivedNotes]);

  useEffect(() => {
    // console.log("Trashed notes: ", trashedNotes);
  }, [trashedNotes]);

  const filterNotes = (
    notes: Note[],
    showArchived: boolean,
    showTrashed: boolean
  ) => {
    // Если показываем архивные заметки
    if (showArchived) {
      return archivedNotes?.filter((note) => note.is_archived) ?? [];
    }
    // Если показываем удалённые заметки
    if (showTrashed) {
      return trashedNotes?.filter((note) => note.is_deleted) ?? [];
    }

    if (!notes) return [];

    return notes?.filter((note) => !note.is_archived && !note.is_deleted) ?? [];
  };

  useEffect(() => {
    async function fetchNotess() {
      if (showArchived) {
        await fetchArchiveAllNotes(); // Загружаем архивные заметки
      } else if (showTrashed) {
        await fetchTrashAllNotes(); // Загружаем удалённые заметки
      } else {
        const updatedNotes = await fetchNotes(); // Загружаем все заметки
        setNotes(updatedNotes); // Обновляем состояние заметок
      }
    }

    fetchNotess();
  }, [activeNote, showArchived, showTrashed]);

  const filteredNotes = useMemo(() => {
    const filteredByArchivedOrTrashed = filterNotes(
      filteredNotesInNotebook,
      showArchived,
      showTrashed
    );
    const filteredByTag = filteredNotesByTag(filteredByArchivedOrTrashed);
    const filteredBySearch = filteredNotesBySearch(filteredByTag);
    return sortNotesByPriority(filteredBySearch);
  }, [
    activeNotebook,
    notes,
    showArchived,
    showTrashed,
    archivedNotes,
    trashedNotes,
    selectedTags,
    searchQuery,
    sortOrder,
    filteredNotesInNotebook,
  ]);

  const uniqueTags = useMemo(() => {
    const tagMap = new Map<
      string,
      { id: string; name: string; color: string }
    >();

    filteredNotes?.forEach((note) => {
      note.tags?.forEach((tagId) => {
        const tagObj = tags?.flat()?.find((t) => t.id === tagId);
        if (tagObj && !tagMap.has(tagObj.id)) {
          tagMap.set(tagObj.id, tagObj);
        }
      });
    });
    return Array.from(tagMap.values());
  }, [filteredNotes, archivedNotes, tags]);

  const handleNoteClick = async (noteId: string) => {
    const updatedNotes = await fetchNotes();
    setNotes(updatedNotes);

    const selectedNote = await getNote(noteId);

    if (selectedNote) {
      setActiveNote(selectedNote);
      // console.log("Активная заметка обновлена:", selectedNote, activeNote);
    }
  };

  const handleNoteSelection = (noteId: string) => {
    setSelectedNotesIds((prevSelectedIds) => {
      if (prevSelectedIds?.includes(noteId)) {
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
    <div>
      <Container>
        <Header />

        {/* Поле для поиска */}
        <SearchField onChange={handleSearchChange}>
          <IconButton onClick={handleClick}>
            <FilterAltIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleSortChange("asc")}>
              По возрастанию
            </MenuItem>
            <MenuItem onClick={() => handleSortChange("desc")}>
              По убыванию
            </MenuItem>
          </Menu>
        </SearchField>
        <div>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <TagListContainer>
            {uniqueTags?.length > 0 ? (
              uniqueTags?.map((tag) => (
                <TagButton
                  key={tag.id}
                  selected={selectedTags?.includes(tag.id)} // Проверяем, выбран ли тег
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
                  {filteredNotes?.map((note) => {
                    const allNotes = [
                      ...(notes || []),
                      ...(archivedNotes || []),
                      ...(trashedNotes || []),
                    ];

                    const idx = allNotes?.findIndex((n) => n.id === note.id);
                    const noteTagObjects = tags[idx] || [];
                    // console.log("FILTERED NOTES: ", idx, tags, noteTagObjects, filteredNotes);

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
    </div>
  );
};

export default NoteList;

// Стиль для контейнера
const ErrorMessage = styled.div`
  color: red;
  margin: 0px 0;
`;

const IconButton = styled.button`
  ${baseIconButton}
  font-size: 28px;
  margin-left: -10px;
  color: var(--sidebar-text-muted);
  flex-shrink: 0;
  &:hover {
    background-color: rgb(229, 229, 229);
  }
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
