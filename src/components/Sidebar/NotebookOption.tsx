import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { flexCenter } from "../../styles/mixins";
import { Notebook } from "../../types";
import { UIContext } from "../../context/UIContext";
import { fetchNotesByNotebook } from "../../services/notesApi"; 
import { useNotebooks } from "../../context/NotebookContext";
import { useMainContext } from "../../context/NoteContext";

interface ContainerProps {
  $active: boolean;
}

interface ComponentProps extends ContainerProps {
  notebook: Notebook;
  onClick?: () => void; // Опциональный пропс onClick
}

const NotebookOption = ({ notebook, $active, onClick }: ComponentProps) => {
  const { toggleSidebar } = useContext(UIContext);
  const [noteCount, setNoteCount] = useState<number>(0); // Состояние для хранения количества заметок
  const { notes, setNotes } = useMainContext();

  const {
    notebooks,
    setNotebooks,
    setActiveNotebook, // Чтобы установить активный блокнот
    activeNotebook, // Делаем проверку, чтобы избежать лишних запросов
  } = useNotebooks();

  // Функция для получения заметок из блокнота
  const fetchNotesForNotebook = async (notebookId: string) => {
    try {
      const notes = await fetchNotesByNotebook(notebookId);
      if (Array.isArray(notes)) {
        setNoteCount(notes?.length); // Обновляем количество заметок
      }
    } catch (error) {
      console.error("Ошибка при загрузке данных:", error);
    }
  };

  useEffect(() => {
    fetchNotesForNotebook(notebook.id); // Загружаем заметки для блокнота
  }, notes);

  // Для изменения активного блокнота
  const handleClick = () => {
    toggleSidebar(); // Закрываем сайдбар
    setActiveNotebook(notebook.id); // Устанавливаем активный блокнот, передавая его id
    if (onClick) onClick(); // Если передан onClick, вызываем его
  };

  return (
    <Link
      to={`/`} // Переход на нужный путь
      onClick={handleClick} // Обработчик клика на блокнот
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
  border-radius: 10px;
  margin-bottom: 3px;
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
