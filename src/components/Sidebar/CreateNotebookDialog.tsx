import React, { useState } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import styled from "styled-components";
import ContainedButton from "../Shared/ContainedButton";
import OutlinedButton from "../Shared/OutlinedButton";
import Input from "../Shared/Input";
import ErrorMessage from "../Shared/ErrorMessage";
import { useNotebooks } from "../../context/NotebookContext";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateNotebookDialog = ({ open, setOpen }: Props) => {
  const { addNotebook } = useNotebooks(); // Получаем функцию addNotebook из контекста

  const [errorMessage, setErrorMessage] = useState("");
  const [inputValue, setInputValue] = useState("");

  const handleClose = () => {
    setInputValue("");
    setErrorMessage("");
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Проверка на пустое имя книги или на наличие только пробелов
    if (!inputValue.trim()) {
      setErrorMessage("Please provide a name for the notebook.");
      return;
    }

    try {
      // Используем addNotebook из контекста
      await addNotebook(inputValue, inputValue); // Передаем имя и описание как inputValue
      setErrorMessage(""); // Очистить сообщение об ошибке при успешном добавлении
      handleClose(); // Закрыть форму после успешного добавления
    } catch (error) {
      // Обработка ошибки при добавлении книги
      setErrorMessage("An error occurred while creating the notebook.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Create new notebook</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Notebooks are useful for grouping notes around a common topic.
        </DialogContentText>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Notebook name"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

          <DialogActions>
            <OutlinedButton type="button" onClick={handleClose}>
              Cancel
            </OutlinedButton>
            <ContainedButton
              type="submit"
              disabled={inputValue === ""}
            >
              Create
            </ContainedButton>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNotebookDialog;

const Dialog = styled(MuiDialog)`
  user-select: none;

  ${Input} {
    margin-top: 12px;
    width: 100%;
  }

  .MuiDialogActions-root {
    margin-right: 12px;
  }
`;
