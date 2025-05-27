import { configureStore } from "@reduxjs/toolkit";
import { notesReducer } from "../reducers/notesReducer"; // Путь к вашему API для заметок
import { tagsReducer } from "../reducers/tagsReducer"; // Если у вас еще есть API для тегов
import { notebooksReducer } from "../reducers/notebooksReducer"; // Если у вас еще есть API для ноутбуков

export const store = configureStore({
  reducer: {
    // Подключаем RTK Query API редьюсеры
    [notesReducer.reducerPath]: notesReducer.reducer,
    [tagsReducer.reducerPath]: tagsReducer.reducer,
    [notebooksReducer.reducerPath]: notebooksReducer.reducer,
  },
  devTools: process.env.NODE_ENV !== "production", // Включаем devTools только в режиме разработки
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(notesReducer.middleware) // Подключаем middleware для API заметок
      .concat(tagsReducer.middleware) // Подключаем middleware для API тегов, если нужно
      .concat(notebooksReducer.middleware), // Подключаем middleware для API ноутбуков, если нужно
});

// Типы для получения состояния и dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
