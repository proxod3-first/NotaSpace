import React, { useEffect, useState } from "react";
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
import { changeNoteNotebook } from "../../services/notesApi";
import { fetchNotebooks } from "../../services/notebooksApi";
import { useNotebooks } from "../../contexts/NotebookContext";
import { Close } from "@mui/icons-material";

interface RenameNotebookDialogProps {
  notebook: Notebook | null;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  renameNotebook: (
    id: string,
    newName: string,
    newDesc: string,
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
  const { notebooks, setNotebooks } = useNotebooks();
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>(notebook?.name || "");

  const [inputValueDesc, setInputValueDesc] = useState<string>(
    notebook?.description || ""
  );

  // Закрытие диалога
  const handleClose = () => {
    // setInputValue(notebook?.name || "");
    // setInputValueDesc(notebook?.description || "");
    setErrorMessage("");
    setOpen(false);
  };

  // Обработчик изменения значения ввода
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value?.length <= 15) {
      setInputValue(event.target.value);
    }
  };

  const handleChangeDesc = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value?.length <= 15) {
      setInputValueDesc(event.target.value);
    }
  };

  // Обработчик отправки формы
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      inputValue.trim() !== (notebook?.name || "") ||
      inputValueDesc.trim() !== (notebook?.description || "")
    ) {
      renameNotebook(
        notebook?.id || "",
        inputValue,
        inputValueDesc,
        handleClose,
        setErrorMessage
      );
    }
  };

  useEffect(() => {
    if (notebook && open) {
      setInputValue(notebook.name);
      setInputValueDesc(notebook.description || "");
      setErrorMessage("");
    }
  }, [notebook, open]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Переименование книги</DialogTitle>
      <DialogContent
        style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
      >
        <Input
          placeholder="Название книги"
          value={inputValue}
          onChange={handleChange}
        />

        <Input
          placeholder="Описание"
          value={inputValueDesc}
          onChange={handleChangeDesc}
        />
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </DialogContent>
      <DialogActions>
        <OutlinedButton type="button" onClick={handleClose}>
          Назад
        </OutlinedButton>
        <ContainedButton
          type="submit"
          disabled={
            (inputValue === "" || inputValue === (notebook?.name || "")) &&
            (inputValueDesc === "" ||
              inputValueDesc === (notebook?.description || ""))
          }
          onClick={handleSubmit}
        >
          Продолжить
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
