import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { flexCenter } from "../../styles/mixins";
import { Notebook } from "../../types";
import { UIContext } from "../../context/UIContext";
import { fetchNotesByNotebook } from "../../services/notesApi"; // Добавляем функцию для получения заметок по блокноту
import { useNotebooks } from "../../context/NotebookContext";
import { fetchNotebooks } from "../../services/notebooksApi";

interface ContainerProps {
  $active: boolean;
}
// TODO: Добавить логику для Trash и Archive (что можно и нельзя) и переименовать компонент

interface ComponentProps extends ContainerProps {
  notebook: Notebook;
  onClick?: () => void; // Мы добавляем опциональный пропс onClick
}

const NotebookOption = ({ notebook, $active, onClick }: ComponentProps) => {
  const { toggleSidebar } = useContext(UIContext);
  const [noteCount, setNoteCount] = useState<number>(0); // Состояние для хранения количества заметок
  const {
    notebooks,
    setNotebooks,
    setActiveNotebook,
    activeNotebook,
    addNotebook,
  } = useNotebooks();


  // TODO: activeNotebook: 6 вместо объекта Notebook, error
  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (activeNotebook?.id == null) {
          const fetchedNotebooks = await fetchNotebooks();
          setNotebooks(fetchedNotebooks);
        }

        // После этого — грузим заметки для notebook.id
        console.log("notebook: ", notebooks);
        const notes = await fetchNotesByNotebook(notebook.id);
        if (notes.length !== 0) {
          setNoteCount(notes.length );
        }
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchAll();
  }, [notebook.id]); // Перезапускаем эффект при изменении блока

  return (
    <Link
      to={`/`}
      onClick={() => {
        toggleSidebar();
        if (onClick) onClick();
      }}
    >
      <Container $active={$active}>
        <TextWrapper>
          {notebook.name} <NoteCount>({noteCount})</NoteCount>{" "}
          {/* Показываем количество заметок */}
        </TextWrapper>
      </Container>
    </Link>
  );
};

export default NotebookOption;

const Container = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 16px;
  height: 36px;
  color: var(--sidebar-text-normal);
  padding-left: 43px;
  ${({ $active }) =>
    $active && "background-color: var(--sidebar-background-active);"}

  &:hover {
    cursor: pointer;
    background-color: ${({ $active }) =>
      $active
        ? "var(--sidebar-background-active)"
        : "var(--sidebar-background-hover)"};
  }

  & > svg {
    ${flexCenter}
    font-size: 20px;
  }
`;

const TextWrapper = styled.span`
  font-size: 15px;
  display: flex;
  align-items: center;
`;

const NoteCount = styled.span`
  font-size: 12px;
  color: var(--sidebar-text-muted);
  margin-left: 8px;
  font-weight: 600;
`;
