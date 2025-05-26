import React, { useContext, useEffect } from "react";
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
  tags: { id: string; name: string; color: string }[];
}

const NoteListItem = ({ note, $active, onClick, tags }: ComponentProps) => {
  const { toggleNoteList } = useContext(UIContext);

  const handleClick = () => {
    if (toggleNoteList) toggleNoteList();
    onClick(note.id);
  };

  useEffect(() => {
    // This effect runs whenever `tags` or `$active` prop changes
    console.log("Tags or active state has changed:", tags, $active);

    // Example: You could perform additional logic, like updating analytics, or saving data
    // For example, if note's active status changes, we can perform some action:
    if ($active) {
      console.log(`Note with id ${note.id} is active`);
    }
  }, [tags, $active]);

  return (
    <Container onClick={handleClick} $active={$active}>
      <Title>{note.name ? note.name : "Untitled"}</Title>
      <Content>{formatText(note.text)}</Content>
      <Tags>
        {tags.map((tag) => (
          <Tag key={tag.id} color={tag.color}>
            {tag.name}
          </Tag>
        ))}
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

const Container = styled.div<ContainerProps>`
  font-size: 15px;
  padding: 16px 20px;
  margin-bottom: 7px;
  height: auto;
  border-radius: 8px;
  background-color: ${({ $active }) => ($active ? "#f0f0f0" : "#ffffff")};
  border: 1px solid ${({ $active }) => ($active ? "#bbb" : "#ddd")};
  position: relative;
  box-shadow: ${({ $active }) =>
    $active ? "0 4px 8px rgba(0, 0, 0, 0.1)" : "0 2px 6px rgba(0, 0, 0, 0.1)"};
  transition: all 0.2s ease-in-out;

  &:hover {
    cursor: pointer;
    background-color: ${({ $active }) => (!$active ? "#fafafa" : "#d3d1d1")};
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:before {
    content: "";
    position: absolute;
    top: 23px;
    left: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ $active }) => ($active ? "#2ecc71" : "#e74c3c")};
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
  ${truncatedText}
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

const Tag = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
`;

const Timestamp = styled.div`
  color: rgb(98, 98, 98);
  font-size: 12px;
`;
