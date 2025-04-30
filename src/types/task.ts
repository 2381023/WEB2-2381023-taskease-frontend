import { Category } from "./category"; // Impor Category
import { Note } from "./note"; // Impor Note

export enum TaskStatus {
  ToDo = "ToDo",
  InProgress = "InProgress",
  Done = "Done",
}

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  deadline: string;
  status: TaskStatus;
  userId: number;
  createdAt: string;
  updatedAt: string;
  categoryId?: number | null; // Tambahkan categoryId opsional
  category?: Category | null; // Tambahkan objek Category opsional (jika backend mengirimnya)
  notes?: Note[]; // Tambahkan array Note opsional (jika backend mengirimnya)
}

// TaskSummary tetap sama
export interface TaskSummary {
  completed: number;
  pending: number;
  nearDeadline: number;
}
