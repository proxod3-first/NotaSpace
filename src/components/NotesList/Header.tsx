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
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { baseIconButton, flexCenter, truncatedText } from "../../styles/mixins";
import ArrowTooltip from "../Shared/ArrowTooltip";
import { Note } from "../../types";
import { UIContext } from "../../contexts/UIContext";
import ArchiveIcon from "@mui/icons-material/Archive";
import {
  createNote,
  deleteNote,
  fetchNotes,
  moveNoteToArchive,
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
import { Description } from "@mui/icons-material";

const Header = () => {
  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    setActiveNoteId,
    setLoading,
    deleteNoteApi,
    moveNoteIntoTrash,
    moveNoteIntoArchive,
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
  const { isNoteListOpen, toggleNoteList } = useContext(UIContext);

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
        // console.log("FreshNotebook: ", freshNotebook);

        if (freshNotebook) {
          const updatedNotebooks = notebooks?.map((nb) =>
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
        console.error("Ошибка при загрузке книг:", error);
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
      // console.log("updatedNotebooks: ", updatedNotebooks);
      setNotebooks(updatedNotebooks);

      if (activeNotebook) {
        const stillExists = updatedNotebooks.find(
          (nb) => nb.id === activeNotebook.id
        );
        setActiveNotebook(stillExists ? stillExists.id : "");
      }
    } catch (error) {
      console.error("Ошибка при обновлении книг с сервера:", error);
    }
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleCreateNoteClick = async () => {
    const newNotes =
      notes?.filter((note) => note.name.startsWith("Заметка")) ?? [];
    const template_text = "# Привет, это документ в Markdown!";

    // Данные для новой заметки
    const newNoteData = {
      name: `Заметка ${newNotes?.length + 1}`,
      text: template_text,
      color: "",
      order: 1,
      notebook_id: activeNotebook?.id || "",
      tags: [],
    };

    try {
      // Создаем новую заметку
      await createNote(newNoteData);

      // Получаем обновленный список заметок
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      // Находим только что созданную заметку
      const newNote = updatedNotes.find(
        (note) => note.name === newNoteData.name
      );

      // Устанавливаем её как активную
      if (newNote) {
        toggleNoteList();
        setActiveNoteId(null);
        setActiveNote(newNote); // Обновляем объект активной заметки
      } else {
        setActiveNoteId(null);
        setActiveNote(null);
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
    newDesc: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      const notebookToUpdate = notebooks.find((nb) => nb.id === id);
      if (!notebookToUpdate) {
        onError("Книга не найдена");
        return;
      }

      // console.log("beforee: ", notebookToUpdate);
      const updatedNotebook = {
        ...notebookToUpdate,
        name: newName,
        description: newDesc,
      };
      const updatedActiveNotebook = await updateNotebook(id, updatedNotebook); // предполагаем, что у тебя есть API для этого
      // console.log("afterr: ", updatedNotebook);
      await refreshNotebooks(); // тянем с сервера свежие данные

      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      const count =
        typeof updatedActiveNotebook === "number" ? updatedActiveNotebook : 0;

      if (count > 0) {
        // Запрашиваем обновленные данные заметки с сервера
        const refreshedNotebook = await getNotebook(notebookToUpdate.id);

        // Обновляем состояние активной заметки с новыми данными
        setActiveNotebook(refreshedNotebook?.id || "");
        // console.log(
        //   "Цвет заметки успешно обновлен на сервере: ",
        //   refreshedNotebook
        // );
      }

      onSuccess();
    } catch (error) {
      onError("Не удалось переименовать книгу. Попробуйте снова.");
    }
  };

  useEffect(() => {
    // console.log("notebooks updated: ", notebooks);
  }, [notebooks]);

  const handleDeactivateNotebook = async (
    id: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => {
    try {
      if (!activeNotebook || activeNotebook.id !== id) {
        onError("Нет активной книги для удаления");
        return;
      }

      // Удаляем все заметки, которые были в этом блокноте
      const notesInNotebook = notes.filter((note) => note.notebook_id === id);
      for (const note of notesInNotebook) {
        moveNoteIntoArchive(note.id); // предполагаем, что есть API для полного удаления заметки
      }

      setActiveNote(null);
      await refreshNotebooks();

      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      onSuccess();
    } catch (error) {
      onError("Ошибка при удалении книги и ее заметок");
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
        onError("Нет активной книги для удаления");
        return;
      }

      await deleteNotebook(id);

      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes);

      await refreshNotebooks();

      setActiveNotebook("");

      onSuccess();
    } catch (error) {
      onError("Ошибка при деактивации книги");
    }
  };

  const { showArchived, setShowArchived, showTrashed, setShowTrashed } =
    useNotesVisibility(); // Use contexts here

  const { toggleSidebar } = useContext(UIContext);

  let headingText = "Все заметки (0)";

  if (showArchived) {
    headingText = `Архив (${
      Array.isArray(archivedNotes) ? archivedNotes.length : 0
    })`;
  } else if (showTrashed) {
    headingText = `Недавно удаленные (${
      Array.isArray(trashedNotes) ? trashedNotes.length : 0
    })`;
  } else if (activeNotebook) {
    const count = Array.isArray(notes)
      ? notes.filter((note) => note.notebook_id === activeNotebook.id).length
      : 0;
    headingText = `${activeNotebook.name} (${count})`;
  } else {
    headingText = `Все заметки (${Array.isArray(notes) ? notes.length : 0})`;
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
        {!showArchived && !showTrashed && (
          <>
            <ArrowTooltip title="Новая заметка" placement="bottom">
              <IconButton onClick={handleCreateNoteClick}>
                <NoteAddIcon />
              </IconButton>
            </ArrowTooltip>

            {activeNotebook?.id && (
              <ArrowTooltip title="Ещё" placement="bottom">
                <IconButton onClick={handleClick}>
                  <MoreHorizIcon />
                </IconButton>
              </ArrowTooltip>
            )}
          </>
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
              Переименовать книгу
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                setIsDeactivateNoteDialogOpen(true);
              }}
              disableRipple
            >
              <ArchiveIcon />
              Переместить в архив
            </MenuItem>

            <MenuItem onClick={handleDeleteNoteClick} disableRipple>
              <DeleteForeverIcon />
              Удалить книгу
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
            onSuccess={() => {}}
          />
        </>
      )}
    </Container>
  );
};

export default Header;

const Container = styled.div`
  padding: 0 14px;
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
  @media (max-width: 1200px) {
    font-size: 18px;
  }

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
    border: 1px #ddd;
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
