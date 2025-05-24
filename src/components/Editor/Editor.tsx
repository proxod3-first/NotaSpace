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
const AUTOSAVE_INTERVAL = 5;

const Editor = ({ note }: EditorProps) => {
  const { deleteNoteApi, moveNote, notebooks, setError } = useMainContext();

  const [title, setTitle] = useState(note.name);
  const [content, setContent] = useState(note.text || "");
  const [syncStatus, setSyncStatus] = useState("All changes saved");
  const [isFirstRun, setIsFirstRun] = useState(true);

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

  // Автосохранение по таймеру
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Пропускаем первый запуск
    if (isFirstRun) {
      setIsFirstRun(false);
      return;
    }

    setSyncStatus("Saving...");

    timer = setTimeout(async () => {
      try {
        await updateNote(note.id, {
          ...note,
          name: title,
          text: content,
        });

        // Если все прошло успешно
        setSyncStatus("All changes saved");
      } catch (error) {
        // Если ошибка, показываем ошибку
        setSyncStatus("Error saving note");
        setError("Ошибка при сохранении заметки.");
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearTimeout(timer);
  }, [title, content, note.id, note.color, note.order, isFirstRun]);

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

      <Footer>{syncStatus}</Footer>
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
  padding: 12px 15px;
  height: 40px;
  font-size: 14px;
  color: #334;
  text-align: right;
`;
