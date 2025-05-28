import React, { useContext, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import EditIcon from "@mui/icons-material/Edit";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";
import styled from "styled-components";
import { baseIconButton, flexCenter, truncatedText } from "../../styles/mixins";
import RenameNoteDialog from "./RenameNoteDialog";
import DeleteNoteDialog from "./DeleteNoteDialog";
import ArrowTooltip from "../Shared/ArrowTooltip";
import { Note } from "../../types";
import { UIContext } from "../../context/UIContext";
import {
  createNote,
  deleteNote,
  fetchNotes,
  moveNoteToTrash,
  updateNote,
} from "../../services/notesApi";
import { useNotebooks } from "../../context/NotebookContext";
import { useMainContext } from "../../context/NoteContext";

const Header = () => {
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const { activeNotebook, setActiveNotebook } = useNotebooks();

  const [isRenameNoteDialogOpen, setIsRenameNoteDialogOpen] = useState(false);
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false);
  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCreateNoteClick = async () => {
    const newNotes = notes.filter((note) => note.name.startsWith("New Note"));
    const template_text = "# Привет, это документ в Markdown!";
    const newNoteData = {
      name: `New Note ${newNotes.length + 1}`,
      text: template_text,
      color: "",
      order: 0,
      notebook_id: activeNotebook?.id || "",
      tags: [],
    };
    try {
      await createNote(newNoteData);
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      if (activeNote) {
        setActiveNoteId(activeNote.id);
      } else {
        setActiveNoteId(null);
      }
    } catch (error) {
      setError(
        "Не удалось создать заметку: " +
          (error instanceof Error ? error.message : "Неизвестная ошибка")
      );
    }
  };

  const handleRenameNoteClick = () => {
    handleCloseMenu();
    setIsRenameNoteDialogOpen(true);
  };

  const handleRenameNote = async (
    id: string,
    newName: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      const noteToUpdate = notes.find((note) => note.id === id);
      if (!noteToUpdate) {
        onError("Заметка не найдена");
        return;
      }

      const updatedNote = { ...noteToUpdate, name: newName };
      await updateNote(id, updatedNote);
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      onSuccess();
    } catch (error) {
      onError("Не удалось переименовать заметку. Попробуйте снова.");
    }
  };

  const handleDeleteNoteClick = () => {
    handleCloseMenu();
    setIsDeleteNoteDialogOpen(true);
  };

  const handleDeleteNote = async () => {
    try {
      await deleteNoteApi(activeNote?.id || "");
      const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
      setNotes(updatedNotes);
    } catch {
      setError("Ошибка удаления заметки");
    }
  };

  const handleMoveNoteToTrash = async (
    id: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      await moveNoteToTrash(id);
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      onSuccess();
    } catch (error) {
      onError("Не удалось переместить заметку в корзину. Попробуйте снова.");
    }
  };

  const handleViewDeletedNotes = () => {
    setIsTrashDialogOpen(true);
    handleCloseMenu();
  };
  const { toggleSidebar } = useContext(UIContext);

  return (
    <Container>
      <HeaderLeft>
        <HamburgerButton onClick={toggleSidebar}>
          <DensityMediumIcon />
        </HamburgerButton>
        <Heading>{activeNotebook ? activeNotebook.name : "All Notes"}</Heading>
      </HeaderLeft>
      <ButtonGroup>
        <ArrowTooltip title="Add new note" placement="bottom">
          <IconButton onClick={handleCreateNoteClick}>
            <NoteAddIcon />
          </IconButton>
        </ArrowTooltip>
        {activeNote?.id && (
          <ArrowTooltip title="More actions" placement="bottom">
            <IconButton onClick={handleClick}>
              <MoreHorizIcon />
            </IconButton>
          </ArrowTooltip>
        )}
      </ButtonGroup>
      <StyledMenu
        id="fade-menu"
        MenuListProps={{ "aria-labelledby": "fade-button" }}
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        TransitionComponent={Fade}
      >
        {activeNote && (
          <div>
            <MenuItem onClick={handleRenameNoteClick} disableRipple>
              <DriveFileRenameOutlineIcon />
              Rename note
            </MenuItem>
            <MenuItem onClick={handleDeleteNoteClick} disableRipple>
              <DeleteForeverIcon />
              Delete note
            </MenuItem>
            <MenuItem onClick={handleViewDeletedNotes} disableRipple>
              <DeleteForeverIcon />
              View deleted notes
            </MenuItem>
          </div>
        )}
      </StyledMenu>
      {activeNote && (
        <>
          <RenameNoteDialog
            note={activeNote!}
            open={isRenameNoteDialogOpen}
            setOpen={setIsRenameNoteDialogOpen}
            renameNote={handleRenameNote}
          />

          <DeleteNoteDialog
            note={activeNote}
            open={isDeleteNoteDialogOpen}
            setOpen={setIsDeleteNoteDialogOpen}
            deleteNoteDial={handleDeleteNote}
            onSuccess={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
          <DeleteNoteDialog
            note={activeNote!}
            open={isTrashDialogOpen}
            setOpen={setIsTrashDialogOpen}
            deleteNoteDial={handleMoveNoteToTrash}
            onSuccess={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </>
      )}
    </Container>
  );
};

export default Header;

const Container = styled.div`
  padding: 0 16px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
`;

const HeaderLeft = styled.div`
  ${flexCenter}
  gap: 8px;
`;

const Heading = styled.h2`
  font-weight: 400;
  font-size: 22px;
  ${truncatedText}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
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

const HamburgerButton = styled(IconButton)`
  display: flex;

  @media (min-width: 1200px) {
    display: none;
  }
`;

const StyledMenu = styled(Menu)`
  .MuiMenuItem-root {
    font-size: 14px;
    padding: 4px 16px;

    & svg {
      font-size: 18px;
      margin-right: 6px;
    }
    &.active {
      color: #647dc1;
    }
  }
`;

const InvisibleDiv = styled.div`
  display: none;
`;
