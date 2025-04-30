// src/components/TaskNotesModal.tsx (BARU)
import React, { useState, useEffect, useCallback } from "react";
import { Note } from "../types/note";
import {
  getNotesForTask,
  createNoteForTask,
  updateNote,
  deleteNote,
} from "../services/apiService";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";

interface TaskNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null; // ID task yang notes-nya ditampilkan
  taskTitle?: string; // Judul task untuk ditampilkan di modal
}

const TaskNotesModal: React.FC<TaskNotesModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk edit inline (opsional)
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState("");

  const fetchNotes = useCallback(async () => {
    if (!taskId) return; // Jangan fetch jika tidak ada taskId
    setIsLoading(true);
    setError(null);
    try {
      const response = await getNotesForTask(taskId);
      setNotes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load notes.");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  // Fetch notes ketika modal terbuka atau taskId berubah
  useEffect(() => {
    if (isOpen && taskId) {
      fetchNotes();
    } else {
      // Reset state saat modal ditutup
      setNotes([]);
      setError(null);
      setNewNoteContent("");
      setEditingNoteId(null);
      setEditingNoteContent("");
    }
  }, [isOpen, taskId, fetchNotes]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !taskId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createNoteForTask(taskId, { content: newNoteContent });
      setNewNoteContent(""); // Kosongkan input
      await fetchNotes(); // Reload notes
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    setError(null);
    // Optional: Optimistic UI
    try {
      await deleteNote(noteId);
      await fetchNotes(); // Reload notes
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete note.");
    }
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingNoteContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingNoteContent("");
  };

  const handleUpdateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteContent.trim() || editingNoteId === null) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateNote(editingNoteId, { content: editingNoteContent });
      setEditingNoteId(null);
      setEditingNoteContent("");
      await fetchNotes(); // Reload
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || taskId === null) return null; // Jangan render jika tidak terbuka atau tidak ada taskId

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          ×
        </button>
        <h2>Notes for: {taskTitle || `Task ID ${taskId}`}</h2>

        <ErrorMessage message={error} />

        {/* Daftar Notes */}
        <div
          className="notes-list"
          style={{
            maxHeight: "300px",
            overflowY: "auto",
            marginBottom: "1rem",
          }}
        >
          {isLoading && <LoadingSpinner />}
          {!isLoading && notes.length === 0 && (
            <p>No notes yet for this task.</p>
          )}
          {!isLoading &&
            notes.map((note) =>
              editingNoteId === note.id ? (
                // Form Edit Inline
                <form
                  key={note.id}
                  onSubmit={handleUpdateNote}
                  className="list-item"
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                    padding: "0.5rem",
                    backgroundColor: "#4a5657",
                    borderRadius: "5px",
                  }}
                >
                  <textarea
                    className="form-control form-control-sm"
                    value={editingNoteContent}
                    onChange={(e) => setEditingNoteContent(e.target.value)}
                    required
                    disabled={isSubmitting}
                    rows={2}
                    style={{ flexGrow: 1 }}
                  />
                  <div
                    className="button-group"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.2rem",
                    }}
                  >
                    <button
                      type="submit"
                      className="button button-small button-primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="button button-small"
                      onClick={handleCancelEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Tampilan Note Biasa
                <div
                  key={note.id}
                  className="list-item"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.5rem",
                    padding: "0.5rem",
                    borderBottom: "1px solid #4a5657",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      flexGrow: 1,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      marginRight: "1rem",
                    }}
                  >
                    {note.content}
                  </p>
                  <div
                    className="button-group"
                    style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}
                  >
                    <button
                      className="button button-small"
                      onClick={() => handleStartEdit(note)}
                    >
                      Edit
                    </button>
                    <button
                      className="button button-small button-danger"
                      onClick={() => handleDeleteNote(note.id)}
                    >
                      Del
                    </button>
                  </div>
                </div>
              )
            )}
        </div>

        {/* Form Tambah Note */}
        <form onSubmit={handleCreateNote}>
          <div className="form-group">
            <label htmlFor="new-note">Add New Note</label>
            <textarea
              id="new-note"
              className="form-control"
              rows={3}
              placeholder="Type your note here..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding Note..." : "Add Note"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskNotesModal;
