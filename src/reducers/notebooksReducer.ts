import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Notebook } from "../types";

export const notebooksReducer = createApi({
  reducerPath: "notebooksReducer",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.BASE_URL || "" }), // Указываем базовый URL
  tagTypes: ["Notebooks"],
  endpoints: (builder) => ({
    // Получить книгу по ID
    getNotebook: builder.query<Notebook, string>({
      query: (id) => ({ url: `/notebooks/${id}`, method: "GET" }),
      transformResponse: (response: any) => response.data || {},
      providesTags: ["Notebooks"],
    }),

    // Получить все книги
    getNotebooks: builder.query<Notebook[], void>({
      query: () => ({ url: "/notebooks", method: "GET" }),
      transformResponse: (response: any) => response.data || [],
      providesTags: ["Notebooks"],
    }),

    // Создать книгу
    createNotebook: builder.mutation<Notebook, Omit<Notebook, "id">>({
      query: (notebook) => ({
        url: "/notebooks",
        method: "POST",
        data: notebook,
      }),
      transformResponse: (response: any) => response.data[0] || {},
      invalidatesTags: ["Notebooks"],
    }),

    // Обновить книгу
    updateNotebook: builder.mutation<
      Notebook,
      { id: string; notebook: Omit<Notebook, "id"> }
    >({
      query: ({ id, notebook }) => ({
        url: `/notebooks/${id}`,
        method: "PUT",
        data: notebook,
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Notebooks"],
    }),

    // Удалить книгу
    deleteNotebook: builder.mutation<number, string>({
      query: (id) => ({
        url: `/notebooks/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data || 0,
      invalidatesTags: ["Notebooks"],
    }),
  }),
});

export const {
  useGetNotebookQuery,
  useGetNotebooksQuery,
  useCreateNotebookMutation,
  useUpdateNotebookMutation,
  useDeleteNotebookMutation,
} = notebooksReducer;
