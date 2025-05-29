import React, { useState, useContext, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import styled from "styled-components";
import SellIcon from "@mui/icons-material/Sell";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import NotesIcon from "@mui/icons-material/Notes";
import {
  Search,
  AddCircleOutline,
  ExpandMore,
  Book,
  ExitToApp,
  DeleteForever,
} from "@mui/icons-material"; // Используем иконки MUI
import CreateNotebookDialog from "./CreateNotebookDialog";
import { UIContext } from "../../context/UIContext";
import TagManager from "./TagManager";
import ThemeToggle from "./ThemeToggle";
import ArrowTooltip from "../Shared/ArrowTooltip";
import { useNotebooks } from "../../context/NotebookContext"; // Используем хук из NotebookContext
import { baseIconButton, flexCenter, scrollable } from "../../styles/mixins";
import NotebookOption from "./NotebookOption";
import ErrorMessage from "../Shared/ErrorMessage";
import AllNotesOption from "./AllNotesOption";
import { useMainContext } from "../../context/NoteContext";
import { deleteNote } from "../../services/notesApi";
import { Note } from "../../types";
import { fetchNotebooks } from "../../services/notebooksApi";

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

  const { archivedNotes } = useMainContext(); // Подключаем архивированные заметки

  const [archivedOpen, setArchivedOpen] = useState(false);
  // const [deletedOpen, setDeletedOpen] = React.useState(false);

  const { handleClick } = AllNotesOption();

  const [openDialog, setOpenDialog] = useState(false);
  const [notebooksOpen, setNotebooksOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Active notebook changed:", activeNotebook);
  }, [activeNotebook]);

  // Логика для отображения активной книги
  const notebook_id = activeNotebook?.id;

  return (
    <Container>
      <List>
        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={handleClick}>
              <NotesIcon />
              <TextWrapper>All Notes</TextWrapper>
            </ClickableSection>
          </HeadingLeft>
        </Heading>
        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={() => setNotebooksOpen((prev) => !prev)}>
              <Book />
              <TextWrapper>Notebooks</TextWrapper>
              <RotateIcon open={notebooksOpen} />
            </ClickableSection>
          </HeadingLeft>

          <ArrowTooltip title="Create notebook" placement="right">
            <IconButton onClick={() => setOpenDialog(true)}>
              <AddCircleIcon />
            </IconButton>
          </ArrowTooltip>
        </Heading>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <NotebooksContainer $isOpen={notebooksOpen}>
          {notebooksOpen &&
            (Array.isArray(notebooks) && notebooks.length > 0 ? (
              notebooks.map((notebook, index) => (
                <NotebookOption
                  key={notebook.id || index}
                  notebook={notebook}
                  $active={notebook_id === notebook?.id}
                  onClick={() => setActiveNotebook(notebook.id)}
                />
              ))
            ) : (
              <EmptyMessage>Нет блокнотов</EmptyMessage>
            ))}
        </NotebooksContainer>
        {/* Раздел для Archiving */}
        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={() => setArchivedOpen((prev) => !prev)}>
              <ArchiveIcon />
              <TextWrapper>Archive</TextWrapper>
              <RotateIcon open={archivedOpen} />
            </ClickableSection>
          </HeadingLeft>
        </Heading>

        {/* // TODO: Должно отображаться в NoteList */}
        {/* {archivedOpen && (
          <div>
            {archivedNotes.length > 0 ? (
              archivedNotes.map((note: Note) => (
                <div key={note.id}>
                  <span>{note.name}</span>
                  <button onClick={() => restoreNote(note.id)}>Restore</button>
                  <button onClick={() => permanentlyDeleteNote(note.id)}>
                    Delete Permanently
                  </button>
                </div>
              ))
            ) : (
              <p>No archived notes</p>
            )}
          </div>
        )} */}
        {/* Раздел для Deleted */}
        <Heading>
          <HeadingLeft>
            {/* <ClickableSection onClick={() => setDeletedOpen((prev) => !prev)}> */}
              <DeleteIcon />
              <TextWrapper>Recently Deleted</TextWrapper>
              {/* <RotateIcon open={deletedOpen} /> */}
            {/* </ClickableSection> */}
          </HeadingLeft>
        </Heading>
        {/* {deletedOpen && (
          <div>
            {deletedNotes.length > 0 ? (
              deletedNotes.map((note: Note) => (
                <div key={note.id}>
                  <span>{note.name}</span>
                  <button onClick={() => restoreNote(note.id)}>Restore</button>
                  <button onClick={() => permanentlyDeleteNote(note.id)}>
                    Delete Permanently
                  </button>
                </div>
              ))
            ) : (
              <p>No deleted notes</p>
            )}
          </div> */}
        {/* )} */}
        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={() => setTagsOpen((prev) => !prev)}>
              <SellIcon />
              <TextWrapper>Tags</TextWrapper>
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
        <span>{activeNotebook?.name || "All Notes"}</span>
        <ArrowTooltip title="ThemeToggle" placement="right">
          <ThemeToggle />
        </ArrowTooltip>
        <ArrowTooltip title="Logout" placement="right">
          <IconButton onClick={() => console.log("Logout clicked")}>
            <ExitToApp />
          </IconButton>
        </ArrowTooltip>
      </Footer>

      <CreateNotebookDialog open={openDialog} setOpen={setOpenDialog} />
    </Container>
  );
};

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
