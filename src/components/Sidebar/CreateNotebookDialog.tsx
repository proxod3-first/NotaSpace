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
import { useNotebooks } from "../../contexts/NotebookContext";
import { fetchNotebooks } from "../../services/notebooksApi";

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateNotebookDialog = ({ open, setOpen }: Props) => {
  const { addNotebook, setNotebooks } = useNotebooks(); // Получаем функцию addNotebook из контекста

  const [errorMessage, setErrorMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputValueDesc, setInputValueDesc] = useState("");

  const handleClose = () => {
    setInputValue("");
    setInputValueDesc("");
    setErrorMessage("");
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Проверка на пустое имя книги или на наличие только пробелов
    if (!inputValue.trim()) {
      setErrorMessage("Пожайлуйства, введите название книги");
      return;
    }

    try {
      console.log(inputValue);
      // Используем addNotebook из контекста
      await addNotebook(inputValue, inputValueDesc); // Передаем имя и описание как inputValue
      const notebooks = await fetchNotebooks();
      setNotebooks(notebooks);
      handleClose(); // Закрыть форму после успешного добавления
    } catch (error) {
      // Обработка ошибки при добавлении книги
      setErrorMessage("Ошибка при создании книги.");
    }
  };

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


  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Создание новой книги</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Книги полезны для группировки заметок по общей теме.{" "}
        </DialogContentText>
        <form onSubmit={handleSubmit}>
          <Input
            placeholder="Введите название"
            value={inputValue}
            onChange={handleChange}
          />
          <Input
            placeholder="Введите описание"
            value={inputValueDesc}
            onChange={handleChangeDesc}
          />
          {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

          <DialogActions>
            <OutlinedButton type="button" onClick={handleClose}>
              Назад
            </OutlinedButton>
            <ContainedButton type="submit" disabled={inputValue === ""}>
              Создать
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
