import React, { useContext } from "react";
import styled from "styled-components";
import { Note } from "../../types";
import { truncatedText } from "../../styles/mixins";
import { UIContext } from "../../context/UIContext";
import AutoUpdatingTimeAgo from "./AutoUpdatingTimeAgo";

interface ContainerProps {
  $active: boolean;
}

interface ComponentProps {
  note: Note;
  $active: boolean;
  onClick: (noteId: string) => void;
}

const NoteListItem = ({ note, $active, onClick }: ComponentProps) => {
  const { toggleNoteList } = useContext(UIContext);

  const handleClick = () => {
    if (toggleNoteList) toggleNoteList();
    onClick(note.id);
  };

  return (
    <Container onClick={handleClick} $active={$active}>
      <Title>{note.name ? note.name : "Untitled"}</Title>
      <Content>{formatText(note.text)}</Content>
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

const Container = styled.div<ContainerProps>`
  font-size: 15px;
  padding: 12px;
  height: auto;
  border-bottom: 1px solid var(--border-color);
  background-color: ${({ $active }) => $active && "#d3d1d1"};
  position: relative;

  &:hover {
    cursor: pointer;
    background-color: ${({ $active }) => !$active && "#ececec"};
  }
`;

const Title = styled.div`
  font-weight: 500;
  color: #282a2c;
  margin-bottom: 8px;
  ${truncatedText}
`;

const Content = styled.div`
  color: #828384;
  margin-bottom: 10px;
  min-height: 18px;

  display: -webkit-box;
  -webkit-line-clamp: 3; /* Ограничение до 3 строк */
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: normal;
  word-wrap: break-word;

  text-overflow: clip;
  -webkit-text-overflow: clip;
`;

const Timestamp = styled.div`
  color: #828384;
  font-size: 12px;
`;
