export enum TaskStatus {
    ToDo = 'ToDo',
    InProgress = 'InProgress',
    Done = 'Done',
}

export interface Task {
    id: number;
    title: string;
    description?: string | null; // Allow null from DB
    deadline: string; // Dates are typically strings in JSON
    status: TaskStatus;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export interface TaskSummary {
    completed: number;
    pending: number;
    nearDeadline: number;
}