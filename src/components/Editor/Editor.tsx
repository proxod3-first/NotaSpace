import React, { useContext, useEffect, useRef, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import isEqual from "lodash/isEqual";
import styled, { css } from "styled-components";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DeleteNoteDialog from "./DeleteNoteDialog";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";

import { CopyToClipboard } from "react-copy-to-clipboard";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DoneIcon from "@mui/icons-material/Done";

import ArchiveIcon from "@mui/icons-material/Archive";
import UnarchiveIcon from "@mui/icons-material/Unarchive";

import DeleteIcon from "@mui/icons-material/Delete";
import RestoreFromTrashIcon from "@mui/icons-material/RestoreFromTrash";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import MoveNoteDialog from "./MoveNoteDialog";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import NewLabelIcon from "@mui/icons-material/NewLabel";
import ArrowTooltip from "../Shared/ArrowTooltip";
import { baseIconButton, flexCenter, scrollable } from "../../styles/mixins";
import { UIContext } from "../../contexts/UIContext";
import { createTag, updateTag, fetchTags } from "../../services/tagsApi";
import {
  addTagToNote,
  fetchArchivedNotes,
  fetchNotes,
  getNote,
  removeTagFromNote,
} from "../../services/notesApi";
import { Tag } from "../../types";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { Note } from "../../types";
import { useMainContext } from "../../contexts/NoteContext";
import { updateNote } from "../../services/notesApi";
import { useNotebooks } from "../../contexts/NotebookContext";
import { useNotesVisibility } from "../../contexts/NotesVisibilityContext";
import PrioritySelector from "./PrioritySelector";
import TodoPlugin from "../Editor/ToDoMarkdown";
import { Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

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

interface PrevNoteState {
  _name: string;
  text: string;
  tags: string[];
}

const mdParser = new MarkdownIt();
const AUTOSAVE_INTERVAL = 10000;
MdEditor.use(TodoPlugin);

const Editor = ({ note }: EditorProps) => {
  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    setActiveNoteId,
    setLoading,
    deleteNoteApi,
    setError,
  } = useMainContext();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(""); // Стейт для хранения текущего цвета активной заметки
  const [order, setOrder] = useState(0);

  const [syncStatus, setSyncStatus] = useState("Сохранено");
  const [isFirstRun, setIsFirstRun] = useState(true);

  const [tags, setTags] = useState<string[]>([]); // Массив только ID тегов
  const [tagObjects, setTagObjects] = useState<Tag[]>([]); // Массив объектов тегов для отображения
  const [newTag, setNewTag] = useState<string>(""); // Новое название тега
  const [editTagId, setEditTagId] = useState<string | null>(null); // ID тега для редактирования
  const { notebooks, setNotebooks } = useNotebooks();

  // Full screen
  const [fullScreen, setFullScreen] = useState(false);
  const toggleFullScreen = () => setFullScreen((f) => !f);
  // Header menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  // Dialog states
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false);
  const [isMoveNoteDialogOpen, setIsMoveNoteDialogOpen] = useState(false);

  // Responsive layout contexts
  const { isNoteListOpen, toggleNoteList } = useContext(UIContext);
  const { isSidebarOpen, toggleSidebar } = useContext(UIContext);

  const [showEditBlockedMsg, setShowEditBlockedMsg] = useState(false);

  const { moveNoteToNewNotebook } = useMainContext();


  useEffect(() => {
    if (!activeNote) return;

    // Сбрасываем форму под новую заметку
    setTitle(activeNote.name || "");
    setContent(activeNote.text || "");
    setColor(activeNote?.color);
    setOrder(activeNote?.order);
    setTags(activeNote.tags || []);
    setEditTagId(null);
    setNewTag("");
    setIsNoteInTrash(!!activeNote.is_deleted);
    setIsNoteInArchive(!!activeNote.is_archived);
  }, [activeNote]);

  const footerRef = useRef<HTMLDivElement>(null);
  const [editorHeight, setEditorHeight] = useState("100vh");

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (footerRef.current) {
        const footerHeight = footerRef.current.offsetHeight;
        const headerHeight = 61; // высота хедера
        setEditorHeight(`calc(100vh - ${headerHeight}px - ${footerHeight}px`);
      }
    });

    // Наблюдаем за футером
    if (footerRef.current) {
      resizeObserver.observe(footerRef.current);
    }

    // Очистка при размонтировании компонента
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!activeNote || !Array.isArray(activeNote.tags)) return; // Если нет активной заметки или тегов, не выполняем запрос.

    const loadTagsForActiveNote = async () => {
      try {
        // Загружаем все теги с сервера
        const fetchedTags = await fetchTags();
        console.log("Все теги:", fetchedTags);
        console.log("Теги активной заметки:", activeNote.tags);

        // Фильтруем только те теги, ID которых есть в activeNote.tags
        const filteredTags = fetchedTags?.filter((tag) =>
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
  }, [activeNote?.tags]);

  // Автосейв с интервалом
  // useEffect(async () => {
  //   const hasChanges = () => {
  //     const nameChanged = title !== activeNote?.name;
  //     const contentChanged = content !== activeNote?.text;
  //     const tagsChanged = !isEqual(tags, activeNote?.tags || []);

  //     return nameChanged || contentChanged || tagsChanged;
  //   };

  //   const interval = setInterval(() => {
  //     console.log(hasChanges());
  //     if (hasChanges()) {
  //       setSyncStatus("Сохраняется…");
  //       autoSave();
  //     }
  //   }, AUTOSAVE_INTERVAL);

  //   return () => clearInterval(interval);
  // }, [title, content, tags]);

  // const autoSave = async () => {
  //   if (!activeNote || activeNote.is_deleted) return;

  //   try {
  // await updateNote(activeNote?.id || "", {
  //   name: title || "",
  //   text: content || "",
  //   tags: tags,
  //   order: 0,
  //   color: "",
  // });

  // const updatedNotes = await fetchNotes();
  // setNotes(updatedNotes);

  // setSyncStatus("Сохранено");
  // console.log("Заметка успешно сохранена!");
  // } catch (error) {
  //   console.error("Ошибка при автосохранении:", error);
  //   setSyncStatus("Ошибка");
  // }
  // });

  // useEffect(() => {
  //   const saveNote = async () => {
  //     if (!activeNote || activeNote.is_deleted || activeNote.is_archived)
  //       return;

  //     try {
  //       console.log("useEffect Editor: ", activeNote, title, content);
  //       await updateNote(activeNote.id, {
  //         name: title,
  //         text: content,
  //         color: color,
  //         order: order,
  //         tags: tags,
  //       });

  //       const updatedNotes = await fetchNotes();
  //       setNotes(updatedNotes);
  //       const updatedActiveNote = updatedNotes.find(
  //         (note) => note.id === activeNote.id
  //       );

  //       // Если такая заметка существует, обновляем activeNote
  //       if (updatedActiveNote) {
  //         setActiveNote(updatedActiveNote);
  //       } else {
  //         console.error("Заметка не найдена в обновлённом списке");
  //       }
  //       console.log(
  //         "useEffect Editor: ",
  //         notes,
  //         updatedNotes,
  //         activeNote,
  //         title,
  //         content
  //       );
  //       setSyncStatus("Сохранено");
  //       console.log("Заметка успешно сохранена!");
  //     } catch (error) {
  //       console.error("Ошибка при сохранении:", error);
  //       setSyncStatus("Ошибка");
  //     }
  //   };

  //   saveNote();
  // }, []);

  const handleCloseMenu = () => setAnchorEl(null);
  const handleClickMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let updatedName = e.currentTarget.value || "";
    setTitle(updatedName);

    updatedName = updatedName.trim();
    if (updatedName === "") {
      updatedName = "\u200B"; // zero-width space
    }

    if (activeNote) {
      const updatedCount = await updateNote(activeNote.id, {
        name: updatedName,
        text: content,
        color: color,
        order: order,
        tags: tags,
      });

      const count = typeof updatedCount === "number" ? updatedCount : 0;

      if (count > 0) {
        // Запрашиваем обновленные данные заметки с сервера
        const refreshedNote = await getNote(activeNote.id);

        // Обновляем состояние активной заметки с новыми данными
        setActiveNote(refreshedNote);
        setNotes(notes);
        setSyncStatus("Сохранено");

        console.log("Заметка успешно обновлена на сервере:", refreshedNote);
      }
    }
  };

  const handleBlockedInteraction = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setShowEditBlockedMsg(true);
  };

  const handleEditorChange = async ({ text }: { text: string }) => {
    if (isNoteInTrash) return;
    // Обновляем текст в локальном состоянии редактора
    setContent(text);

    if (activeNote) {
      try {
        // Отправляем изменения на сервер
        const updatedCount = await updateNote(activeNote.id, {
          name: title, // Сохраняем название
          text: text, // Сохраняем новый текст
          color: color, // Сохраняем цвет
          order: order, // Сохраняем порядок
          tags: tags, // Сохраняем теги
        });
        const count = typeof updatedCount === "number" ? updatedCount : 0;
        // Проверяем, что количество обновленных заметок больше 0 (если сервер возвращает именно количество)
        if (count > 0) {
          // Здесь можно отправить запрос на сервер для получения обновленных данных заметки
          const refreshedNote = await getNote(activeNote.id);
          console.log("updatedCount", updatedCount, count, refreshedNote);

          // Обновляем состояние активной заметки с новыми данными
          setActiveNote(refreshedNote);
          setNotes(notes);
          console.log("updatedCountaaa", activeNote);

          console.log("Заметка успешно обновлена на сервере");
        }
      } catch (error) {
        console.error("Ошибка при обновлении заметки на сервере", error);
      }
    }
  };

  // useEffect(() => {
  //   if (activeNote) {
  //     setTitle(activeNote.name); // Устанавливаем название заметки
  //     setContent(activeNote.text); // Устанавливаем текст заметки
  //     setColor(activeNote.color);
  //     setOrder(activeNote.order);
  //   }
  // }, [activeNote]);

  const handleDeleteNote = async () => {
    try {
      await deleteNoteApi(activeNote?.id || "");
      const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
      setNotes(updatedNotes);
      setActiveNote(null);
      toggleNoteList();
    } catch {
      setError("Ошибка удаления заметки");
    }
  };

  const handleMoveNote = (
    noteId: string,
    targetNotebookId: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => {
    moveNoteToNewNotebook(noteId, targetNotebookId, onSuccess, onError);
  };

  const handleAddTag = async () => {
    if (!newTag.trim() || newTag?.length > 20) return; // Если новый тег пустой, выходим

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
      tags: activeNote?.tags?.filter((tag) => tag !== tagId), // Убираем тег из activeNote
    });
    setNotes(notes);
  };

  const handleEditTag = async () => {
    // Логируем значения на начальном этапе
    console.log("Попытка редактирования тега...");
    console.log("newTag:", newTag);
    console.log("editTagId:", editTagId);
    console.log("activeNote:", activeNote);

    // Если новое имя тега пустое, нет id для редактирования, или нет активной заметки, выходим
    if (!newTag.trim() || !editTagId || !activeNote?.id) {
      console.log("Редактирование отменено. Условия не выполнены.");
      return;
    }

    // Обновляем тег на сервере
    try {
      console.log("Обновляем тег на сервере...");
      await updateTag(editTagId, {
        name: newTag.trim(),
        color: !activeNote.color ? "#ff6347" : "",
      });
      console.log("Тег обновлён на сервере:", {
        id: editTagId,
        name: newTag.trim(),
      });
    } catch (error) {
      console.log("Ошибка при обновлении тега на сервере:", error);
      return;
    }

    // Обновляем список тегов с сервера
    try {
      console.log("Загружаем актуальные теги с сервера...");
      const fetchedTags = await fetchTags(); // Запрос на сервер для получения всех тегов
      console.log("Получены все теги с сервера:", fetchedTags);

      // Фильтруем только те теги, ID которых есть в activeNote.tags
      const filteredTags = fetchedTags?.filter((tag) =>
        activeNote.tags.includes(tag.id)
      );

      // Обновляем локальное состояние tagObjects с актуальными тегами
      setTagObjects(filteredTags);
      console.log("Обновлённый список тегов:", filteredTags);

      // Обновляем теги в activeNote
      const updatedNote = {
        ...activeNote,
        tags: activeNote.tags.map(
          (tagId) => (tagId === editTagId ? editTagId : tagId) // Просто обновляем id, потому что тег уже обновлён в tagObjects
        ),
      };

      setActiveNote(updatedNote); // Обновляем activeNote

      // Обновляем список заметок
      const updatedNotes = notes.map((note) =>
        note.id === activeNote.id ? updatedNote : note
      );
      setNotes(updatedNotes); // Обновляем заметки

      // Сбрасываем поле ввода
      setNewTag("");
      setEditTagId(null); // Сбрасываем режим редактирования
      console.log("Режим редактирования сброшен.");
    } catch (error) {
      console.log("Ошибка при загрузке тегов с сервера:", error);
    }
  };

  console.log("isNoteListOpen in Editor: ", activeNote, isNoteListOpen);

  ////////////////////////////////////////////

  const colorPalette = [
    "#f28b82",
    "#fbbc04",
    "#fff475",
    "#ccff90",
    "#a7ffeb",
    "#aecbfa",
    "#d7aefb",
    "#fdcfe8",
    "#e8eaed",
    "#ffffff",
  ];

  const handleColorChange = async (newColor: string) => {
    setColor(newColor); // Обновляем локальное состояние цвета

    if (activeNote) {
      // Отправляем изменения на сервер
      const updatedCount = await updateNote(activeNote.id, {
        name: title, // Название заметки
        text: content, // Текущий текст
        color: newColor, // Новый цвет
        order: order, // Текущий порядок
        tags: tags, // Текущие теги
      });

      const count = typeof updatedCount === "number" ? updatedCount : 0;

      if (count > 0) {
        // Запрашиваем обновленные данные заметки с сервера
        const refreshedNote = await getNote(activeNote.id);

        // Обновляем состояние активной заметки с новыми данными
        setActiveNote(refreshedNote);
        setNotes(notes);
        console.log("Цвет заметки успешно обновлен на сервере:", refreshedNote);
      }
    }
  };

  // Обработчик для изменения приоритета
  const handleOrderChange = async (newOrder: number) => {
    setOrder(newOrder); // Обновляем локальное состояние порядка

    if (activeNote) {
      // Отправляем изменения на сервер
      const updatedCount = await updateNote(activeNote.id, {
        name: title, // Название заметки
        text: content, // Текущий текст
        color: color, // Текущий цвет
        order: newOrder, // Новый порядок
        tags: tags, // Текущие теги
      });

      const count = typeof updatedCount === "number" ? updatedCount : 0;

      if (count > 0) {
        // Запрашиваем обновленные данные заметки с сервера
        const refreshedNote = await getNote(activeNote.id);

        // Обновляем состояние активной заметки с новыми данными
        setActiveNote(refreshedNote);
        setNotes(notes);
        console.log(
          "Порядок заметки успешно обновлен на сервере:",
          refreshedNote
        );
      }
    }
  };

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Через 2 секунды иконка снова станет доступной
  };

  const { setShowArchived, setShowTrashed, showArchived, showTrashed } =
    useNotesVisibility(); // Using the contexts

  const {
    moveNoteIntoTrash,
    moveNoteIntoArchive,
    restoreNoteTrash,
    restoreNoteArchive,
    fetchTrashAllNotes,
    fetchArchiveAllNotes,
    archivedNotes,
    setArchivedNotes,
    trashedNotes,
    setTrashedNotes,
  } = useMainContext();

  const [isNoteInTrash, setIsNoteInTrash] = useState(activeNote?.is_deleted);
  const [isNoteInArchive, setIsNoteInArchive] = useState(
    activeNote?.is_archived
  );

  const handleMoveToTrash = () => {
    if (!activeNote) return;
    moveNoteIntoTrash(activeNote?.id || "");
    fetchTrashAllNotes();
    setActiveNote(null); // Clear active note
  };
  const handleMoveToArchive = () => {
    if (!activeNote) return;
    moveNoteIntoArchive(activeNote?.id || "");
    fetchArchiveAllNotes();
    setActiveNote(null); // Clear active note
  };
  const handleRestoreFromTrash = () => {
    if (!activeNote) return;
    restoreNoteTrash(activeNote?.id || "");
    fetchTrashAllNotes();
    setActiveNote(null); // Clear active note
  };
  const handleRestoreFromArchive = () => {
    if (!activeNote) return;
    restoreNoteArchive(activeNote?.id || "");
    fetchArchiveAllNotes();
    setActiveNote(null); // Clear active note
  };

  const handleDelete = () => {
    deleteNoteApi(activeNote?.id || "");
  };

  return (
    <>
      <Container $isNoteListOpen={isNoteListOpen} $fullScreen={fullScreen}>
        <Header>
          <CenteredDiv $hideInDesktop>
            <IconButton onClick={toggleNoteList}>
              <ArrowBackIosNewIcon />
            </IconButton>
          </CenteredDiv>
          <CenteredDiv $showInDesktop>
            <ArrowTooltip title={fullScreen ? "Уменьшить" : "Расширить"}>
              <FullScreenButton onClick={toggleFullScreen}>
                {fullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </FullScreenButton>
            </ArrowTooltip>
          </CenteredDiv>
          <TitleInput
            type="text"
            placeholder="Название"
            value={title}
            onChange={handleNameChange}
            maxLength={30}
            disabled={isNoteInTrash} // title input disabled only for trash
          />
          <CenteredDiv>
            <ArrowTooltip title="Ещё">
              <IconButton onClick={handleClickMenu}>
                <MoreVertIcon />
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
              Переместить заметку
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseMenu();
                setIsDeleteNoteDialogOpen(true);
              }}
              disableRipple
            >
              <DeleteForeverIcon />
              Удалить заметку
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
              notebookIds={notebooks.map((nb) => nb.id)}
              open={isMoveNoteDialogOpen}
              setOpen={setIsMoveNoteDialogOpen}
              notebooks={Object.fromEntries(
                notebooks.map((nb) => [nb.id, { name: nb.name }])
              )}
              onMove={handleMoveNote} // Pass the updated handleMoveNote function
            />
          </InvisibleDiv>
        </Header>

        <EditorWrapper>
          <StyledMdEditor
            style={{ height: editorHeight, backgroundColor: activeNote?.color }}
            value={content}
            renderHTML={(text: string) => mdParser.render(text)}
            onChange={handleEditorChange}
            placeholder="Начните печатать"
            plugins={[
              "header",
              "font-bold",
              "font-italic",
              "font-underline",
              "font-strikethrough",
              "list-unordered",
              "list-ordered",
              "todo",
              "block-quote",
              "block-wrap",
              "block-code-inline",
              "block-code-block",
              "table",
              "image",
              "link",
              "clear",
              "logger",
              "mode-toggle",
              "full-screen",
              "tab-insert",
            ]}
          />
          {isNoteInTrash && (
            <Overlay
              onMouseDown={handleBlockedInteraction}
              onKeyDown={handleBlockedInteraction}
              tabIndex={0}
              role="button"
              aria-label="Редактирование заблокировано, заметка в корзине"
            >
              <BlockedMessage>
                Редактирование заблокировано. Заметка находится в корзине.
              </BlockedMessage>
            </Overlay>
          )}
        </EditorWrapper>

        <Footer ref={footerRef} style={{ height: "auto" }}>
          <div style={{ display: "flex", gap: "10px" }}>
            <CopyToClipboard text={content} onCopy={handleCopy}>
              <IconButton>
                {isCopied ? <DoneIcon /> : <ContentCopyIcon />}
              </IconButton>
            </CopyToClipboard>

            {!isNoteInTrash && !isNoteInArchive && (
              <>
                <IconButton
                  onClick={handleMoveToTrash}
                  title="Переместить в корзину"
                >
                  <DeleteIcon />
                </IconButton>
                <IconButton
                  onClick={handleMoveToArchive}
                  title="Переместить в архив"
                >
                  <ArchiveIcon />
                </IconButton>
              </>
            )}

            {isNoteInTrash && (
              <>
                <IconButton
                  onClick={handleRestoreFromTrash}
                  title="Восстановить из корзины"
                >
                  <RestoreFromTrashIcon />
                </IconButton>
                <IconButton onClick={handleDelete} title="Удалить навсегда">
                  <DeleteForeverIcon />
                </IconButton>
              </>
            )}

            {isNoteInArchive && (
              <IconButton
                onClick={handleRestoreFromArchive}
                title="Восстановить из архива"
              >
                <UnarchiveIcon />
              </IconButton>
            )}
            {!isNoteInTrash && (
              <>
                <PrioritySelector
                  priority={order}
                  onPriorityChange={handleOrderChange}
                />

                <SyncStatus>
                  {syncStatus && (
                    <>
                      <span>{syncStatus}</span>
                      {syncStatus.includes("Сохраняется") && <span>🔄</span>}
                      {syncStatus.includes("Сохранено") && <span>✅</span>}
                      {syncStatus.includes("Ошибка") && <span>⚠️</span>}
                    </>
                  )}
                </SyncStatus>
              </>
            )}
          </div>
          {!isNoteInTrash && (
            <>
              <ColorPalette>
                {colorPalette.map((colorOption, index) => (
                  <ColorButton
                    key={index}
                    color={colorOption}
                    onClick={() => handleColorChange(colorOption)}
                    active={color === colorOption}
                  />
                ))}
              </ColorPalette>

              <TagContainer>
                {activeNote?.tags &&
                Array.isArray(activeNote?.tags) &&
                activeNote.tags.length > 0 ? (
                  activeNote.tags.map((tagId) => {
                    const tag = tagObjects?.find(
                      (tagObj) => String(tagObj.id) === String(tagId)
                    );

                    return tag ? (
                      <TagStyle
                        key={tag.id}
                        style={{ backgroundColor: tag.color }}
                      >
                        <span style={{ marginBottom: "5px" }}>{tag.name}</span>
                        <TagButton
                          onClick={() => handleDeleteTagFromNote(tag.id)}
                        >
                          <CloseIcon />
                        </TagButton>
                        <TagButton
                          onClick={() => {
                            setEditTagId(tag.id);
                            setNewTag(tag.name);
                          }}
                        >
                          <DriveFileRenameOutlineIcon />
                        </TagButton>
                      </TagStyle>
                    ) : null;
                  })
                ) : (
                  <></>
                )}
              </TagContainer>

              <ButtonsContainer>
                <AddTagWrapper>
                  <input
                    type="text"
                    placeholder="Введите тег"
                    value={newTag}
                    onChange={(e) => setNewTag(e.currentTarget.value)}
                    style={{
                      padding: "12px",
                      borderRadius: "20px",
                      border: "1px solid #ccc",
                      marginRight: "1px",
                    }}
                    maxLength={20}
                  />

                  <ButtonAddTag onClick={handleAddTag}>
                    <NewLabelIcon />
                  </ButtonAddTag>

                  {editTagId ? (
                    <ButtonEditTag onClick={handleEditTag}>
                      <DriveFileRenameOutlineIcon />
                    </ButtonEditTag>
                  ) : null}
                </AddTagWrapper>
              </ButtonsContainer>
            </>
          )}
        </Footer>

        <Snackbar
          open={showEditBlockedMsg}
          autoHideDuration={2000}
          onClose={() => setShowEditBlockedMsg(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            severity="warning"
            sx={{ width: "100%" }}
          >
            Редактирование невозможно. Заметка находится в корзине.
          </MuiAlert>
        </Snackbar>
      </Container>
    </>
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
    display: ${({ $isNoteListOpen }) => ($isNoteListOpen ? "block" : "block")};

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
  color: rgb(255, 131, 104);
  @media (max-width: 480px) {
    width: 8vw; /* Увеличиваем размер для мобильных устройств */
    height: 8vw;
    max-width: 50px; /* Ограничиваем максимальный размер */
    max-height: 50px;
  }
  width: 5vw; /* 5% от ширины экрана */
  height: 5vw; /* 5% от ширины экрана */
  max-width: 40px; /* Ограничиваем максимальный размер */
  max-height: 40px;

  &:hover {
    background-color: #e9e9e7;
  }
`;

const FullScreenButton = styled(IconButton)`
  font-size: 28px;
  width: 28px;
  height: 28px;
`;

const StyledMenu = styled(Menu)`
  .MuiPaper-root {
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    min-width: 220px;
    background-color: #fff;
  }

  .MuiMenuItem-root {
    font-size: 15px;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    color: #444;
    transition: background-color 0.3s ease, color 0.3s ease;
    border-radius: 6px;
    border: 1px #ddd;
    & svg {
      font-size: 20px;
      color: #888;
      transition: color 0.3s ease;
    }

    &:hover {
      background-color: #f0f4ff;
      color: #3951b5;

      & svg {
        color: #3951b5;
      }
    }

    &.active {
      font-weight: 600;
      color: #3951b5;

      & svg {
        color: #3951b5;
      }
    }
  }
`;

const EditorWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  cursor: not-allowed;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const BlockedMessage = styled.div`
  background: rgba(255, 255, 255, 0.9);
  color: #d32f2f;
  border-radius: 6px;
  padding: 8px 12px;
  font-weight: 600;
  user-select: none;
  pointer-events: none;
`;

const SyncStatus = styled.div`
  font-size: 12px;
  color: #555;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* <-- вот это выравнивает по правому краю */
  gap: 4px;
  width: 100%; /* чтобы занять всю ширину контейнера */
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
  
  // .ql-editor {
  //   ${scrollable}
  // }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-items: flex-start;
  padding-left: 20px;
  background-color: rgb(227, 227, 227);
  border-top: 1px solid #ddd;
`;

const ColorPalette = styled.div`
  display: flex;
  gap: 4px;
  /* Добавляем адаптивность для отступов и пространства между элементами */
  margin-top: 1vh;
  margin-bottom: 1vh;
`;

const ColorButton = styled.button<{ color: string; active: boolean }>`
  width: 5vw; /* 5% от ширины экрана */
  height: 5vw; /* 5% от ширины экрана */
  max-width: 40px; /* Ограничиваем максимальный размер */
  max-height: 40px; /* Ограничиваем максимальный размер */
  border: none;
  background-color: ${(props) => props.color};
  border-radius: 50%; /* Делаем кнопки круглые */
  cursor: pointer;
  outline: none;
  box-shadow: ${(props) => (props.active ? "0 0 0 2px #000" : "none")};
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }

  /* Для мобильных устройств (например, когда экран шире, чем 600px) */
  @media (max-width: 480px) {
    width: 8vw; /* Увеличиваем размер для мобильных устройств */
    height: 8vw;
    max-width: 50px; /* Ограничиваем максимальный размер */
    max-height: 50px;
  }
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 3px;
`;

const TagStyle = styled.div`
  background-color: #efefef;
  border-radius: 20px;
  padding: 1px 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TagButton = styled.button`
  background-color: transparent;
  border: none;
  color: rgb(32, 32, 32);
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
  margin-top: 2px;
`;

const AddTagWrapper = styled.div`
  display: flex;
  align-items: center; /* по вертикали выровнять */
  margin-bottom: 15px;
  border: none;
  gap: 5px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  margin-top: 15px;
  justify-content: flex-start; /* прижать к левому краю */
  gap: 15px; /* расстояние между кнопками */
`;

const ButtonAddTag = styled.button`
  padding: 8px 8px; /* чуть больше паддинга для комфорта */
  background-color: #1e3a8a;
  color: white;
  font-weight: 600; /* чуть жирнее текст */
  font-size: 16px; /* более читаемый размер шрифта */
  border: none;
  border-radius: 20px; /* чуть более округлённые углы */
  cursor: pointer;
  margin-top: 0; /* убираем отступ сверху — уже flex-контейнер */
  display: flex; /* для правильного центрирования содержимого */
  align-items: center;
  gap: 8px; /* расстояние между текстом и иконкой */

  svg {
    width: 24px; /* чуть поменьше иконка */
    height: 24px;
  }

  transition: background-color 0.3s ease;

  &:hover {
    background-color: #144a9e; /* чуть темнее при ховере */
  }

  &:active {
    background-color: #0f397d; /* ещё темнее при клике */
  }
`;

const ButtonEditTag = styled.button`
  padding: 8px 8px; /* чуть больше паддинга для комфорта */
  background-color: rgb(173, 18, 18); /* Цвет для кнопки редактирования */
  color: white;
  font-weight: 600; /* чуть жирнее текст */
  font-size: 16px; /* более читаемый размер шрифта */
  border: none;
  border-radius: 20px; /* округлённые углы */
  cursor: pointer;
  margin-top: 0; /* убираем отступ сверху — уже flex-контейнер */
  display: flex; /* для правильного центрирования содержимого */
  align-items: center;
  gap: 8px; /* расстояние между текстом и иконкой */

  svg {
    width: 24px; /* размер иконки */
    height: 24px;
  }

  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgb(196, 56, 56); /* чуть светлее при ховере */
  }

  &:active {
    background-color: rgb(140, 12, 12); /* темнее при клике */
  }
`;
