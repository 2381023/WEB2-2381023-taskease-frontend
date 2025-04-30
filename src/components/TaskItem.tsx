// src/components/TaskItem.tsx (Tambahkan Tombol Notes)
import React from "react";
import { Task } from "../types/task";
import "../styles/TaskItem.css"; // Buat file CSS ini jika perlu

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (e) {
    return "Invalid Date";
  }
};

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
  onShowNotes: (taskId: number, taskTitle: string) => void; // <-- Prop untuk buka modal notes
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onDelete,
  onShowNotes,
}) => {
  return (
    <div className="task-item card">
      {" "}
      {/* Tambahkan class card jika ingin style sama */}
      <div className="task-item-content">
        <h3>{task.title}</h3>
        {task.description && <p className="description">{task.description}</p>}
        <div className="task-item-details">
          <span>
            <span className={`task-status status-${task.status}`}>
              {task.status}
            </span>
          </span>
          {/* Tampilkan Nama Kategori */}
          {task.category && (
            <span className="category-badge">
              {" "}
              {/* Tambahkan class untuk styling */}
              <strong>Category:</strong> {task.category.name}
            </span>
          )}
          {/* Tampilkan Deadline dan Created */}
          <span className="deadline-info">
            <strong>Deadline:</strong> {formatDate(task.deadline)}
          </span>
          <span className="created-info">
            <small>Created: {formatDate(task.createdAt)}</small>
          </span>
        </div>
      </div>
      {/* Pindahkan tombol ke group terpisah */}
      <div className="task-item-actions">
        <button
          className="button button-small notes-button"
          onClick={() => onShowNotes(task.id, task.title)}
        >
          Notes
        </button>
        <button
          className="button button-small edit-button"
          onClick={() => onEdit(task)}
        >
          Edit
        </button>
        <button
          className="button button-small button-danger delete-button"
          onClick={() => onDelete(task.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
