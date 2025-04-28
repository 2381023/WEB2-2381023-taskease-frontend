import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types/task';
import ErrorMessage from './ErrorMessage';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: Task | null; // For editing
  error?: string | null;
  isLoading: boolean;
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    error,
    isLoading
 }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.ToDo);
  const [formError, setFormError] = useState<string | null>(null);


  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      // Format date for input type="datetime-local" which needs YYYY-MM-DDTHH:mm
      const formattedDeadline = initialData.deadline
         ? new Date(initialData.deadline).toISOString().slice(0, 16)
         : '';
      setDeadline(formattedDeadline);
      setStatus(initialData.status);
    } else {
      // Reset form for adding new task
      setTitle('');
      setDescription('');
      setDeadline('');
      setStatus(TaskStatus.ToDo);
    }
    setFormError(null); // Clear errors when modal opens or data changes
  }, [initialData, isOpen]); // Depend on isOpen to reset form when opened anew

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    if (!title || !deadline) {
        setFormError("Title and Deadline are required.");
        return;
    }

    try {
      await onSubmit({
        title,
        description: description || undefined, // Send undefined if empty
        deadline, // Send as string, backend will parse
        status,
      });
     // onClose(); // Let the parent component handle closing on success if desired
    } catch (err: any) {
         // Error is likely handled by the parent via the `error` prop,
         // but we can set local form errors too if needed.
         console.error("Submission error in modal:", err);
          setFormError(err.message || "An error occurred during submission.");

    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>×</button>
        <h2>{initialData ? 'Edit Task' : 'Add New Task'}</h2>
        <form onSubmit={handleSubmit}>
          <ErrorMessage message={formError || error} /> {/* Display local or prop error */}
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
          <div className="form-group">
            <label htmlFor="deadline">Deadline</label>
            <input
              type="datetime-local" // Use datetime-local for easy picking
              id="deadline"
              className="form-control"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
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
          <button type="submit" className="button button-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : (initialData ? 'Update Task' : 'Add Task')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskFormModal;