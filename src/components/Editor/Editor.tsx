import React, { useContext, useEffect, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import styled, { css } from "styled-components";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteNoteDialog from "./DeleteNoteDialog";
import MoveNoteDialog from "./MoveNoteDialog";
import ArrowTooltip from "../Shared/ArrowTooltip";
import { baseIconButton, flexCenter, scrollable } from "../../styles/mixins";
import { UIContext } from "../../context/UIContext";

import { createTag, updateTag, fetchTags } from "../../services/tagsApi";
import {
  addTagToNote,
  fetchNotes,
  removeTagFromNote,
} from "../../services/notesApi";
import { Tag } from "../../types";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { Note } from "../../types";
import { useMainContext } from "../../context/NoteContext";
import { updateNote } from "../../services/notesApi";

interface EditorProps {
  note: Note;
  onDeleteNote: (id: string) => Promise<void>;
  onMoveNote: (
    noteId: string,
    currentNotebookId: string,
    targetNotebookId: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => void;
}

const mdParser = new MarkdownIt();
const AUTOSAVE_INTERVAL = 1500;

const Editor = ({ note }: EditorProps) => {
  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    deleteNoteApi,
    moveNote,
    notebooks,
    setError,
  } = useMainContext();

  const [title, setTitle] = useState(note.name);
  const [content, setContent] = useState(note.text);
  const [syncStatus, setSyncStatus] = useState("All changes saved");
  const [isFirstRun, setIsFirstRun] = useState(false);

  const [tags, setTags] = useState<string[]>([]); // Массив только ID тегов
  const [tagObjects, setTagObjects] = useState<Tag[]>([]); // Массив объектов тегов для отображения
  const [newTag, setNewTag] = useState<string>(""); // Новое название тега
  const [editTagId, setEditTagId] = useState<string | null>(null); // ID тега для редактирования

  const [prevNoteState, setPrevNoteState] = useState({
    _name: title,
    text: content,
    tags: tags,
    // color: noteColor,
  });

  // Full screen
  const [fullScreen, setFullScreen] = useState(false);
  const toggleFullScreen = () => setFullScreen((f) => !f);

  // Header menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  // Dialog states
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false);
  const [isMoveNoteDialogOpen, setIsMoveNoteDialogOpen] = useState(false);

  // Responsive layout context
  const { isNoteListOpen, toggleNoteList } = useContext(UIContext);

  useEffect(() => {
    if (!activeNote?.id || !Array.isArray(activeNote.tags)) return; // Если нет активной заметки или тегов, не выполняем запрос.

    const loadTagsForActiveNote = async () => {
      try {
        // Загружаем все теги с сервера
        const fetchedTags = await fetchTags();
        console.log("Все теги:", fetchedTags);
        console.log("Теги активной заметки:", activeNote.tags);

        // Фильтруем только те теги, ID которых есть в activeNote.tags
        const filteredTags = fetchedTags.filter((tag) =>
          activeNote.tags.includes(tag.id)
        );

        // Устанавливаем отфильтрованные теги в состояние
        setTagObjects(filteredTags); // Сохраняем все теги для активной заметки
        setActiveNote(activeNote);
        console.log("Теги для активной заметки (объекты):", filteredTags);
      } catch (error) {
        console.error("Ошибка при загрузке тегов для заметки:", error);
      }
    };

    loadTagsForActiveNote();
  }, [activeNote?.tags]); // Зависимость от поля tags активной заметки
  // Перезапуск эффекта, если activeNote.tags изменится

  // Автосохранение по таймеру

  useEffect(() => {
    console.log("useEffect triggered");

    // Функция для проверки изменений
    const hasChanges = () => {
      return (
        title !== prevNoteState._name ||
        content !== prevNoteState.text ||
        (prevNoteState.tags && tags.length !== prevNoteState.tags.length)
        // noteColor !== prevNoteState.color // Если необходимо отслеживать изменения цвета
      );
    };

    // Запуск автосохранения только при изменениях
    const interval = setInterval(() => {
      if (hasChanges()) {
        autoSave(); // Запуск автосохранения, если есть изменения
      }
    }, AUTOSAVE_INTERVAL);

    return () => {
      console.log("Clearing interval");
      clearInterval(interval); // Очищаем интервал при размонтировании компонента
    };
  }, [activeNote, tags, content, title, notes]); // Зависимости useEffect
  // Слежение за изменениями content и activeNote // Слежение за изменениями content и activeNote

  const autoSave = async () => {
    if (!activeNote) return; // Если заметка не выбрана

    try {
      if (activeNote.is_deleted) return; // Не сохраняем удалённые заметки

      console.log("activeNote: ", activeNote);

      // Обновляем только если есть изменения
      await updateNote(activeNote.id, {
        name: activeNote.name,
        text: content,
        tags: tags,
        order: 0,
        // color: noteColor, // Сохраняем новый цвет
        color: "",
      });

      // Обновляем состояние с последними сохраненными данными
      setPrevNoteState({
        _name: title,
        text: content,
        tags: tags,
        // color: noteColor,
      });
      const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
      setNotes(updatedNotes);
      console.log("Заметка успешно сохранена!");
    } catch (error) {
      console.error("Ошибка при автосохранении:", error);
    }
  };

  //   const handleSave = async () => {
  //   if (!activeNote) return;

  //   try {
  //     // Убираем ненужное | "" в коде
  //     await updateNote(activeNote.id, {
  //       name: activeNote.name,
  //       text: content,
  //       color: "",
  //       tags: tags,
  //       order: 0,
  //     });

  //     console.log("Заметка успешно сохранена!");
  //   } catch (error) {
  //     console.error("Update note failed", error);
  //   }
  // };

  // const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
  // setNotes(updatedNotes);
  // onSuccess();

  const handleCloseMenu = () => setAnchorEl(null);
  const handleClickMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedName = e.currentTarget.value;
    setTitle(updatedName); // Обновляем локальное состояние title
    if (activeNote) {
      // Обновляем title внутри activeNote
      setActiveNote({
        ...activeNote,
        name: updatedName, // Обновляем name для activeNote
      });
    }
  };

  const handleEditorChange = ({ text }: { text: string }) => {
    if (activeNote) {
      const updatedNote = {
        ...activeNote,
        text, // Обновляем только свойство text
      };

      setActiveNote(updatedNote); // Обновляем состояние активной заметки
      setContent(text);
    }
  };

  useEffect(() => {
    setNotes(notes);
  }, [notes]);

  const handleDeleteNote = async () => {
    try {
      await deleteNoteApi(note.id);
      const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
      setNotes(updatedNotes);
    } catch {
      setError("Ошибка удаления заметки");
    }
  };

  const handleMoveNote = (
    noteId: string,
    currentNotebookId: string,
    targetNotebookId: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => {
    moveNote(noteId, targetNotebookId, onSuccess, onError);
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return; // Если новый тег пустой, выходим

    // Создаем новый тег
    const tagData = { name: newTag.trim(), color: "#ff6347" }; // Цвет по умолчанию
    const newTagObj = await createTag(tagData);

    console.log("Создан новый тег:", newTagObj);

    // Преобразуем ID тега
    const value = newTagObj || ""; // Берем только ID тега

    // Обновляем tags для активной заметки (если tags это массив)
    setTags((prevTags) => {
      const tagsArray = Array.isArray(prevTags) ? prevTags : [];
      // Добавляем новый тег в список
      return [...tagsArray, value];
    });

    // Обновляем активную заметку с новым тегом
    if (activeNote?.id) {
      // Привязываем новый тег к заметке
      await addTagToNote(activeNote.id, value);

      // Обновляем состояние активной заметки с новым тегом
      setActiveNote({
        ...activeNote, // Сохраняем остальные данные заметки
        tags: [...(activeNote?.tags || []), value], // Добавляем новый тег в массив tags
      });
    }

    // Сбрасываем поле ввода
    setNewTag("");
  };

  const handleDeleteTagFromNote = async (tagId: string) => {
    // Проверяем, что активная заметка существует
    if (!activeNote?.id) return;

    console.log("Удаляем тег из заметки", activeNote?.id, tagId);

    // Удаляем тег из заметки
    await removeTagFromNote(activeNote?.id, tagId);

    // Удаляем ID тега из списка tags активной заметки
    setTags((prevTags) => prevTags?.filter((tag) => tag !== tagId));

    // Обновляем состояние activeNote без этого тега
    setActiveNote({
      ...activeNote,
      tags: activeNote?.tags.filter((tag) => tag !== tagId), // Убираем тег из activeNote
    });
    setNotes(notes);
  };

  const handleEditTag = async () => {
    // Если новое имя тега пустое, нет id для редактирования, или нет активной заметки, выходим
    if (!newTag.trim() || !editTagId || !activeNote?.id) return;

    // Обновляем тег на сервере
    await updateTag(editTagId, {
      name: newTag.trim(),
      color: "#ff6347", // Цвет по умолчанию
    });

    console.log("Тег обновлён:", { id: editTagId, name: newTag.trim() });

    // Обновляем теги в списке tagObjects (если он хранит все теги)
    setTagObjects((prevTags) =>
      prevTags.map((tag) =>
        tag.id === editTagId
          ? { ...tag, name: newTag.trim(), color: "#ff6347" } // Обновляем только тот тег, который редактируем
          : tag
      )
    );

    if (activeNote) {
      const updatedNote = {
        ...activeNote,
        tags: activeNote?.tags.map(
          (tagId) => (tagId === editTagId ? editTagId : tagId) // Просто обновляем id, потому что тег уже обновлён в tagObjects
        ),
      };
      setTags(activeNote.tags);
      // Обновляем состояние activeNote с новым тегом
      setActiveNote(updatedNote);
      setNotes(notes);
      // Сбрасываем поле ввода
      setNewTag("");
      setEditTagId(null); // Сбрасываем режим редактирования
    }
  };

  console.log("tagObjects", tagObjects); // Проверяем, что передается в tagObjects

  return (
    <Container $isNoteListOpen={isNoteListOpen} $fullScreen={fullScreen}>
      <Header>
        <CenteredDiv $hideInDesktop>
          <IconButton onClick={toggleNoteList}>
            <ArrowBackIosNewIcon />
          </IconButton>
        </CenteredDiv>
        <CenteredDiv $showInDesktop>
          <ArrowTooltip title={fullScreen ? "Collapse note" : "Expand note"}>
            <FullScreenButton onClick={toggleFullScreen}>
              {fullScreen ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
            </FullScreenButton>
          </ArrowTooltip>
        </CenteredDiv>
        <TitleInput
          type="text"
          placeholder="Title"
          value={title}
          onChange={handleNameChange}
        />

        <CenteredDiv>
          <ArrowTooltip title="More actions">
            <IconButton onClick={handleClickMenu}>
              <MoreHorizIcon />
            </IconButton>
          </ArrowTooltip>
        </CenteredDiv>

        <StyledMenu
          id="fade-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleCloseMenu}
          TransitionComponent={Fade}
          MenuListProps={{ "aria-labelledby": "fade-button" }}
        >
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsMoveNoteDialogOpen(true);
            }}
            disableRipple
          >
            <DriveFileMoveIcon />
            Move note
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setIsDeleteNoteDialogOpen(true);
            }}
            disableRipple
          >
            <DeleteForeverIcon />
            Delete note
          </MenuItem>
        </StyledMenu>

        <InvisibleDiv>
          <DeleteNoteDialog
            note={note}
            open={isDeleteNoteDialogOpen}
            setOpen={setIsDeleteNoteDialogOpen}
            onDelete={handleDeleteNote}
          />
          <MoveNoteDialog
            note={note}
            open={isMoveNoteDialogOpen}
            setOpen={setIsMoveNoteDialogOpen}
            notebookIds={notebooks.map((nb) => nb.id)}
            notebooks={Object.fromEntries(
              notebooks.map((nb) => [nb.id, { name: nb.name }])
            )}
            onMove={handleMoveNote}
          />
        </InvisibleDiv>
      </Header>

      <StyledMdEditor
        style={{ height: "calc(100vh - 60px - 40px - 40px)" }}
        value={content}
        renderHTML={(text: string) => mdParser.render(text)}
        onChange={handleEditorChange}
        placeholder="Начните печатать"
      />

      <Footer>
        {/* Статус синхронизации */}
        <SyncStatus>{syncStatus}</SyncStatus>
        {/* Отображаем текущие теги */}
        <TagContainer>
          {activeNote?.tags &&
          Array.isArray(activeNote?.tags) &&
          activeNote?.tags.length > 0 ? (
            activeNote?.tags.map((tagId) => {
              const tag = tagObjects.find(
                (tagObj) => String(tagObj.id) === String(tagId)
              );

              console.log("tagId:", tagId, "foundTag:", tag); // Логируем информацию о теге

              return tag ? (
                <TagStyle key={tag.id}>
                  <span>{tag.name}</span>
                  {/* Кнопка для удаления */}
                  <TagButton onClick={() => handleDeleteTagFromNote(tag.id)}>
                    Delete
                  </TagButton>
                  {/* Кнопка для редактирования */}
                  <TagButton
                    onClick={() => {
                      setEditTagId(tag.id);
                      setNewTag(tag.name);
                    }}
                  >
                    Edit
                  </TagButton>
                </TagStyle>
              ) : null; // Если тег не найден, ничего не отображаем
            })
          ) : (
            <span>No found tags</span> // Сообщение, если тегов нет
          )}
        </TagContainer>

        {/* Добавление нового тега */}
        <AddTagWrapper>
          <input
            type="text"
            placeholder="New tag"
            value={newTag}
            onChange={(e) => setNewTag(e.currentTarget.value)}
            style={{
              padding: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginRight: "10px",
            }}
          />
          <ButtonAddTag onClick={handleAddTag}>Add Tag</ButtonAddTag>

          {/* Кнопка редактирования тега */}
          {editTagId ? (
            <ButtonEditTag onClick={handleEditTag}>Edit Tag</ButtonEditTag>
          ) : null}
        </AddTagWrapper>
      </Footer>
    </Container>
  );
};

export default Editor;

const Container = styled.div<{
  $fullScreen: boolean;
  $isNoteListOpen?: boolean;
}>`
  background-color: white;
  display: ${({ $isNoteListOpen }) => ($isNoteListOpen ? "none" : "block")};

  @media (min-width: 810px) {
    display: block;
    ${({ $fullScreen }) =>
      $fullScreen &&
      css`
        z-index: 9999;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
      `}
  }
`;

const Header = styled.div`
  height: 60px;
  display: flex;
  padding: 0 15px;
  gap: 16px;
`;

const TitleInput = styled.input`
  border: none;
  width: 100%;
  font-size: 32px;
  font-weight: 500;

  &:focus {
    outline: none;
  }
`;

const IconButton = styled.button`
  ${baseIconButton}
  font-size: 28px;
  padding: 2px;
  color: #9b9a9a;

  &:hover {
    background-color: #e9e9e7;
  }
`;

const FullScreenButton = styled(IconButton)`
  font-size: 22px;
  width: 28px;
  height: 28px;
`;

const StyledMenu = styled(Menu)`
  .MuiMenuItem-root {
    font-size: 14px;
    padding: 4px 16px;

    & svg {
      font-size: 18px;
      margin-right: 6px;
    }
  }
`;

const CenteredDiv = styled.div<{
  $showInDesktop?: boolean;
  $hideInDesktop?: boolean;
}>`
  ${flexCenter}
  ${({ $showInDesktop }) =>
    $showInDesktop &&
    css`
      display: none;

      @media (min-width: 810px) {
        display: flex;
      }
    `}
  ${({ $hideInDesktop }) =>
    $hideInDesktop &&
    css`
      display: flex;

      @media (min-width: 810px) {
        display: none;
      }
    `}
`;

const InvisibleDiv = styled.div`
  display: none;
`;
const StyledMdEditor = styled(MdEditor)`
    &:focus {
      outline: none;
    }
  }

  .quill {
    overflow: hidden;
  }

  .ql-toolbar.ql-snow {
    border: none;
    white-space: nowrap;

    .ql-formats {
      margin-right: 0;
  
      @media (min-width: 810px) {
        margin-right: 15px;
      }
    }
  }

  .ql-container.ql-snow {
    height: calc(100vh - 60px - 40px - 40px); // Minus heights of header, toolbar and footer
    border: none;
    font-size: 16px !important;
  }

  .ql-editor.ql-blank::before {
    font-style: normal;
    opacity: 0.5;
  }

  .ql-editor {
    ${scrollable}
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
  background-color: #f7f7f7;
  border-top: 1px solid #ddd;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

const TagStyle = styled.div`
  background-color: #efefef;
  border-radius: 20px;
  padding: 5px 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TagButton = styled.button`
  background-color: transparent;
  border: none;
  color: #ff5555;
  cursor: pointer;
  font-size: 12px;
  margin-left: 10px;
`;

const AddTagWrapper = styled.div`
  margin-bottom: 15px;
`;

const SyncStatus = styled.div`
  margin-bottom: 15px;
  font-size: 14px;
  color: #555;
`;

const ButtonAddTag = styled.button`
  padding: 5px 10px;
  background-color: #1e81b0;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #0066b3;
  }
`;

const ButtonEditTag = styled.button`
  padding: 5px 10px;
  background-color: rgb(173, 18, 18); /* Цвет для кнопки редактирования */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: rgb(
      196,
      56,
      56
    ); /* Темный цвет для кнопки редактирования */
  }
`;
