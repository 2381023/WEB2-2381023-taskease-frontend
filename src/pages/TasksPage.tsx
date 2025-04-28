import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { Task, TaskStatus } from '../types/task';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import TaskFormModal from '../components/TaskFormModal'; // Import the modal

// Helper function to format date nicely
const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-CA', { // 'en-CA' gives yyyy-mm-dd
            year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        });
    } catch (e) {
        return "Invalid Date";
    }
};


const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null); // Error specific to modal actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null); // Task being edited
   const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for modal form


  // Filters and Sort State
  const [statusFilter, setStatusFilter] = useState<string>(''); // '' means all
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'deadline'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');


   const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
       const params = new URLSearchParams();
        if (statusFilter) params.append('status', statusFilter);
        if (searchTerm) params.append('search', searchTerm);
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);

      const response = await api.get<Task[]>(`/tasks?${params.toString()}`);
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Could not load tasks. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchTerm, sortBy, sortOrder]); // Re-fetch when filters change


  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // fetchTasks is memoized by useCallback

  const handleOpenAddModal = () => {
    setEditingTask(null); // Ensure we're adding, not editing
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null); // Clear editing state when closing
    setModalError(null);
  };

   const handleTaskSubmit = async (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
       setIsSubmitting(true);
       setModalError(null);
        try {
            if (editingTask) {
                // Update existing task
                await api.put(`/tasks/${editingTask.id}`, taskData);
            } else {
                // Create new task
                await api.post('/tasks', taskData);
            }
            handleCloseModal(); // Close modal on success
            await fetchTasks(); // Refetch tasks to show changes
        } catch (err: any) {
             console.error('Failed to save task:', err);
            const errorMessage = err.response?.data?.message || `Failed to ${editingTask ? 'update' : 'add'} task.`;
            setModalError(errorMessage);
             // Keep modal open if there's an error
        } finally {
            setIsSubmitting(false);
        }
    };


  const handleDeleteTask = async (taskId: number) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    setError(null); // Clear previous main errors
    try {
       // Optimistic UI: Remove task from state immediately
       // setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      await api.delete(`/tasks/${taskId}`);
       // If successful, fetch tasks again to confirm state
       await fetchTasks();
    } catch (err: any) {
      console.error('Failed to delete task:', err);
       setError(err.response?.data?.message || 'Failed to delete task.');
       // Optional: If optimistic UI failed, fetch tasks again to revert state
       // await fetchTasks();
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--padding-base)'}}>
          <h1>My Tasks</h1>
          <button className="button button-primary" onClick={handleOpenAddModal}>Add New Task</button>
      </div>

      {/* Filters */}
      <div className="task-filters">
          <input
            type="text"
            placeholder="Search title/description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value={TaskStatus.ToDo}>To Do</option>
              <option value={TaskStatus.InProgress}>In Progress</option>
              <option value={TaskStatus.Done}>Done</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'deadline')}>
              <option value="createdAt">Sort by Created</option>
              <option value="deadline">Sort by Deadline</option>
          </select>
           <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
          </select>
      </div>


      {isLoading && <LoadingSpinner />}
      <ErrorMessage message={error} /> {/* Display main fetch/delete errors here */}

      {!isLoading && tasks.length === 0 && !error && (
        <p className='text-center mt-2'>No tasks found. Add one!</p>
      )}

      {!isLoading && tasks.length > 0 && (
        <div className="task-list mt-1">
          {tasks.map((task) => (
            <div key={task.id} className="task-item">
               <div className="task-item-content">
                    <h3>{task.title}</h3>
                     {task.description && <p className="description">{task.description}</p>}
                     <div className="task-item-details">
                        <span>
                            <span className={`task-status status-${task.status}`}>{task.status}</span>
                        </span>
                         <span><strong>Deadline:</strong> {formatDate(task.deadline)}</span>
                        <span><small>Created: {formatDate(task.createdAt)}</small></span>
                     </div>
               </div>

              <div className="task-item-actions">
                <button className="button button-small" onClick={() => handleOpenEditModal(task)}>Edit</button>
                <button className="button button-small button-danger" onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

       {/* Task Form Modal */}
       <TaskFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSubmit={handleTaskSubmit}
            initialData={editingTask}
            error={modalError} // Pass modal-specific errors
            isLoading={isSubmitting} // Pass modal submitting state
        />
    </div>
  );
};

export default TasksPage;