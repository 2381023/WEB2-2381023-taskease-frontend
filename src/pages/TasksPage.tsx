// src/pages/TasksPage.tsx (Lengkap dengan fetchTasks, deleteTask, dan Logging)
import React, { useState, useEffect, useCallback } from "react";
import {
  getTasks,
  createTask as createTaskApi,
  updateTask as updateTaskApi,
  deleteTask as deleteTaskApi,
} from "../services/apiService"; // Pastikan path ini benar
import { Task, TaskStatus } from "../types/task"; // Pastikan path ini benar
import LoadingSpinner from "../components/LoadingSpinner"; // Pastikan path ini benar
import ErrorMessage from "../components/ErrorMessage"; // Pastikan path ini benar
import TaskFormModal, { TaskFormData } from "../components/TaskFormModal"; // Pastikan path ini benar
import TaskItem from "../components/TaskItem"; // Pastikan path ini benar
import TaskNotesModal from "../components/TaskNotesModal"; // Pastikan path ini benar

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Mulai dengan loading true
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedTaskIdForNotes, setSelectedTaskIdForNotes] = useState<
    number | null
  >(null);
  const [selectedTaskTitleForNotes, setSelectedTaskTitleForNotes] =
    useState<string>("");

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"createdAt" | "deadline">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fungsi fetchTasks dengan useCallback dan Logging
  const fetchTasks = useCallback(async () => {
    console.log("fetchTasks started..."); // <-- Log awal
    setIsLoading(true); // <-- Set true DI AWAL
    setError(null);
    try {
      // Siapkan parameter query
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      params.sortBy = sortBy;
      params.sortOrder = sortOrder;
      // Sertakan parameter untuk memuat kategori (jika backend mendukung)
      params.includeCategory = "true";

      console.log("Calling getTasks with params:", params); // <-- Log sebelum API call
      const response = await getTasks(params); // Panggil API service
      console.log(
        `getTasks response received (${response.data.length} tasks):`,
        response.data
      ); // <-- Log data sukses
      setTasks(response.data); // Update state dengan data baru
    } catch (err: any) {
      // Catat error detail ke console
      console.error(
        "ERROR in fetchTasks:",
        err.response?.data || err.message || err
      );
      // Set pesan error untuk ditampilkan ke user
      setError(
        err.response?.data?.message ||
          "Could not load tasks. Please check connection or try again later."
      );
    } finally {
      console.log("fetchTasks finally block reached."); // <-- Log akhir
      setIsLoading(false); // <-- Pastikan ini SELALU dijalankan untuk menghentikan loading
    }
  }, [statusFilter, searchTerm, sortBy, sortOrder]); // Dependensi untuk useCallback

  // useEffect untuk memanggil fetchTasks saat komponen mount atau dependensi filter berubah
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // <-- Dependensi useEffect adalah fetchTasks

  // --- Handler untuk Modal Task ---
  const handleOpenAddTaskModal = () => {
    setEditingTask(null);
    setModalError(null);
    setIsTaskModalOpen(true);
  };
  const handleOpenEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setModalError(null);
    setIsTaskModalOpen(true);
  };
  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setModalError(null);
  };
  const handleTaskSubmit = async (taskData: TaskFormData) => {
    setIsSubmittingTask(true);
    setModalError(null);
    try {
      if (editingTask) {
        console.log(
          `Submitting update for task ID ${editingTask.id}:`,
          taskData
        );
        await updateTaskApi(editingTask.id, taskData);
      } else {
        console.log("Submitting new task:", taskData);
        await createTaskApi(taskData);
      }
      handleCloseTaskModal();
      console.log("Task submit success, attempting refetch...");
      await fetchTasks(); // <-- Refetch setelah sukses
      console.log("Refetch after submit complete.");
    } catch (err: any) {
      console.error(
        "Failed to save task:",
        err.response?.data || err.message || err
      );
      const errorMessage =
        err.response?.data?.message ||
        `Failed to ${editingTask ? "update" : "add"} task.`;
      setModalError(errorMessage);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Handler untuk Delete Task (Implementasi Lengkap)
  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    setError(null); // Hapus error lama
    // Optional: Set loading state spesifik untuk item yang dihapus?
    try {
      console.log(`Attempting to delete task ID: ${taskId}`);
      await deleteTaskApi(taskId); // Panggil API delete
      console.log(`Task ID ${taskId} deleted, attempting refetch...`);
      await fetchTasks(); // <-- Refetch daftar task setelah delete
      console.log("Refetch after delete complete.");
    } catch (err: any) {
      console.error(
        `Failed to delete task ID ${taskId}:`,
        err.response?.data || err.message || err
      );
      setError(err.response?.data?.message || "Failed to delete task.");
    } finally {
      // Optional: Hapus loading state spesifik jika ada
    }
  };

  // --- Handler untuk Modal Notes ---
  const handleShowNotes = (taskId: number, taskTitle: string) => {
    setSelectedTaskIdForNotes(taskId);
    setSelectedTaskTitleForNotes(taskTitle);
    setIsNotesModalOpen(true);
  };
  const handleCloseNotesModal = () => {
    setIsNotesModalOpen(false);
    setSelectedTaskIdForNotes(null);
    setSelectedTaskTitleForNotes("");
  };
  // --- Akhir Handler Notes ---

  // --- UI RENDER ---
  return (
    <div className="container">
      {/* Header Halaman */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--padding-base)",
        }}
      >
        <h1>My Tasks</h1>
        <button
          className="button button-primary"
          onClick={handleOpenAddTaskModal}
        >
          Add New Task
        </button>
      </div>

      {/* Filter Section */}
      <div className="task-filters">
        <input
          type="text"
          placeholder="Search title/description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value={TaskStatus.ToDo}>To Do</option>
          <option value={TaskStatus.InProgress}>In Progress</option>
          <option value={TaskStatus.Done}>Done</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as "createdAt" | "deadline")
          }
        >
          <option value="createdAt">Sort by Created</option>
          <option value="deadline">Sort by Deadline</option>
        </select>
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      {/* Loading dan Error Handling */}
      {isLoading && <LoadingSpinner />}
      {/* Tampilkan error fetch utama di sini */}
      <ErrorMessage message={!isLoading ? error : null} />

      {/* Task List */}
      {!isLoading && tasks.length === 0 && !error && (
        <p className="text-center mt-2">No tasks found. Add one!</p>
      )}
      {!isLoading && tasks.length > 0 && (
        <div className="task-list mt-1">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEdit={handleOpenEditTaskModal}
              onDelete={handleDeleteTask}
              onShowNotes={handleShowNotes} // <-- Handler untuk modal notes
            />
          ))}
        </div>
      )}

      {/* Modal Form Task */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
        error={modalError} // Error spesifik untuk modal task
        isLoading={isSubmittingTask}
      />

      {/* Render Modal Notes */}
      <TaskNotesModal
        isOpen={isNotesModalOpen}
        onClose={handleCloseNotesModal}
        taskId={selectedTaskIdForNotes}
        taskTitle={selectedTaskTitleForNotes}
      />
    </div>
  );
};

export default TasksPage;
