// src/services/apiService.ts (Contoh, atau tambahkan ke api.ts)
import api from "./api"; // Instance Axios utama
import { Category } from "../types/category";
import { Note } from "../types/note";
import { Task, TaskStatus, TaskSummary } from "../types/task";
import { User } from "../types/user";

// --- Auth ---
export const loginUser = (data: any) =>
  api.post<{ access_token: string }>("/auth/login", data);
export const registerUser = (data: any) =>
  api.post<{ access_token: string }>("/auth/register", data);

// --- Users ---
export const getUserProfile = () => api.get<User>("/users/me");
export const updateUserProfile = (data: any) =>
  api.put<User>("/users/me", data);

// --- Tasks ---
// (Gunakan URLSearchParams untuk query params GET)
export const getTasks = (params?: {
  status?: TaskStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}) => {
  // Sertakan relasi Category agar data kategori ikut terkirim (jika backend mendukung)
  // Sesuaikan backend jika perlu: find( { ..., relations: ['category'] } )
  const queryParams = new URLSearchParams({
    includeCategory: "true",
    ...params,
  } as any);
  return api.get<Task[]>(`/tasks?${queryParams.toString()}`);
};
export const getTaskSummary = () => api.get<TaskSummary>("/tasks/summary");
export const getTaskById = (id: number) => api.get<Task>(`/tasks/${id}`);
export const createTask = (data: any) => api.post<Task>("/tasks", data);
export const updateTask = (id: number, data: any) =>
  api.put<Task>(`/tasks/${id}`, data);
export const deleteTask = (id: number) => api.delete(`/tasks/${id}`);

// --- Categories ---
export const getCategories = () => api.get<Category[]>("/categories");
export const createCategory = (data: { name: string }) =>
  api.post<Category>("/categories", data);
export const updateCategory = (id: number, data: { name?: string }) =>
  api.put<Category>(`/categories/${id}`, data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`);
// getCategoryById tidak dibuat servicenya, bisa dipanggil langsung jika perlu

// --- Notes ---
export const getNotesForTask = (taskId: number) =>
  api.get<Note[]>(`/tasks/${taskId}/notes`);
export const createNoteForTask = (taskId: number, data: { content: string }) =>
  api.post<Note>(`/tasks/${taskId}/notes`, data);
export const updateNote = (id: number, data: { content?: string }) =>
  api.put<Note>(`/notes/${id}`, data);
export const deleteNote = (id: number) => api.delete(`/notes/${id}`);
// getNoteById tidak dibuat servicenya, bisa dipanggil langsung jika perlu
