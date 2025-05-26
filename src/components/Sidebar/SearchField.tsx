import React, { useState } from "react";
import styled from "styled-components";
import { Search } from "@mui/icons-material"; // Импортируем иконки из MUI

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: var(--sidebar-background-hover);
  border-radius: 8px;
  padding: 6px 12px;
  width: 100%;
  box-sizing: border-box;
  margin: 12px 0;
  cursor: text; /* Добавлен курсор ввода текста */

  &:focus-within {
    background-color: var(--sidebar-background-active);
  }
`;

const SearchIcon = styled(Search)`
  font-size: 20px;
  color: var(--sidebar-text-muted);
  flex-shrink: 0;
  cursor: inherit; /* Наследовать курсор от родителя */
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--sidebar-text-normal);
  font-size: 15px;
  margin-left: 10px;
  caret-color: rgb(165, 188, 222);
  cursor: text;

  &::placeholder {
    color: var(--sidebar-text-muted);
  }
`;

export default function SearchField({
  onChange,
}: {
  onChange: (val: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    onChange(e.target.value);
  };

  return (
    <SearchWrapper>
      <SearchIcon />
      <SearchInput
        type="text"
        placeholder="Search notebooks, tags..."
        value={value}
        onChange={handleChange}
        spellCheck={false}
      />
    </SearchWrapper>
  );
}
