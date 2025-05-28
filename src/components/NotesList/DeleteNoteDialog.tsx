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
import { Note } from "../../types/index";

interface DeleteNoteDialogProps {
  note: Note;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deleteNoteDial: (
    id: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => void;
  onSuccess: () => void;
}

const DeleteNoteDialog = ({
  note,
  open,
  setOpen,
  deleteNoteDial,
  onSuccess,
}: DeleteNoteDialogProps) => {
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setErrorMessage("");
    setOpen(false); // Закрываем диалог
  };

  const handleDelete = async () => {
    deleteNoteDial(
      note.id,
      () => {
        onSuccess(); // Если удалено успешно, вызываем onSuccess
        handleClose(); // Закрываем диалог после успешного удаления
      },
      setErrorMessage
    ); // В случае ошибки вызываем setErrorMessage
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Удалить заметку</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Вы уверены, что хотите удалить эту заметку? Это действие нельзя
          отменить.
        </DialogContentText>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </DialogContent>
      <DialogActions>
        <OutlinedButton onClick={handleClose}>Отмена</OutlinedButton>
        <DeleteButton onClick={handleDelete}>Удалить</DeleteButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteNoteDialog;

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
