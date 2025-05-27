import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Тип состояния ошибки
interface ErrorState {
  message: string | null;
}

const initialState: ErrorState = {
  message: null,
};

const errorSlice = createSlice({
  name: "error",
  initialState,
  reducers: {
    // Устанавливаем ошибку
    setError: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    // Сбрасываем ошибку
    resetError: (state) => {
      state.message = null;
    },
  },
});

// Экспортируем действия для использования в компонентах
export const { setError, resetError } = errorSlice.actions;

// Экспортируем редуктор для добавления в store
export default errorSlice.reducer;
