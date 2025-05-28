import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { Note } from "../../types";
import { truncatedText } from "../../styles/mixins";
import { UIContext } from "../../context/UIContext";
import AutoUpdatingTimeAgo from "./AutoUpdatingTimeAgo";
import { useMainContext } from "../../context/NoteContext";
import { ContainerProps } from "@mui/material";
import { getTag } from "../../services/tagsApi";
import { Tag } from "../../types/index";

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
    notebooks,
    setNotebooks,
    setLoading,
    deleteNoteApi,
    moveNote,
    archiveNote,
    restoreNote,
    permanentlyDeleteNote,
    archivedNotes,
    deletedNotes,
  } = useMainContext();

  const handleClick = () => {
    if (toggleNoteList) toggleNoteList();
    onClick(note.id);
  };

  return (
    <Container onClick={handleClick} $active={active}>
      <Title>{note.name ? note.name : "Untitled"}</Title>
      <Content>{formatText(note.text)}</Content>
      <Tags>
        {(() => {
          console.log("note.tags:", note.tags);
          console.log("tags prop:", tags);

          return (note.tags ?? []).map((tagId) => {
            const tagObj = tags.find((t) => t.id === tagId);
            console.log("→ tagId:", tagId, "→ tagObj:", tagObj);
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

const Container = styled.div<{ $active: boolean }>`
  font-size: 15px;
  padding: 16px 25px;
  margin-right: 10px;
  margin-bottom: 7px;
  height: auto;
  border-radius: 8px;
  background-color: ${({ $active }) => ($active ? "#f7f7f7" : "#f3f4f6;")};
  border: 1px solid ${({ $active }) => ($active ? "#bbb" : "#ddd")};
  position: relative;
  box-shadow: ${({ $active }) =>
    $active
      ? "0 4px 8px rgba(16, 16, 16, 0.4)"
      : "0 2px 6px rgba(0, 0, 0, 0.2)"};
  transition: all 0.2s ease-in-out;

  &:hover {
    cursor: pointer;
    background-color: ${({ $active }) => (!$active ? "#fafafa" : "#e0e8ff")};
    box-shadow: 0 6px 12px rgba(5, 5, 5, 0.3);
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

const Tagg = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  color: black;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
`;

const Timestamp = styled.div`
  color: rgb(98, 98, 98);
  font-size: 12px;
`;
