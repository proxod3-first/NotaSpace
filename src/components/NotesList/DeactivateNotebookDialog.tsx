import React, { useState } from "react";
import MuiDialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import styled from "styled-components";
import ContainedButton from "../Shared/ContainedButton";
import OutlinedButton from "../Shared/OutlinedButton";
import ErrorMessage from "../Shared/ErrorMessage";
import { Note, Notebook } from "../../types";

interface DeactivateNotebookDialogProps {
  notebook: Notebook | null;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  deactivateNotebook: (
    // <-- исправлено
    id: string,
    onSuccess: () => void,
    onError: (error: string) => void
  ) => void;
}
const DeactivateNotebookDialog = ({
  notebook,
  open,
  setOpen,
  deactivateNotebook, // <-- исправлено
}: DeactivateNotebookDialogProps) => {
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleClose = () => {
    setErrorMessage("");
    setOpen(false);
  };

  const handleDeactivate = () => {
    deactivateNotebook(notebook?.id || "", handleClose, setErrorMessage);
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Перемещение в архив</DialogTitle>
      <DialogContent>
        Все заметки <b>{notebook?.name}</b> переместить в архив?
        {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </DialogContent>
      <DialogActions>
        <OutlinedButton type="button" onClick={handleClose}>
          Назад
        </OutlinedButton>
        <ContainedButton type="button" onClick={handleDeactivate}>
          Подтвердить
        </ContainedButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeactivateNotebookDialog;

const Dialog = styled(MuiDialog)`
  user-select: none;

  .MuiDialogContent-root {
    margin-top: 12px;
  }

  .MuiDialogActions-root {
    margin-right: 12px;
  }
`;
