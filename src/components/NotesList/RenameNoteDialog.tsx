import React, { useState } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import styled from "styled-components";
import ContainedButton from "../Shared/ContainedButton";
import OutlinedButton from "../Shared/OutlinedButton";
import Input from "../Shared/Input";
import ErrorMessage from "../Shared/ErrorMessage";
import { Note } from "../../types";

interface DialogProps {
  note: Note;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  renameNote: (id: string, newName: string, onSuccess: () => void, onError: (error: string) => void) => void;
}

const RenameNoteDialog = ({ note, open, setOpen, renameNote }: DialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>(note.name);

  // Закрытие диалога
  const handleClose = () => {
    setInputValue(note.name);
    setErrorMessage("");
    setOpen(false);
  };

  // Обработчик изменения значения ввода
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // Обработчик отправки формы
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (inputValue.trim() !== note.name) {
      renameNote(note.id, inputValue, handleClose, setErrorMessage);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Rename note</DialogTitle>
      <DialogContent>
        <Input
          placeholder="Note name"
          value={inputValue}
          onChange={handleChange}
        />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </DialogContent>
      <DialogActions>
        <OutlinedButton type="button" onClick={handleClose}>
          Cancel
        </OutlinedButton>
        <ContainedButton
          type="submit"
          disabled={inputValue === "" || inputValue === note.name}
          onClick={handleSubmit}
        >
          Continue
        </ContainedButton>
      </DialogActions>
    </Dialog>
  );
};

export default RenameNoteDialog;

const Dialog = styled(MuiDialog)`
  user-select: none;

  ${Input} {
    margin-top: 12px;
    width: 400px;
  }

  .MuiDialogActions-root {
    margin-right: 12px;
  }
`;
