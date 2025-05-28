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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import MoveNoteDialog from "./MoveNoteDialog";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import NewLabelIcon from "@mui/icons-material/NewLabel";
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

interface PrevNoteState {
  _name: string;
  text: string;
  tags: string[];
}

const mdParser = new MarkdownIt();
const AUTOSAVE_INTERVAL = 10000;

const Editor = ({ note }: EditorProps) => {
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
    setError,
  } = useMainContext();

  const [title, setTitle] = useState(activeNote?.name);
  const [content, setContent] = useState(activeNote?.text);
  const [syncStatus, setSyncStatus] = useState("Сохранено");
  const [isFirstRun, setIsFirstRun] = useState(true);

  const [tags, setTags] = useState<string[]>(activeNote?.tags || []); // Массив только ID тегов
  const [tagObjects, setTagObjects] = useState<Tag[]>([]); // Массив объектов тегов для отображения
  const [newTag, setNewTag] = useState<string>(""); // Новое название тега
  const [editTagId, setEditTagId] = useState<string | null>(null); // ID тега для редактирования

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
  const { isSidebarOpen, toggleSidebar } = useContext(UIContext);

  useEffect(() => {
    if (!activeNote) return;

    // Сбрасываем форму под новую заметку
    setTitle(activeNote.name || "");
    setContent(activeNote.text || "");
    setTags(activeNote.tags || []);
    setEditTagId(null);
    setNewTag("");
  }, [activeNote?.id]);

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

  useEffect(() => {
    const saveNote = async () => {
      if (!activeNote || activeNote.is_deleted) return;

      try {
        await updateNote(activeNote.id || "", {
          name: title || "",
          text: content || "",
          tags: tags,
          order: 0,
          color: "",
        });

        const updatedNotes = await fetchNotes();
        setNotes(updatedNotes);

        setSyncStatus("Сохранено");
        console.log("Заметка успешно сохранена!");
      } catch (error) {
        console.error("Ошибка при сохранении:", error);
        setSyncStatus("Ошибка");
      }
    };

    saveNote();
  }, [title, content, tags, activeNote]);

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

  const handleDeleteNote = async () => {
    try {
      await deleteNoteApi(activeNote?.id || "");
      const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
      setNotes(updatedNotes);
      toggleNoteList();
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
    if (!newTag.trim() || newTag.length > 20) return; // Если новый тег пустой, выходим

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
      color: activeNote.color,
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
      // Обновляем состояние activeNote с новым тегом

      setActiveNote(updatedNote);
      setNotes(notes);
      // Сбрасываем поле ввода
      setNewTag("");
      setEditTagId(null); // Сбрасываем режим редактирования
    }
  };

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
              {fullScreen ? <FullscreenIcon /> : <FullscreenExitIcon />}
            </FullScreenButton>
          </ArrowTooltip>
        </CenteredDiv>
        <TitleInput
          type="text"
          placeholder="Title"
          value={title}
          onChange={handleNameChange}
          maxLength={30}
        />

        <CenteredDiv>
          <ArrowTooltip title="More actions">
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
        // style={{ flex: 1 }}
        style={{ height: editorHeight }}
        value={content}
        renderHTML={(text: string) => mdParser.render(text)}
        onChange={handleEditorChange}
        placeholder="Начните печатать"
      />

      <Footer ref={footerRef} style={{ height: "auto" }}>
        {/* Статус синхронизации */}
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
                <TagStyle key={tag.id} style={{ backgroundColor: tag.color }}>
                  <span>{tag.name}</span>
                  {/* Кнопка для удаления */}
                  <TagButton onClick={() => handleDeleteTagFromNote(tag.id)}>
                    <CloseIcon />
                  </TagButton>
                  {/* Кнопка для редактирования */}
                  <TagButton
                    onClick={() => {
                      setEditTagId(tag.id);
                      setNewTag(tag.name);
                    }}
                  >
                    <DriveFileRenameOutlineIcon />
                  </TagButton>
                </TagStyle>
              ) : null; // Если тег не найден, ничего не отображаем
            })
          ) : (
            <span>No found tags</span> // Сообщение, если тегов нет
          )}
        </TagContainer>

        {/* Добавление нового тега */}
        <ButtonsContainer>
          <AddTagWrapper>
            <input
              type="text"
              placeholder="New tag"
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
            {/* Кнопка редактирования тега */}
            {editTagId ? (
              <ButtonEditTag onClick={handleEditTag}>
                <DriveFileRenameOutlineIcon />
              </ButtonEditTag>
            ) : null}
          </AddTagWrapper>
        </ButtonsContainer>
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
  color: rgb(255, 131, 104);

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
  .MuiMenuItem-root {
    font-size: 14px;
    padding: 4px 16px;

    & svg {
      font-size: 18px;
      margin-right: 6px;
    }
  }
`;

const SyncStatus = styled.div`
  font-size: 12px;
  color: #555;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
  width: 100%;
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

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 3px;
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
