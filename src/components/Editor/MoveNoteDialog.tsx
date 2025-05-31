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
  notebookIds: string[];
  notebooks: { [key: string]: { name: string } };
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
      <DialogTitle>Переместить заметку</DialogTitle>
      <DialogContent>
        <Select id="notebook" value={targetNotebookId} onChange={handleChange}>
          <option value={defaultValue} disabled>
            Выберите назначение...
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
          Назад
        </OutlinedButton>
        <ContainedButton
          type="submit"
          onClick={handleSubmit}
          disabled={
            targetNotebookId === defaultValue ||
            targetNotebookId === note.notebook_id
          }
        >
          Перенести
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
  width: 250px;
  height: 40px;
  margin-top: 6px;
  margin-bottom: 12px;
  padding: 12px 8px 10px 12px;
  background-color: var(--notelist-background);
  border: 1px solid var(--notelist-background);
  color: var(--text-normal);
  font-size: 14px;
  font-family: "Arial", sans-serif;
  border-radius: 5px;
  appearance: none;
  cursor: pointer;
  transition: all 0.3s ease;
  max-height: 300px;
  overflow-y: auto;

  &:focus {
    outline: none;
    box-shadow: 0 0 5px 3px rgba(38, 143, 255, 0.64);
  }

  /* Стрелка вниз */
  background-image: linear-gradient(135deg, transparent 50%, gray 50%),
    linear-gradient(45deg, gray 50%, transparent 50%);
  background-position: calc(100% - 20px) center, calc(100% - 15px) center;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;

  option {
    padding: 10px;
    font-size: 14px;
    background-color: var(--notelist-background);
    color: var(--text-normal);
    cursor: pointer;

    &:hover {
      background-color: var(--highlight-color);
      color: white;
    }

    &:focus {
      background-color: var(--highlight-color);
      color: white;
    }

    /* Стили для disabled */
    &:disabled {
      background-color: var(--notelist-background);
      color: lightgray;
      font-style: italic;
      cursor: not-allowed;
    }
  }
`;
