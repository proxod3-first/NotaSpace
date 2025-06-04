import React, { useState, useContext, useEffect, useCallback } from "react";
import Drawer from "@mui/material/Drawer";
import styled from "styled-components";
import SellIcon from "@mui/icons-material/Sell";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NotesIcon from "@mui/icons-material/Notes";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import {
  Search,
  AddCircleOutline,
  ExpandMore,
  Book,
  ExitToApp,
  DeleteForever,
} from "@mui/icons-material"; // Используем иконки MUI
import CreateNotebookDialog from "./CreateNotebookDialog";
import { UIContext } from "../../contexts/UIContext";
import TagManager from "./TagManager";
import ThemeToggle from "./ThemeToggle";
import ArrowTooltip from "../Shared/ArrowTooltip";
import { useNotebooks } from "../../contexts/NotebookContext"; // Используем хук из NotebookContext
import { baseIconButton, flexCenter, scrollable } from "../../styles/mixins";
import NotebookOption from "./NotebookOption";
import ErrorMessage from "../Shared/ErrorMessage";
import AllNotesOption from "./AllNotesOption";
import { useMainContext } from "../../contexts/NoteContext";
import { deleteNote } from "../../services/notesApi";
import { Note } from "../../types";
import { fetchNotebooks } from "../../services/notebooksApi";
import CopyToClipboard from "react-copy-to-clipboard";
import NoteList from "../NotesList/NotesList";
import { useNotesVisibility } from "../../contexts/NotesVisibilityContext"; // Путь к файлу контекста

interface RotateIconProps {
  open: boolean;
}

const BaseSidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(UIContext);
  const {
    notebooks,
    setNotebooks,
    setActiveNotebook,
    activeNotebook,
    addNotebook,
  } = useNotebooks(); // Используем контекст

  // Получаем данные и методы из контекста
  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    deleteNoteApi,
    archivedNotes,
    trashedNotes,
    fetchArchiveAllNotes,
    fetchTrashAllNotes,
  } = useMainContext(); // Подключаем архивированные и удалённые заметки

  const { showArchived, setShowArchived, showTrashed, setShowTrashed } =
    useNotesVisibility(); // Use contexts here

  const [openDialog, setOpenDialog] = useState(false);
  const [notebooksOpen, setNotebooksOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Логика для отображения активной книги
  const notebook_id = activeNotebook?.id;

  const ArchiveAndTrashedNotes = async () => {
    try {
      // Предполагаем, что эти функции делают побочные эффекты, но не возвращают данные
      await Promise.all([fetchArchiveAllNotes(), fetchTrashAllNotes()]);
    } catch (error) {
      setError("Ошибка при загрузке заметок");
    }
  };

  useEffect(() => {
    ArchiveAndTrashedNotes();
  }, []);

  useEffect(() => {
    console.log("Active notebook changed:", activeNotebook);
  }, [activeNotebook]);

  const fetchArchived = useCallback(async () => {
    if (showArchived) {
      await fetchArchiveAllNotes();
    }
  }, [showArchived, fetchArchiveAllNotes]);

  const fetchTrashed = useCallback(async () => {
    if (showTrashed) {
      await fetchTrashAllNotes();
    }
  }, [showTrashed, fetchTrashAllNotes]);

  useEffect(() => {
    fetchArchived();
    fetchTrashed();
  }, []);

  const { handleClick } = AllNotesOption();

  const handleArchivedToggle = () => {
    setShowArchived(true);
    setShowTrashed(false);
    setActiveNotebook(""); // Reset active notebook when showing archived notes
    toggleSidebar();
  };

  const handleTrashedToggle = () => {
    setShowTrashed(true);
    setShowArchived(false);
    setActiveNotebook(""); // Reset active notebook when showing trashed notes
    toggleSidebar();
  };
  
  const handleNotebookClick = (notebookId: string) => {
    setActiveNotebook(notebookId);
    setShowArchived(false); // Hide archived notes
    setShowTrashed(false); // Hide trashed notes
    toggleSidebar(); // Close the sidebar after selecting a notebook
  };

  useEffect(() => {
    console.log("Active notebook changed:", activeNotebook);
  }, [activeNotebook]);

  return (
    <Container>
      <List>
        <Heading>
          <HeadingLeft>
            <ClickableSection
              onClick={() => {
                setShowArchived(false);
                setShowTrashed(false);
                setActiveNotebook("");
                handleClick();
              }}
            >
              <NotesIcon />
              <TextWrapper>Все заметки</TextWrapper>
            </ClickableSection>
          </HeadingLeft>
        </Heading>
        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={() => setNotebooksOpen((prev) => !prev)}>
              <Book />
              <TextWrapper>Книги</TextWrapper>
              <RotateIcon open={notebooksOpen} />
            </ClickableSection>
          </HeadingLeft>

          <ArrowTooltip title="Новая книга" placement="right">
            <IconButton onClick={() => setOpenDialog(true)}>
              <AddCircleIcon />
            </IconButton>
          </ArrowTooltip>
        </Heading>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <NotebooksContainer $isOpen={notebooksOpen}>
          {notebooksOpen &&
            (Array.isArray(notebooks) && notebooks.length > 0 ? (
              notebooks.map((notebook) => (
                <NotebookOption
                  key={notebook.id}
                  notebook={notebook}
                  $active={activeNotebook?.id === notebook.id}
                  onClick={() => handleNotebookClick(notebook.id)} // Use the new click handler
                />
              ))
            ) : (
              <EmptyMessage>Создайте первую книгу!</EmptyMessage>
            ))}
        </NotebooksContainer>
        {/* Секция для Archived */}
        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={handleArchivedToggle}>
              <ArchiveIcon />
              <TextWrapper>Архив</TextWrapper>
            </ClickableSection>
          </HeadingLeft>
        </Heading>

        {/* Trashed Section */}
        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={handleTrashedToggle}>
              <DeleteIcon />
              <TextWrapper>Недавно удаленные</TextWrapper>
            </ClickableSection>
          </HeadingLeft>
        </Heading>

        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={() => setTagsOpen((prev) => !prev)}>
              <SellIcon />
              <TextWrapper>Теги</TextWrapper>
              <RotateIcon open={tagsOpen} />
            </ClickableSection>
          </HeadingLeft>
        </Heading>
        {tagsOpen && (
          <TagManagerContainer>
            <TagManager />
          </TagManagerContainer>
        )}
      </List>

      <Footer>
        <ArrowTooltip title="Аккаунт" placement="right">
          <AccountCircleIcon />
        </ArrowTooltip>
        {/* <ArrowTooltip title="Тема" placement="right">
          <ThemeToggle />
        </ArrowTooltip> */}
        <ArrowTooltip title="Выйти" placement="right">
          <IconButton onClick={() => console.log("Logout clicked")}>
            <ExitToApp />
          </IconButton>
        </ArrowTooltip>
      </Footer>

      <CreateNotebookDialog open={openDialog} setOpen={setOpenDialog} />
    </Container>
  );
};

const ActionButton = styled.button`
  padding: 5px 10px;
  margin: 0 5px;
  border: none;
  background-color: #4caf50;
  color: white;
  cursor: pointer;
  border-radius: 5px;

  &:hover {
    background-color: #45a049;
  }
`;

const NoteCard = styled.div`
  padding: 10px;
  margin: 5px;
  background-color: #f1f1f1;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NoteName = styled.span`
  font-size: 16px;
  font-weight: bold;
`;

const NoteActions = styled.div`
  display: flex;
  gap: 10px;
`;

const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(UIContext);

  return (
    <>
      <Drawer
        anchor="left"
        variant="temporary"
        open={isSidebarOpen}
        onClose={toggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", lg: "none" },
          "& .MuiDrawer-paper": { width: "240px", border: "none" },
        }}
      >
        <BaseSidebar />
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          "& .MuiDrawer-paper": { width: "240px", border: "none" },
        }}
      >
        <BaseSidebar />
      </Drawer>
    </>
  );
};

export default Sidebar;

const Container = styled.div`
  background-color: var(--sidebar-background);
  position: relative;
  user-select: none;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
`;

const List = styled.div`
  ${scrollable};
  padding: 18px 0;
  height: calc(100vh - 60px);
  overflow: auto;
`;

const TextWrapper = styled.span`
  font-size: 15px;
`;

const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 40px;
  color: var(--sidebar-text-muted);

  & svg {
    ${flexCenter}
    font-size: 20px;
  }
`;

const RotateIcon = styled(ExpandMore)<RotateIconProps>`
  transition: transform 0.2s;
  transform: ${(props) => (props.open ? "rotate(0deg)" : "rotate(-90deg)")};
`;

const HeadingLeft = styled.div`
  display: flex;
  gap: 7px;
  flex: 1;
`;

const IconButton = styled.button`
  ${baseIconButton}
  font-size: 20px;
  margin-left: auto;
  color: var(--sidebar-text-muted);

  &:hover {
    color: var(--sidebar-text-normal);
  }
`;

export const ClickableSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0px;
  padding-right: 5px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: #4c5ea8;
  }

  svg {
    font-size: 20px;
  }
`;

const NotebooksContainer = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? "300px" : "0")};
  overflow-y: auto;
  transition: max-height 0.3s ease;
  padding: ${({ $isOpen }) => ($isOpen ? "10px" : "0")};
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #999;
  padding: 10px;
  font-size: 14px;
`;

const TagManagerContainer = styled.div`
  padding: 0 10px 8px 15px; /* Отступы, чтобы тегам было удобно */
  max-height: 400px; /* Ограничение по высоте */
  max-width: 300px;
  overflow-y: auto; /* Прокрутка, если много тегов */
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  height: 60px;
  padding: 0px 16px;
  color: var(--sidebar-text-normal);
  background-color: #1e3a8a;
`;
