import React, { useState, useEffect, useContext } from "react";
import { UIContext } from "../../context/UIContext";
import { fetchTrashNotes, fetchArchivedNotes } from "../../services/notesApi"; // Функции для получения заметок из корзины и архива
import styled from "styled-components";
import { Book } from "@mui/icons-material";
import { Note } from "../../types"; // Подключаем типы заметок

interface ContainerProps {
  $active: boolean;
}

interface ComponentProps extends ContainerProps {
  category: "archived" | "deleted"; // Выбираем категорию: архив или корзина
  onClick?: () => void;
}

const CategoryOption = ({ category, $active, onClick }: ComponentProps) => {
  const { toggleSidebar } = useContext(UIContext);
  const [noteCount, setNoteCount] = useState<number>(0); // Состояние для хранения количества заметок

  useEffect(() => {
    const fetchNoteCount = async () => {
      try {
        let notes: Note[] = [];
        if (category === "archived") {
          notes = await fetchArchivedNotes(); // Получаем архивированные заметки
        } else if (category === "deleted") {
          notes = await fetchTrashNotes(); // Получаем удаленные заметки
        }

        setNoteCount(notes.length); // Обновляем состояние с количеством заметок
      } catch (error) {
        console.error(`Ошибка при загрузке заметок для категории ${category}:`, error);
      }
    };

    fetchNoteCount();
  }, [category]); // Перезапускаем эффект при изменении категории

  return (
    <div onClick={() => {
      toggleSidebar();
      if (onClick) onClick();
    }}>
      <Container $active={$active}>
        <TextWrapper>
          {category === "archived" ? "Archive" : "Recently Deleted"} 
          <NoteCount>({noteCount})</NoteCount>
        </TextWrapper>
      </Container>
    </div>
  );
};

export default CategoryOption;

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
