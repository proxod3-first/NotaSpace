import React, { useContext, useState } from "react";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
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
  updateNote,
} from "../../services/notesApi";

interface HeaderProps {
  notes: Note[];
  activeNoteId: string | null;
  setNotes: (notes: Note[]) => void;
  setError: (message: string) => void;
  onSelectNote: (newNoteId: string) => void;
}

const Header = ({
  notes,
  activeNoteId,
  setNotes,
  setError,
  onSelectNote,
}: HeaderProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [isRenameNoteDialogOpen, setIsRenameNoteDialogOpen] = useState(false);
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false);

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCreateNoteClick = async () => {
    const newNoteData: Omit<Note, "id" | "is_deleted"> = {
      name: "New Note",
      text: "",
      color: "",
      media: "",
      order: 0,
      notebook_id: "",
      tags: []
    };

    try {
      // Создаем новую заметку
      await createNote(newNoteData);

      // Получаем обновленные заметки
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes); // Обновляем список заметок

      // Получаем ID только что созданной заметки (если заметки отсортированы, это должен быть последний элемент)
      const newNoteId = updatedNotes[updatedNotes.length - 1]?.id;

      // Если заметка создана успешно, выбираем её для редактора
      if (newNoteId) {
        onSelectNote(newNoteId); // Обновляем активную заметку
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
      // Находим текущую заметку по id
      const noteToUpdate = notes.find((note) => note.id === id);

      if (!noteToUpdate) {
        onError("Заметка не найдена");
        return;
      }

      const updatedNote = {
        ...noteToUpdate,
        name: newName,
      };

      await updateNote(id, updatedNote); // Переименовываем заметку с новым объектом

      const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
      setNotes(updatedNotes); // Обновляем список заметок

      onSuccess(); // Если успешно, вызываем onSuccess
    } catch (error) {
      onError("Не удалось переименовать заметку. Попробуйте снова."); // В случае ошибки, вызываем onError
    }
  };

  const handleDeleteNoteClick = () => {
    handleCloseMenu();
    setIsDeleteNoteDialogOpen(true);
  };

  const handleDeleteNote = async (
    id: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      await deleteNote(id); // Удаляем заметку
      const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
      setNotes(updatedNotes);
      onSuccess(); // Если удалено успешно, вызываем onSuccess
    } catch (error) {
      onError("Не удалось удалить заметку. Попробуйте снова."); // В случае ошибки вызываем onError
    }
  };

  const { toggleSidebar } = useContext(UIContext);

  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  return (
    <Container>
      <HeaderLeft>
        <HamburgerButton onClick={toggleSidebar}>
          <OpenInFullIcon />
        </HamburgerButton>
        {/* <Heading>{activeNote ? activeNote.name : "Notes"}</Heading> */}
        <Heading>{"All Notes"}</Heading>
      </HeaderLeft>
      <ButtonGroup>
        <ArrowTooltip title="Add new note" placement="bottom">
          <IconButton onClick={handleCreateNoteClick}>
            <EditIcon />
          </IconButton>
        </ArrowTooltip>
        {activeNoteId && (
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
          </div>
        )}
      </StyledMenu>
      <InvisibleDiv>
        {activeNote && (
          <>
            <RenameNoteDialog
              note={activeNote!} // передаем активную заметку
              open={isRenameNoteDialogOpen}
              setOpen={setIsRenameNoteDialogOpen}
              renameNote={handleRenameNote} // передаем функцию для переименования
            />
            <DeleteNoteDialog
              note={activeNote!} // передаем активную заметку
              open={isDeleteNoteDialogOpen}
              setOpen={setIsDeleteNoteDialogOpen}
              deleteNoteDial={handleDeleteNote}
              onSuccess={() => setIsDeleteNoteDialogOpen(false)}
            />
          </>
        )}
      </InvisibleDiv>
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
  color: #9b9a9a;

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
