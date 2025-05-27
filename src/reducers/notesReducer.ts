import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Note } from "../types/index";
import { axiosBaseQuery } from "./axiosBaseQuery"; // путь к твоему адаптеру

export const notesReducer = createApi({
  reducerPath: "notesReducer",
  baseQuery: axiosBaseQuery({ baseUrl: "http://localhost:8085/api/v1"}),
  tagTypes: ["Notes"],
  endpoints: (builder) => ({
    getNote: builder.query<Note, string>({
      query: (id) => ({ url: `/notes/${id}`, method: "GET" }),
      transformResponse: (response: any) => response.data || {},
      providesTags: ["Notes"],
    }),

    getNotes: builder.query<Note[], void>({
      query: () => ({ url: "/notes", method: "GET" }),
      transformResponse: (response: any) => response.data || [],
      providesTags: ["Notes"],
    }),

    getTrashNotes: builder.query<Note[], void>({
      query: () => ({ url: "/notes/trash", method: "GET" }),
      transformResponse: (response: any) => response.data || [],
      providesTags: ["Notes"],
    }),

    restoreNoteFromTrash: builder.mutation<Note, string>({
      query: (id) => ({
        url: `/notes/trash/${id}`,
        method: "PUT",
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Notes"],
    }),

    getNotesByNotebook: builder.query<Note[], string>({
      query: (notebookId) => ({
        url: `/notes/group/${notebookId}`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: ["Notes"],
    }),

    getNotesByTags: builder.query<Note[], string[]>({
      query: (tagIds) => ({
        url: "/notes/tag",
        method: "POST",
        data: { tags: tagIds },
      }),
      transformResponse: (response: any) => response.data || [],
      providesTags: ["Notes"],
    }),

    createNote: builder.mutation<Note, Omit<Note, "id" | "is_deleted">>({
      query: (note) => ({
        url: "/notes",
        method: "POST",
        data: { ...note, is_deleted: false },
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Notes"],
    }),

    updateNote: builder.mutation<Note, { id: string; note: Partial<Note> }>({
      query: ({ id, note }) => ({
        url: `/notes/${id}`,
        method: "PUT",
        data: note,
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Notes"],
    }),

    changeNoteNotebook: builder.mutation<
      Note,
      { id: string; notebook_id: string }
    >({
      query: ({ id, notebook_id }) => ({
        url: `/notes/notebook/${id}`,
        method: "PUT",
        data: { notebook_id },
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Notes"],
    }),

    addTagToNote: builder.mutation<Note, { noteId: string; tagId: string }>({
      query: ({ noteId, tagId }) => ({
        url: `/notes/tag/${noteId}`,
        method: "PUT",
        data: { tag_id: tagId },
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Notes"],
    }),

    removeTagFromNote: builder.mutation<
      Note,
      { noteId: string; tagId: string }
    >({
      query: ({ noteId, tagId }) => ({
        url: `/notes/tag/${noteId}`,
        method: "PATCH",
        data: { tag_id: tagId },
      }),
      transformResponse: (response: any) => response.data || {},
      invalidatesTags: ["Notes"],
    }),

    deleteNote: builder.mutation<number, string>({
      query: (id) => ({
        url: `/notes/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data || 0,
      invalidatesTags: ["Notes"],
    }),

    moveNoteToTrash: builder.mutation<number, string>({
      query: (id) => ({
        url: `/notes/trash/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response: any) => response.data || 0,
      invalidatesTags: ["Notes"],
    }),
  }),
});

export const {
  useGetNoteQuery,
  useGetNotesQuery,
  useGetTrashNotesQuery,
  useRestoreNoteFromTrashMutation,
  useGetNotesByNotebookQuery,
  useGetNotesByTagsQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useChangeNoteNotebookMutation,
  useAddTagToNoteMutation,
  useRemoveTagFromNoteMutation,
  useDeleteNoteMutation,
  useMoveNoteToTrashMutation,
} = notesReducer;
