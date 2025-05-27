import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Tag } from "../types";

export const tagsReducer = createApi({
  reducerPath: "tagsReducer",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.BASE_URL || "" }), // Указываем базовый URL
  tagTypes: ["Tags"],
  endpoints: (builder) => ({
    // Получить тэг по ID
    getTag: builder.query<Tag, string>({
      query: (id) => ({ url: `/tags/${id}`, method: "GET" }),
      transformResponse: (response: any) => response.data || null,
      providesTags: ["Tags"],
    }),

    // Получить все тэги
    getTags: builder.query<Tag[], void>({
      query: () => ({ url: "/tags", method: "GET" }),
      transformResponse: (response: any) => response.data || [],
      providesTags: ["Tags"],
    }),

    // Создать новый тэг
    createTag: builder.mutation<Tag, Omit<Tag, "id">>({
      query: (tag) => ({
        url: "/tags",
        method: "POST",
        data: tag,
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Tags"],
    }),

    // Обновить тэг
    updateTag: builder.mutation<Tag, { id: string; tag: Omit<Tag, "id"> }>({
      query: ({ id, tag }) => ({
        url: `/tags/${id}`,
        method: "PUT",
        data: tag,
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Tags"],
    }),

    // Удалить тэг
    deleteTag: builder.mutation<number, string>({
      query: (id) => ({
        url: `/tags/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data || 0,
      invalidatesTags: ["Tags"],
    }),
  }),
});

export const {
  useGetTagQuery,
  useGetTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,
} = tagsReducer;
