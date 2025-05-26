import React, { useState, useEffect } from 'react';
import { Brightness7, Brightness4 } from '@mui/icons-material';


const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Загружаем тему из localStorage при старте
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Переключение темы
  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Сохраняем тему в localStorage и применяем стиль
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark-theme', isDarkMode);
  }, [isDarkMode]);

  return (
    <button onClick={toggleTheme} style={themeToggleButtonStyle}>
      {isDarkMode ? <Brightness4 /> : <Brightness7 />}
      {/* size={20} */}
    </button>
  );
};

// Стили для кнопки переключения темы
const themeToggleButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px 12px',
  backgroundColor: '#1e3a8a',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '16px',
  gap: '8px',
  transition: "background 0.2s"
};

export default ThemeToggle;