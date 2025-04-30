import React, { useState, useEffect } from "react";
import { Task, TaskStatus } from "../types/task";
import { Category } from "../types/category"; // Impor Category
import ErrorMessage from "./ErrorMessage";
import { getCategories } from "../services/apiService"; // Impor fungsi API

// Definisikan tipe data yang dikirim saat submit
// Sekarang termasuk categoryId opsional
export interface TaskFormData {
  title: string;
  description?: string;
  deadline: string; // Tetap string untuk input datetime-local
  status: TaskStatus;
  categoryId?: number | null; // Bisa number atau null
}

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => Promise<void>; // Gunakan TaskFormData
  initialData?: Task | null;
  error?: string | null;
  isLoading: boolean;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  error,
  isLoading,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.ToDo);
  const [categoryId, setCategoryId] = useState<string>(""); // Simpan sebagai string untuk <select>, '' berarti tidak ada
  const [categories, setCategories] = useState<Category[]>([]); // State untuk daftar kategori
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch kategori saat modal pertama kali terbuka atau isOpen berubah jadi true
  useEffect(() => {
    if (isOpen) {
      setLoadingCategories(true);
      getCategories()
        .then((response) => {
          setCategories(response.data);
        })
        .catch((err) => {
          console.error("Failed to load categories", err);
          setFormError("Could not load categories for selection.");
        })
        .finally(() => setLoadingCategories(false));
    }
  }, [isOpen]);

  // Set form fields saat initialData berubah (untuk edit)
  useEffect(() => {
    if (initialData && isOpen) {
      // Pastikan modal terbuka juga
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      const formattedDeadline = initialData.deadline
        ? new Date(initialData.deadline).toISOString().slice(0, 16)
        : "";
      setDeadline(formattedDeadline);
      setStatus(initialData.status);
      // Set categoryId dari initialData, konversi ke string untuk <select>
      setCategoryId(
        initialData.categoryId ? String(initialData.categoryId) : ""
      );
    } else if (!initialData && isOpen) {
      // Reset form jika menambah baru saat modal terbuka
      setTitle("");
      setDescription("");
      setDeadline("");
      setStatus(TaskStatus.ToDo);
      setCategoryId(""); // Reset kategori
    }
    // Clear errors saat modal dibuka/data berubah
    if (isOpen) {
      setFormError(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title || !deadline) {
      setFormError("Title and Deadline are required.");
      return;
    }

    // Siapkan data untuk dikirim
    const taskData: TaskFormData = {
      title,
      description: description || undefined, // Kirim undefined jika kosong
      deadline,
      status,
      // Konversi categoryId dari string ke number atau null
      categoryId: categoryId ? parseInt(categoryId, 10) : null,
    };

    try {
      await onSubmit(taskData); // Kirim TaskFormData
    } catch (err: any) {
      console.error("Submission error in modal:", err);
      setFormError(err.message || "An error occurred during submission.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        <h2>{initialData ? "Edit Task" : "Add New Task"}</h2>
        <form onSubmit={handleSubmit}>
          <ErrorMessage message={formError || error} />
          {/* Input Title */}
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {/* Input Description */}
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              className="form-control"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>
          {/* Input Deadline */}
          <div className="form-group">
            <label htmlFor="deadline">Deadline</label>
            <input
              type="datetime-local"
              id="deadline"
              className="form-control"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {/* Input Status */}
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              disabled={isLoading}
            >
              <option value={TaskStatus.ToDo}>To Do</option>
              <option value={TaskStatus.InProgress}>In Progress</option>
              <option value={TaskStatus.Done}>Done</option>
            </select>
          </div>
          {/* Input Category */}
          <div className="form-group">
            <label htmlFor="category">Category (Optional)</label>
            {loadingCategories ? (
              <p>Loading categories...</p>
            ) : (
              <select
                id="category"
                className="form-control"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isLoading}
              >
                <option value="">-- No Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={isLoading || loadingCategories}
          >
            {isLoading ? "Saving..." : initialData ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;
