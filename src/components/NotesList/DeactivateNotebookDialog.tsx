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
      <DialogTitle>Deactivate notebook</DialogTitle>
      <DialogContent>
        Are you sure you want to deactivate the notebook <b>{notebook?.name}</b>
        ?{errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      </DialogContent>
      <DialogActions>
        <OutlinedButton type="button" onClick={handleClose}>
          Cancel
        </OutlinedButton>
        <ContainedButton type="button" onClick={handleDeactivate}>
          Confirm
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
