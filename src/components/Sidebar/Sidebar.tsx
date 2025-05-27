import React, { useState, useContext } from "react";
import Drawer from "@mui/material/Drawer";
import styled from "styled-components";
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
import SearchField from "./SearchField";
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

interface RotateIconProps {
  open: boolean;
}

const BaseSidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useContext(UIContext);
  const { notebooks, setActiveNotebook, activeNotebook, addNotebook } =
    useNotebooks(); // Используем контекст

  const { archivedNotes } = useMainContext(); // Подключаем архивированные заметки

  const [archivedOpen, setArchivedOpen] = useState(false);
  const { deletedNotes, restoreNote, permanentlyDeleteNote } = useMainContext();
  const [deletedOpen, setDeletedOpen] = React.useState(false);

  const handlePermanentlyDelete = async (noteId: string) => {
    try {
      await permanentlyDeleteNote(noteId); // Запрос в API для окончательного удаления
      alert("Note deleted permanently");
    } catch (error) {
      console.error("Failed to delete permanently", error);
      alert("Error deleting note permanently");
    }
  };
  const [openDialog, setOpenDialog] = useState(false);
  const [notebooksOpen, setNotebooksOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Логика для отображения активной книги
  const notebook_id = activeNotebook?.id;

  return (
    <Container>
      <List>
        <SearchField onChange={(text) => console.log("Search:", text)} />

        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={() => console.log("All Notes clicked")}>
              <Book />
              <TextWrapper>
                <AllNotesOption $active={true} />
              </TextWrapper>
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
              <AddCircleOutline />
            </IconButton>
          </ArrowTooltip>
        </Heading>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {notebooksOpen ? (
          Array.isArray(notebooks) && notebooks.length > 0 ? (
            notebooks.map((notebook, index) => (
              <NotebookOption
                key={notebook.id || index} // Fallback to index if notebook.id is not available
                notebook={notebook}
                $active={notebook_id === notebook.id}
                onClick={() => {
                  setActiveNotebook(notebook.id); // Устанавливаем активную книгу
                }}
              />
            ))
          ) : (
            <div>No notebooks found</div> // Сообщение, если нет книг
          )
        ) : (
          <div></div> // Сообщение, если notebooksOpen равно false
        )}

        {/* Раздел для Archiving */}
        <Heading>
          <HeadingLeft>
            <ClickableSection onClick={() => setArchivedOpen((prev) => !prev)}>
              <Book />
              <TextWrapper>Archive</TextWrapper>
              <RotateIcon open={archivedOpen} />
            </ClickableSection>
          </HeadingLeft>
        </Heading>


        // TODO: Должно отображаться в NoteList
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
            <ClickableSection onClick={() => setDeletedOpen((prev) => !prev)}>
              <Book />
              <TextWrapper>Recently Deleted</TextWrapper>
              <RotateIcon open={deletedOpen} />
            </ClickableSection>
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
              <Book />
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
  user-select: none;
  z-index: -1;
`;

const List = styled.div`
  ${scrollable};
  padding: 18px 0;
  height: calc(100vh - 60px);
`;

const TextWrapper = styled.span`
  font-size: 15px;
`;

const Heading = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 36px;
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

const ClickableSection = styled.div`
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
    background-color: #f0f0f0;
  }

  svg {
    font-size: 20px;
  }
`;

const TagManagerContainer = styled.div`
  padding: 0 10px 8px 15px; /* Отступы, чтобы тегам было удобно */
  max-height: 300px; /* Ограничение по высоте */
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
