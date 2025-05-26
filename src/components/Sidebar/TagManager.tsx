import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { DeleteOutline, Edit, Add } from "@mui/icons-material"; // Импортируем иконки из MUI
import { useTags } from "../../context/TagContext"; // Используем хук из TagContext
import { useNavigate } from "react-router-dom";

const TagManager = () => {
  const { tags, addTag, updateTag, removeTag, loading } = useTags(); // Получаем данные из контекста
  const [name, setName] = useState("");
  const [color, setColor] = useState("#007bff");

  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setErrorMessage("");
  };

  const callbackOnSuccess = () => {
    navigate("/");
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (editingId) {
      console.log("NAME:", tags);
      console.log("NAME:", editingId);
      updateTag(editingId, name, color); // Используем функцию из контекста для обновления тега
      setEditingId(null);
      setName("");
      setColor("#007bff");
    } else {
      addTag(name, color); // Используем функцию из контекста для добавления нового тега
      setName("");
      setColor("#007bff");
    }
  };

  const handleEdit = (tag: any) => {
    setEditingId(tag.id);
    setName(tag.name);
    setColor(tag.color);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ограничиваем количество символов
    if (e.target.value.length <= 10) {
      setName(e.target.value);
    }
  };

  useEffect(() => {
    // Это будет срабатывать при изменении списка тегов
    console.log("Tags updated:", tags);
  }, [tags]); // Следим за изменениями в tags

  return (
    <Wrapper>
      <Heading></Heading>

      <Form>
        <input
          type="text"
          placeholder="Tag name"
          value={name}
          onChange={handleChange}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
        <button onClick={handleSubmit}>
          <Add />
          {editingId ? "Update" : "Add"}
        </button>
      </Form>
      {/* Если данные загружаются, показываем индикатор загрузки */}
      <TagList>
        {Array.isArray(tags) && tags.length > 0 ? (
          tags.map((tag) => (
            <TagItem key={tag.id}>
              <ColorDot style={{ backgroundColor: tag.color }} />
              <span>{tag.name}</span>
              <IconGroup>
                {editingId !== tag.id && (
                  <Edit onClick={() => handleEdit(tag)} />
                )}
                {editingId !== tag.id && (
                  <DeleteOutline
                    onClick={() => {
                      console.log("Deleting tag:", tag);
                      removeTag(tag.id); // Используем функцию удаления из контекста
                    }}
                  />
                )}
              </IconGroup>
            </TagItem>
          ))
        ) : (
          <Form
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            No tags found
          </Form>
        )}
      </TagList>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 16px;
  margin-top: 20px;
  background-color: #314177;
  border-radius: 10px;
`;

const Heading = styled.h2`
  font-size: 18px;
  margin-bottom: 12px;
  @media (max-width: 600px) {
    font-size: 16px;
    margin-bottom: 10px;
  }
`;

const Form = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-direction: column; /* Сделаем форму вертикальной на маленьких экранах */

  input[type="text"] {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }

  input[type="text"] {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 16px;
    background-color: #f7f7f7;
    color: #333;
    transition: all 0.3s ease;
  }

  input[type="text"]:focus {
    border-color: #1e40af;
    background-color: rgb(245, 245, 245);
    box-shadow: 0 0 8px rgba(30, 64, 175, 0.2);
    outline: none;
  }

  input[type="text"]::placeholder {
    color: #aaa;
    font-style: Ubuntu;
  }

  button {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background-color: #1e40af;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    width: 100%; /* Кнопка на весь экран */

    &:hover {
      background-color: #1e3a8a;
    }
  }

  @media (max-width: 600px) {
    gap: 12px;
    padding: 8px;
  }
`;

const TagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 600px) {
    gap: 6px; /* Уменьшаем отступы на мобильных */
  }
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-size: 14px;

  span {
    flex: 1;
    margin-left: 10px;
  }

  @media (max-width: 600px) {
    font-size: 12px; /* Уменьшаем размер шрифта на мобильных */
    padding: 8px 12px; /* Делаем элементы чуть крупнее для мобильных */
  }
`;

const ColorDot = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 50%;
`;

const IconGroup = styled.div`
  display: flex;
  gap: 10px;
  font-size: 18px;
  color: #555;

  svg {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #1e40af;
    }
  }

  @media (max-width: 600px) {
    font-size: 16px; /* Уменьшаем размер иконок на мобильных */
    gap: 8px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  font-size: 18px;
  color: #888;
`;

export default TagManager;
