import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { DeleteOutline, Edit, Add } from "@mui/icons-material"; // Импортируем иконки из MUI
import { useTags } from "../../contexts/TagContext"; // Используем хук из TagContext
import { useNavigate } from "react-router-dom";
import { useMainContext } from "../../contexts/NoteContext";
import AddBoxIcon from "@mui/icons-material/AddBox";
import {
  addTagToNote,
  fetchNotes,
  getNote,
  removeTagFromNote,
  updateNote,
} from "../../services/notesApi";
import { Tag } from "../../types";
import { fetchTags } from "../../services/tagsApi";

const TagManager = () => {
  const { tags, setTags, addTag, updateTag, removeTag, loading } = useTags(); // Получаем данные из контекста
  const { notes, setNotes, activeNote, setActiveNote } = useMainContext();

  const [name, setName] = useState("");
  const [color, setColor] = useState("#ff6347");

  const [editingId, setEditingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setErrorMessage("");
  };

  const callbackOnSuccess = () => {
    navigate("/");
  };

  useEffect(() => {
    async function fetchInitialData() {
      const [allNotes, allTags] = await Promise.all([
        fetchNotes(),
        fetchTags(),
      ]);
      setNotes(allNotes);
      setTags(allTags);
    }

    fetchInitialData();
  }, [name, color]);

  const handleSubmit = async () => {
    if (!name.trim()) return;

    const existingTags = await fetchTags(); // Предполагаем, что у вас есть функция для получения всех тегов
    const tagExists = existingTags.some((tag) => tag.name === name.trim());
    if (tagExists) {
      // console.log("Tag with this name already exists.");
      return; // Если тег с таким именем уже существует и мы не редактируем, выходим
    }

    if (editingId) {
      // console.log("NAME1:", tags);
      // console.log("NAME2:", editingId);
      await updateTag(editingId, name, color); // Используем функцию из контекста для обновления тега
      // Обновляем заметку с сервера
      if (activeNote) {
        const updatedFromServer = await getNote(activeNote.id);
        setActiveNote(updatedFromServer);
      }
      setEditingId(null);
      setName("");
      setColor("#ff6347");
    } else {
      await addTag(name, color); // Используем функцию из контекста для добавления нового тега
      setName("");
      setColor("#ff6347");
    }
  };

  const handleAdd = async (tag: Tag) => {
    if (!activeNote) return;

    const noteTagIds = activeNote.tags || [];

    if (noteTagIds?.includes(tag.id)) {
      // console.log("Tag already added to active note.");
      return;
    }

    await addTagToNote(activeNote.id, tag.id);

    const updatedFromServer = await getNote(activeNote.id);
    // console.log("NOOTES1: ", updatedFromServer);

    setActiveNote(updatedFromServer);

    const allNotes = await fetchNotes();
    setNotes(allNotes);

    // console.log("NOOTES2: ", allNotes);
  };

  const handleEdit = async (tag: any) => {
    setEditingId(tag.id);
    setName(tag.name);
    setColor(tag.color);
  };

  const handleDelete = async (tag: Tag) => {
    if (!activeNote) return;
    const noteTagIds = activeNote.tags || [];
    // Только если тег присутствует у заметки — удаляем его
    if (noteTagIds?.includes(tag.id)) {
      await removeTagFromNote(activeNote.id, tag.id);
    }
    // Удаляем тег из контекста сразу (локально)
    removeTag(tag.id);
    // Обновляем данные заметки с сервера
    const updatedFromServer = await getNote(activeNote.id);
    setActiveNote(updatedFromServer);
    // Обновляем весь список заметок
    const allNotes = await fetchNotes();
    setNotes(allNotes);
    // Сброс данных формы
    setEditingId(null);
    setName("");
    setColor("#ff6347");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ограничиваем количество символов
    if (e.target.value?.length <= 20) {
      setName(e.target.value);
    }
  };

  return (
    <Wrapper>
      <Heading></Heading>

      <Form>
        <input
          type="text"
          placeholder="Введите тег"
          value={name}
          onChange={handleChange}
        />

        <ColorAndButtonWrapper>
          <ColorPicker
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <StyledButton onClick={handleSubmit}>
            <Add />
            {editingId ? "Обновить" : "Добавить"}
          </StyledButton>
        </ColorAndButtonWrapper>
      </Form>
      {/* Если данные загружаются, показываем индикатор загрузки */}
      <TagListContainer>
        <TagList>
          {Array.isArray(tags) && tags?.length > 0 ? (
            tags?.map((tag) => (
              <TagItem key={tag.id} style={{ backgroundColor: tag.color }}>
                <TagItemContent>
                  {/* <ColorDot style={{ backgroundColor: tag.color }} /> */}
                  <span>{tag.name}</span>
                </TagItemContent>
                <IconGroup>
                  {tag.id && <AddBoxIcon onClick={() => handleAdd(tag)} />}
                  {editingId !== tag.id && (
                    <Edit onClick={() => handleEdit(tag)} />
                  )}
                  {editingId !== tag.id && (
                    <DeleteOutline onClick={() => handleDelete(tag)} />
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
              <></>
              {/* No found tags */}
            </Form>
          )}
        </TagList>
      </TagListContainer>
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
  @media (max-width: 480px) {
    font-size: 16px;
    margin-bottom: 10px;
  }
`;

const ColorAndButtonWrapper = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
`;

const ColorPicker = styled.input`
  width: 30px;
  height: 30px;
  border: none;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background: none;

  &::-webkit-color-swatch-wrapper {
    padding: 0;
    border: none;
    background: none;
  }
  &::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
    background: none;
  }
  &::-moz-color-swatch {
    border: none;
    border-radius: 50%;
    background: none;
  }

  /* Убираем фокусные обводки */
  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

const StyledButton = styled.button`
  flex: 1; /* занимает всё оставшееся место */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background-color: #1e40af;
  color: #f3f4f6;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  height: 30px;

  &:hover {
    background-color: #1e3a8a;
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
    color: #f3f4f6;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    width: 100%; /* Кнопка на весь экран */

    &:hover {
      background-color: #1e3a8a;
    }
  }

  @media (max-width: 480px) {
    gap: 12px;
    padding: 8px;
  }
`;

const TagListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TagList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 480px) {
    gap: 6px; /* Уменьшаем отступы на мобильных */
  }
`;

const TagItem = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  padding: 6px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-size: 14px;

  span {
    flex: 1;
  }

  @media (max-width: 480px) {
    font-size: 12px; /* Уменьшаем размер шрифта на мобильных */
    padding: 8px 12px; /* Делаем элементы чуть крупнее для мобильных */
  }
`;

// const ColorDot = styled.div`
//   width: 14px;
//   height: 14px;
//   border-radius: 50%;
// `;

const TagItemContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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

  @media (max-width: 480px) {
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
