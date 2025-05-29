import React, { useState, useEffect } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import styled from "styled-components";
import OutlinedButton from "../Shared/OutlinedButton";
import ContainedButton from "../Shared/ContainedButton";
import ErrorMessage from "../Shared/ErrorMessage";
import { Note } from "../../types";

interface DialogProps {
  note: Note;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notebookIds: string[]; // Массив ID блокнотов
  notebooks: { [key: string]: { name: string } }; // Записи блокнотов
  onMove: (
    noteId: string,
    targetNotebookId: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => void;
}

const defaultValue = "Choose a location...";

const MoveNoteDialog = ({
  note,
  open,
  setOpen,
  notebookIds,
  notebooks,
  onMove,
}: DialogProps) => {
  const [targetNotebookId, setTargetNotebookId] =
    useState<string>(defaultValue);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Сброс состояния при открытии диалога
  useEffect(() => {
    if (open) {
      setTargetNotebookId(defaultValue);
      setErrorMessage("");
    }
  }, [open]);

  const handleClose = () => {
    setErrorMessage("");
    setOpen(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTargetNotebookId(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (targetNotebookId === defaultValue) {
      setErrorMessage("Please select a valid notebook.");
      return;
    }

    // Проверка на выбор текущего блокнота
    if (targetNotebookId === note.notebook_id) {
      setErrorMessage("You cannot move the note to the same notebook.");
      return;
    }

    onMove(
      note.id, // Тип id — string
      targetNotebookId, // Тип targetNotebookId — string
      handleClose,
      setErrorMessage
    );
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Move note</DialogTitle>
      <DialogContent>
        <Select id="notebook" value={targetNotebookId} onChange={handleChange}>
          <option value={defaultValue} disabled>
            Choose a location...
          </option>
          {notebookIds.map((id) => (
            <option key={id} value={id} disabled={id === note.notebook_id}>
              {notebooks[id]?.name || "Unnamed Notebook"}
            </option>
          ))}
        </Select>
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </DialogContent>
      <DialogActions>
        <OutlinedButton type="button" onClick={handleClose}>
          Cancel
        </OutlinedButton>
        <ContainedButton
          type="submit"
          onClick={handleSubmit}
          disabled={
            targetNotebookId === defaultValue ||
            targetNotebookId === note.notebook_id
          }
        >
          Move
        </ContainedButton>
      </DialogActions>
    </Dialog>
  );
};

export default MoveNoteDialog;

const Dialog = styled(MuiDialog)`
  user-select: none;

  .MuiDialogActions-root {
    margin-right: 12px;
  }
`;

const Select = styled.select`
  width: 250px; /* Увеличим ширину для лучшего отображения длинных имен блокнотов */
  height: 40px; /* Увеличим высоту, чтобы лучше смотрелось */
  margin-top: 6px;
  margin-bottom: 12px;
  padding: 12px 8px 10px 12px;
  background-color: var(--notelist-background);
  border: 1px solid var(--notelist-background);
  color: var(--text-normal);
  font-size: 14px;
  font-family: "Arial", sans-serif;
  border-radius: 5px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  cursor: pointer;

  /* Добавим плавную анимацию для переходов */
  transition: all 0.3s ease;

  /* Прокрутка при большом списке */
  max-height: 300px; /* Ограничим высоту, чтобы добавить прокрутку */
  overflow-y: auto; /* Появится вертикальная прокрутка, если элементов слишком много */

  /* Стиль фокуса */
  &:focus {
    outline: none;
    box-shadow: 0 0 5px 3px rgba(0, 123, 255, 0.5); /* Тень для фокуса */
  }

  /* Стрелка вниз */
  background-image: linear-gradient(135deg, transparent 50%, gray 50%),
    linear-gradient(45deg, gray 50%, transparent 50%);
  background-position: calc(100% - 20px) center, calc(100% - 15px) center;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;

  /* Элементы option */
  option {
    padding: 10px;
    font-size: 14px;
    background-color: var(--notelist-background);
    color: var(--text-normal);

    /* Изменения цвета при наведении */
    &:hover {
      background-color: var(--highlight-color);
      color: white;
    }

    /* Цвет текста при фокусе */
    &:focus {
      background-color: var(--highlight-color);
      color: white;
    }

    /* Стили для деактивированных опций */
    &:disabled {
      background-color: lightgray;
      color: darkgray;
    }
  }

  /* Стилизация для старых браузеров */
  &:-moz-focusring {
    color: transparent;
    text-shadow: 0 0 0 #000;
  }
`;
