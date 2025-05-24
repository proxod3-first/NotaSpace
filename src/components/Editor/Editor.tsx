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
import { baseIconButton, flexCenter } from "../../styles/mixins";
import { UIContext } from "../../context/UIContext";

import { createTag, updateTag, fetchTags } from "../../services/tagsApi";
import { addTagToNote, removeTagFromNote } from "../../services/notesApi";
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

interface UpdateNoteData {
  name: string;
  text: string;
  color: string;
  order: number;
  tags: string[];
}

const mdParser = new MarkdownIt();
const AUTOSAVE_INTERVAL = 5;

const Editor = ({ note }: EditorProps) => {
  const { deleteNoteApi, moveNote, notebooks, setError } = useMainContext();

  const [title, setTitle] = useState(note.name);
  const [content, setContent] = useState(note.text || "");
  const [syncStatus, setSyncStatus] = useState("All changes saved");
  const [isFirstRun, setIsFirstRun] = useState(true);

  const [tags, setTags] = useState<string[]>([]); // Массив только ID тегов
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

  useEffect(() => {
    setTitle(note.name);
    setContent(note.text || "");
    setIsFirstRun(true);
  }, [note.id]);

  useEffect(() => {
    setTitle(note.name);
    setContent(note.text || "");
  }, [note.name, note.text]);

  useEffect(() => {
    const loadTags = async () => {
      // Загружаем все теги с сервера
      const fetchedTags = await fetchTags();
      setTagObjects(fetchedTags);

      // Если у нас уже есть теги для текущей заметки, то загружаем только их
      const loadedTagObjects = fetchedTags.filter((tag) =>
        tags.includes(tag.id)
      );
      setTagObjects(loadedTagObjects);
    };
    loadTags();
  }, [tags]);

  // Автосохранение по таймеру
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isFirstRun) {
      setIsFirstRun(false);
      return;
    }

    setSyncStatus("Saving...");

    timer = setTimeout(async () => {
      try {
        const updatedNote: UpdateNoteData = {
          name: title,
          text: content,
          color: note.color,
          order: note.order,
          tags,
        };

        await updateNote(note.id, updatedNote);

        setSyncStatus("All changes saved");
      } catch (error) {
        setSyncStatus("Error saving note");
        setError("Ошибка при сохранении заметки.");
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearTimeout(timer);
  }, [title, content, tags, note.id, note.color, note.order, isFirstRun]);

  const handleCloseMenu = () => setAnchorEl(null);
  const handleClickMenu = (e: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(e.currentTarget);

  const handleEditorChange = ({ text }: { text: string }) => {
    setContent(text);
  };

  const handleDeleteNote = async () => {
    try {
      await deleteNoteApi(note.id);
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
    if (!newTag.trim()) return;

    // Создаем новый тег
    const tagData = { name: newTag.trim(), color: "#ff6347" }; // Цвет по умолчанию

    const newTagObj = await createTag(tagData);

    console.log(note.id, JSON.parse({ id: JSON.stringify(newTagObj) }.id));
    // Добавляем ID тега в список
    const value = JSON.parse({ id: JSON.stringify(newTagObj) }.id);
    setTags((prevTags) => [...prevTags, value]);
    // Привязываем тег к заметке
    await addTagToNote(note.id, value);

    // Обновляем список тегов
    setNewTag(""); // Сбрасываем поле ввода
  };

  const handleDeleteTag = async (tagId: string) => {
    // Удаляем тег из заметки
    console.log(note.id, tagId);
    await removeTagFromNote(note.id, tagId);
    

    // Удаляем ID тега из списка
    setTags((prevTags) => prevTags.filter((tag) => tag !== tagId));
  };

  const handleEditTag = async () => {
    if (!newTag.trim() || !editTagId) return;

    // Обновляем тег
    const updatedTag = await updateTag(editTagId, {
      name: newTag.trim(),
      color: "#ff6347",
    });

    // Обновляем теги в списке
    setTagObjects((prevTags) =>
      prevTags.map((tag) => (tag.id === editTagId ? updatedTag : tag))
    );

    // Обновляем тег в заметке
    await addTagToNote(note.id, updatedTag.id);

    setNewTag(""); // Сбрасываем поле ввода
    setEditTagId(null); // Сбрасываем режим редактирования
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
          onChange={(e) => setTitle(e.currentTarget.value)}
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
          {tagObjects.length > 0 ? (
            tagObjects.map((tag) => (
              <TagStyle key={tag.id}>
                <span>{tag.name}</span>
                {/* Кнопка для удаления */}
                <TagButton onClick={() => handleDeleteTag(tag.id)}>
                  Delete
                </TagButton>
                {/* Кнопка для редактирования */}
                <TagButton
                  onClick={() => {
                    setEditTagId(tag.id);
                    setNewTag(tag.name); // Устанавливаем имя тега в поле для редактирования
                  }}
                >
                  Edit
                </TagButton>
              </TagStyle>
            ))
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
          <Button onClick={handleAddTag}>Add Tag</Button>

          {/* Кнопка редактирования тега */}
          {editTagId ? <Button onClick={handleEditTag}>Edit Tag</Button> : null}
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
  background-color: white;
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
  /* Цвет фона редактора */
  background-color: #f0f2f5;

  /* Цвет текста */
  .editor-md {
    color: #333;
  }

  /* Цвет границ для блоков */
  .editor-md pre {
    background-color: #fafafa;
    border: 1px solid #ccc;
  }

  /* Заголовки */
  .editor-md h1,
  .editor-md h2,
  .editor-md h3,
  .editor-md h4,
  .editor-md h5,
  .editor-md h6 {
    color: var(--brand); /* Используем ту же переменную */
  }

  /* Уменьшение отступов снизу */
  .editor-md .footer {
    padding-bottom: 10px; /* Уменьшаем паддинг */
  }

  /* Уменьшение отступа снизу для текста */
  .editor-md textarea {
    margin-bottom: 10px;
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

const Button = styled.button`
  padding: 5px 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;
