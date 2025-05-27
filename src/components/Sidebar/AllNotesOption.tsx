import React, { useContext } from "react";
import { UIContext } from "../../context/UIContext"; // Контекст для управления боковой панелью
import { Link } from "react-router-dom"; // Для навигации между страницами
// Экспортируешь стили, как у тебя в коде

interface AllNotesOptionProps {
  $active: boolean;
}

const AllNotesOption = ({ $active }: AllNotesOptionProps) => {
  const { toggleSidebar } = useContext(UIContext); // Получаем функцию toggleSidebar

  return (
    <Link to="/" onClick={toggleSidebar}>
      All Notes
    </Link>
  );
};

export default AllNotesOption;
