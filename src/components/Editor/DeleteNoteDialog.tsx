import React, { useState } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import styled from "styled-components";
import OutlinedButton from "../Shared/OutlinedButton";
import ErrorMessage from "../Shared/ErrorMessage";
import { baseButton } from "../../styles/mixins";
import { Note } from "../../types";

interface DialogProps {
  note: Note;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onDelete: () => Promise<void>; // Добавляем проп onDelete
}
  
const DeleteNoteDialog = ({ note, open, setOpen, onDelete }: DialogProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  
  const handleClose = () => {
    setErrorMessage("");
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await onDelete();
      setOpen(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      setErrorMessage(msg);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Удалить заметку</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Заметка будет удалена безвозвратно. Это невозможно отменить.
        </DialogContentText>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </DialogContent>
      <DialogActions>
        <OutlinedButton type="button" onClick={handleClose}>
          Назад
        </OutlinedButton>
        <DeleteButton type="submit" onClick={handleSubmit}>
          Удалить
        </DeleteButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteNoteDialog;

const Dialog = styled(MuiDialog)`
  user-select: none;

  .MuiDialogActions-root {
    margin-right: 12px;
  }
`;

const DeleteButton = styled.button`
  ${baseButton}
  font-size: 15px;
  margin: 8px 0;
  padding: 10px 16px;
  color: #f3f4f6;
  background-color: var(--danger);
  border: 1px solid var(--danger);
  background-color: #b33529;
  &:hover {
    background-color: #b33529;
    cursor: pointer;
  }
`;
function useNotes(): [any] {
  throw new Error("Function not implemented.");
}

