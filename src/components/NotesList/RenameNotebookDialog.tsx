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
import { Note, Notebook } from "../../types";

interface RenameNotebookDialogProps {
  notebook: Notebook | null;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  renameNotebook: (
    id: string,
    newName: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => void;
}

const RenameNotebookDialog = ({
  notebook,
  open,
  setOpen,
  renameNotebook, // <-- исправлено здесь
}: RenameNotebookDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>(notebook?.name || "");

  // Закрытие диалога
  const handleClose = () => {
    setInputValue(notebook?.name || "");
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
    if (inputValue.trim() !== (notebook?.name || "")) {
      renameNotebook(
        notebook?.id || "",
        inputValue,
        handleClose,
        setErrorMessage
      );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Rename notebook</DialogTitle>
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
          disabled={inputValue === "" || inputValue === (notebook?.name || "")}
          onClick={handleSubmit}
        >
          Continue
        </ContainedButton>
      </DialogActions>
    </Dialog>
  );
};

export default RenameNotebookDialog;

const Dialog = styled(MuiDialog)`
  user-select: none;

  ${Input} {
    margin-top: 12px;
  }

  .MuiDialogActions-root {
    margin-right: 12px;
  }
`;
