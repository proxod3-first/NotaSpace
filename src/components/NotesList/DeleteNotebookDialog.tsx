import React, { useState } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContentText from "@mui/material/DialogContentText";
import OutlinedButton from "../Shared/OutlinedButton";
import ErrorMessage from "../Shared/ErrorMessage";
import { baseButton } from "../../styles/mixins";
import styled from "styled-components";
import { Notebook } from "../../types/index";
import { useMainContext } from "../../contexts/NoteContext";
import { deleteNote } from "../../services/notesApi";

interface DeleteNotebookDialogProps {
  notebook: Notebook | null;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteNotebook: (
    // <-- исправлено
    id: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => void;
  onSuccess: () => void;
}

const DeleteNotebookDialog = ({
  notebook,
  open,
  setOpen,
  deleteNotebook, // <-- исправлено
  onSuccess,
}: DeleteNotebookDialogProps) => {
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setErrorMessage("");
    setOpen(false);
  };

  const { notes, moveNoteIntoTrash } = useMainContext();

  const handleDelete = async () => {
    if (!notebook) return;

    try {
      // сначала удаляем все заметки этого блокнота
      const notesToDelete = notes.filter(
        (note) => note.notebook_id === notebook.id
      );

      for (const note of notesToDelete) {
        moveNoteIntoTrash(note.id); // <-- твой метод удаления заметки
      }

      // потом удаляем сам блокнот
      deleteNotebook(
        notebook.id,
        () => {
          onSuccess();
          handleClose();
        },
        setErrorMessage
      );
    } catch (error) {
      setErrorMessage("Не удалось удалить связанные заметки.");
    }
  };

  if (!notebook) return null; // если блокнот не выбран — не рендерим вообще

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Удаление книги</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Вы уверены, что хотите удалить книгу <b>{notebook.name}</b>? Все
          связанные заметки будут перенесены в корзину. Это действие нельзя
          вернуть.
        </DialogContentText>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </DialogContent>
      <DialogActions>
        <OutlinedButton onClick={handleClose}>Назад</OutlinedButton>
        <DeleteButton onClick={handleDelete}>Удалить</DeleteButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteNotebookDialog;

const Dialog = styled(MuiDialog)`
  user-select: none;
`;

const DeleteButton = styled.button`
  ${baseButton}
  font-size: 15px;
  color: #f3f4f6;
  background-color: var(--danger);
  border: 1px solid var(--danger);
  padding: 10px;
  &:hover {
    background-color: #b33529;
  }
`;
