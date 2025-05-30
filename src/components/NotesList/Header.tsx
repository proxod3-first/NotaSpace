import React, { useContext, useEffect, useState } from "react";
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
import ArrowTooltip from "../Shared/ArrowTooltip";
import { Note } from "../../types";
import { UIContext } from "../../contexts/UIContext";
import {
  createNote,
  deleteNote,
  fetchNotes,
  moveNoteToTrash,
  updateNote,
} from "../../services/notesApi";
import { useNotebooks } from "../../contexts/NotebookContext";
import { useMainContext } from "../../contexts/NoteContext";
import { useNotesVisibility } from "../../contexts/NotesVisibilityContext";
import {
  deleteNotebook,
  fetchNotebooks,
  getNotebook,
  updateNotebook,
} from "../../services/notebooksApi";
import DeactivateNotebookDialog from "./DeactivateNotebookDialog";
import RenameNotebookDialog from "./RenameNotebookDialog";
import DeleteNotebookDialog from "./DeleteNotebookDialog";

const Header = () => {
  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    setActiveNoteId,
    setLoading,
    deleteNoteApi,
    archivedNotes,
    trashedNotes,
    setError,
  } = useMainContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const [isDeactivateNoteDialogOpen, setIsDeactivateNoteDialogOpen] =
    useState(false);

  const { activeNotebook, setActiveNotebook } = useNotebooks();
  const { notebooks, setNotebooks } = useNotebooks();
  const [isRenameNoteDialogOpen, setIsRenameNoteDialogOpen] = useState(false);
  const [isDeleteNoteDialogOpen, setIsDeleteNoteDialogOpen] = useState(false);
  const [isTrashDialogOpen, setIsTrashDialogOpen] = useState(false);

  useEffect(() => {
    const saveNotes = async () => {
      try {
        const updatedNotes = await fetchNotes(); // Получаем обновленный список заметок
        setNotes(updatedNotes);
      } catch (error) {
        console.error("Ошибка при сохранении:", error);
      }
    };

    saveNotes();
  }, [activeNote]);

  useEffect(() => {
    if (!activeNotebook) return;

    const refreshActiveNotebook = async () => {
      try {
        const freshNotebook = await getNotebook(activeNotebook.id);
        console.log("FreshNotebook: ", freshNotebook);

        if (freshNotebook) {
          const updatedNotebooks = notebooks.map((nb) =>
            nb.id === freshNotebook.id ? freshNotebook : nb
          );
          setNotebooks(updatedNotebooks);

          setActiveNotebook(freshNotebook.id); // <- передаём объект
        } else {
          setActiveNotebook(""); // если не найден, сбрасываем
        }
      } catch (error) {
        console.error("Ошибка при обновлении activeNotebook:", error);
      }
    };

    refreshActiveNotebook();
  }, [activeNotebook]);

  useEffect(() => {
    const loadNotebooks = async () => {
      try {
        const updatedNotebooks = await fetchNotebooks();
        setNotebooks(updatedNotebooks);
      } catch (error) {
        console.error("Ошибка при загрузке блокнотов:", error);
      }
    };

    loadNotebooks();
  }, [
    isDeleteNoteDialogOpen,
    isRenameNoteDialogOpen,
    isDeactivateNoteDialogOpen,
  ]);

  const refreshNotebooks = async () => {
    try {
      const updatedNotebooks = await fetchNotebooks();
      console.log("updatedNotebooks: ", updatedNotebooks);
      setNotebooks(updatedNotebooks);

      if (activeNotebook) {
        const stillExists = updatedNotebooks.find(
          (nb) => nb.id === activeNotebook.id
        );
        setActiveNotebook(stillExists ? stillExists.id : "");
      }
    } catch (error) {
      console.error("Ошибка при обновлении блокнотов с сервера:", error);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCreateNoteClick = async () => {
    const newNotes =
      notes?.filter((note) => note.name.startsWith("New Note")) ?? [];
    const template_text = "# Привет, это документ в Markdown!";
    const newNoteData = {
      name: `New Note ${newNotes?.length + 1}`,
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

  const handleRenameNotebook = async (
    id: string,
    newName: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      const notebookToUpdate = notebooks.find((nb) => nb.id === id);
      if (!notebookToUpdate) {
        onError("Блокнот не найден");
        return;
      }

      console.log("beforee: ", notebookToUpdate);
      const updatedNotebook = { ...notebookToUpdate, name: newName };
      await updateNotebook(id, updatedNotebook); // предполагаем, что у тебя есть API для этого
      console.log("afterr: ", updatedNotebook);
      await refreshNotebooks(); // тянем с сервера свежие данные

      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      onSuccess();
    } catch (error) {
      onError("Не удалось переименовать блокнот. Попробуйте снова.");
    }
  };

  useEffect(() => {
    console.log("notebooks updated: ", notebooks);
  }, [notebooks]);

  const handleDeactivateNotebook = async (
    id: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      if (!activeNotebook || activeNotebook.id !== id) {
        onError("Нет активного блокнота для удаления");
        return;
      }

      // Удаляем блокнот
      await deleteNotebook(id);

      // Удаляем все заметки, которые были в этом блокноте
      const notesInNotebook = notes.filter((note) => note.notebook_id === id);
      for (const note of notesInNotebook) {
        await deleteNote(note.id); // предполагаем, что есть API для полного удаления заметки
      }

      // Обновляем данные с сервера
      await refreshNotebooks();

      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      // Сбрасываем активный блокнот
      setActiveNotebook("");

      onSuccess();
    } catch (error) {
      onError("Ошибка при удалении блокнота и его заметок");
    }
  };

  const handleDeleteNoteClick = () => {
    handleCloseMenu();
    setIsDeleteNoteDialogOpen(true);
  };

  const handleDeleteNotebook = async (
    id: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      if (!activeNotebook || activeNotebook.id !== id) {
        onError("Нет активного блокнота для удаления");
        return;
      }

      await deleteNotebook(id);

      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      await refreshNotebooks();

      setActiveNotebook("");

      onSuccess();
    } catch (error) {
      onError("Ошибка при деактивации блокнота");
    }
  };

  const { showArchived, setShowArchived, showTrashed, setShowTrashed } =
    useNotesVisibility(); // Use contexts here

  const { toggleSidebar } = useContext(UIContext);

  let headingText = "All Notes (0)";

  if (showArchived) {
    headingText = `Archive (${
      Array.isArray(archivedNotes) ? archivedNotes.length : 0
    })`;
  } else if (showTrashed) {
    headingText = `Trash (${
      Array.isArray(trashedNotes) ? trashedNotes.length : 0
    })`;
  } else if (activeNotebook) {
    const count = Array.isArray(notes)
      ? notes.filter((note) => note.notebook_id === activeNotebook.id).length
      : 0;
    headingText = `${activeNotebook.name} (${count})`;
  } else {
    headingText = `All Notes (${Array.isArray(notes) ? notes.length : 0})`;
  }

  return (
    <Container>
      <HeaderLeft>
        <HamburgerButton onClick={toggleSidebar}>
          <DensityMediumIcon />
        </HamburgerButton>
        <Heading>{headingText}</Heading>
      </HeaderLeft>
      <ButtonGroup>
        <ArrowTooltip title="Add new note" placement="bottom">
          <IconButton onClick={handleCreateNoteClick}>
            <NoteAddIcon />
          </IconButton>
        </ArrowTooltip>
        {activeNotebook?.id && (
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
        {activeNotebook && (
          <div>
            <MenuItem onClick={handleRenameNoteClick} disableRipple>
              <DriveFileRenameOutlineIcon />
              Rename notebook
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                setIsDeactivateNoteDialogOpen(true);
              }}
              disableRipple
            >
              <DeleteForeverIcon />
              Deactivate notebook
            </MenuItem>

            <MenuItem onClick={handleDeleteNoteClick} disableRipple>
              <DeleteForeverIcon />
              Delete notebook
            </MenuItem>
          </div>
        )}
      </StyledMenu>
      {activeNotebook && (
        <>
          <RenameNotebookDialog
            notebook={activeNotebook}
            open={isRenameNoteDialogOpen}
            setOpen={setIsRenameNoteDialogOpen}
            renameNotebook={handleRenameNotebook}
          />

          <DeactivateNotebookDialog
            notebook={activeNotebook}
            open={isDeactivateNoteDialogOpen}
            setOpen={setIsDeactivateNoteDialogOpen}
            deactivateNotebook={handleDeactivateNotebook}
          />

          <DeleteNotebookDialog
            notebook={activeNotebook}
            open={isDeleteNoteDialogOpen}
            setOpen={setIsDeleteNoteDialogOpen}
            deleteNotebook={handleDeleteNotebook}
            onSuccess={() => {
              /* что-то */
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

const InvisibleDiv = styled.div`
  display: none;
`;
