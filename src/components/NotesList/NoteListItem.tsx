import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Note } from "../../types";
import { truncatedText } from "../../styles/mixins";
import { UIContext } from "../../contexts/UIContext";
import AutoUpdatingTimeAgo from "./AutoUpdatingTimeAgo";
import { useMainContext } from "../../contexts/NoteContext";
import { ContainerProps } from "@mui/material";
import { getTag } from "../../services/tagsApi";
import { Tag } from "../../types/index";
import { useNotebooks } from "../../contexts/NotebookContext";

interface ComponentProps {
  note: Note;
  onClick: (noteId: string) => void;
  tags: { id: string; name: string; color: string }[];
  active: boolean; // новый проп для активности
}

const NoteListItem = ({ note, tags, onClick, active }: ComponentProps) => {
  const { toggleNoteList } = useContext(UIContext);

  const {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    setActiveNoteId,
    setLoading,
    deleteNoteApi,
  } = useMainContext();

  const { notebooks, activeNotebook } = useNotebooks();

  const handleClick = () => {
    if (toggleNoteList) toggleNoteList();
    onClick(note.id);
  };

  const getPriorityLabel = (order: number): string => {
    switch (order) {
      case 4:
        return "Высокий";
      case 3:
        return "Средний";
      case 2:
        return "Низкий";
      case 1:
        return "Нет приоритета";
      default:
        return "Нет приоритета"; // На случай, если порядок не соответствует одному из известных значений
    }
  };

  const notebook = notebooks?.find((nb) => nb.id === note.notebook_id);
  console.log("NOTEBOOK in NoteListItem: ", notebook);

  return (
    <Container onClick={handleClick} $active={active} $bgColor={note.color}>
      <Title>
        {note.name ? note.name : " "}
        <NotebookTitleNote>
          {notebook && activeNotebook?.id !== notebook.id
            ? ` | ${notebook.name} `
            : ""}
        </NotebookTitleNote>
        <OrderNoteField order={note.order}>
          {note.order >= 2 ? getPriorityLabel(note.order) : ""}
        </OrderNoteField>
      </Title>

      <Content>{formatText(note.text)}</Content>
      <Tags>
        {(() => {
          console.log("note.tags:", note.tags);
          console.log("tags prop:", tags);

          return (note.tags ?? []).map((tagId) => {
            const tagObj = tags?.find((t) => t.id === tagId);
            console.log("tagId:", tagId, "tagObj:", tagObj);
            if (!tagObj) return null;

            return (
              <Tagg key={tagId} color={tagObj.color}>
                {tagObj.name}
              </Tagg>
            );
          });
        })()}
      </Tags>
      <AutoUpdatingTimeAgo date={new Date(Date.now() - 60000)} />
    </Container>
  );
};

export default NoteListItem;

const formatText = (text: string) => {
  if (!text) return null;

  return text.split("\n").map((line, index) => (
    <span key={index}>
      {line}
      <br />
    </span>
  ));
};

const Container = styled.div<{ $active: boolean; $bgColor: string }>`
  font-size: 15px;
  padding: 16px 25px;
  margin-right: 5px;
  margin-bottom: 10px;
  height: auto;
  border-radius: 8px;
  background-color: ${({ $active, $bgColor }) =>
    $active
      ? "#e4f0f9"
      : $bgColor}; /* Мягкий голубой для активного, светло-серый для неактивного */
  border: 1px solid ${({ $active }) => ($active ? "#a3c4d7" : "#d1d9e6")}; /* Легкий серо-голубой для активного, светло-серый для неактивного */
  position: relative;
  box-shadow: ${({ $active }) =>
    $active
      ? "0 4px 8px rgba(100, 150, 200, 0.1)" /* Мягкая тень для активного */
      : "0 2px 6px rgba(0, 0, 0, 0.1)"}; /* Легкая тень для неактивного */
  transition: all 0.2s ease-in-out;

  &:hover {
    cursor: pointer;
    background-color: ${({ $active, $bgColor }) =>
      !$active
        ? "#f0f4f8"
        : $bgColor || "#d1e3f0"}; /* Плавный переход для фона при наведении */
    box-shadow: 0 4px 8px rgba(50, 100, 150, 0.2); /* Мягкая тень при наведении */
  }

  &:before {
    content: ""; /* Обязательно для псевдоэлемента */
    position: absolute;
    top: 23px;
    left: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ $active }) =>
      $active
        ? "#8BC34A"
        : "#FF7043"}; /* Зеленый для активного, оранжевый для неактивного */
    transition: background-color 0.3s ease;
  }

  &:first-child {
    margin-top: -14px;
  }

  &:last-child {
    margin-bottom: -14px;
  }
`;

const Title = styled.div`
  font-weight: 500;
  color: #282a2c;
  margin-bottom: 8px;
  display: flex; /* Используем flex для выравнивания элементов */
  flex-wrap: wrap; /* Разрешаем перенос элементов на новую строку */
  align-items: center; /* Центрируем элементы по вертикали */
  gap: 8px; /* Отступы между элементами */
`;

const Content = styled.div`
  color: #828384;
  margin-bottom: 10px;
  min-height: 18px;

  display: -webkit-box;
  -webkit-line-clamp: 4; /* Ограничение до 4 строк */
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;

  text-overflow: clip;
  -webkit-text-overflow: clip;
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tagg = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  color: black;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
`;

const NotebookTitleNote = styled.span`
  font-size: 14px;
  color: gray;
  flex-shrink: 0; /* Не позволяем сжиматься */
`;

const getPriorityColor = (order: any) => {
  switch (order) {
    case 4:
      return "#ef4444";
    case 3:
      return "#3b82f6";
    case 2:
      return "#8378ff";
    case 1:
      return "transparent"; // Прозрачный для 0 и 1
    default:
      return "transparent"; // Прозрачный по умолчанию
  }
};

interface OrderNoteFieldProps {
  order: number;
}

const OrderNoteField = styled.span<OrderNoteFieldProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  min-width: 40px;
  padding: 0 12px;
  border-radius: 9999px;
  background-color: ${({ order }) => getPriorityColor(order)};
  color: white;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  user-select: none;
  cursor: default;
  transition: background-color 0.3s ease;
  &:hover {
    filter: brightness(1.1);
  }
  /* Скрыть элемент, если цвет фона прозрачный */
  ${({ order }) => (order === 0 || order === 1 ? "display: none;" : "")}
`;
