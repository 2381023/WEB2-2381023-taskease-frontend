// src/pages/CategoriesPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Category } from "../types/category";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/apiService";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import "../styles/CategoriesPage.css"; // Buat file CSS ini jika perlu styling khusus

// Komponen untuk menampilkan satu item kategori
interface CategoryItemProps {
  category: Category;
  isEditing: boolean; // Menandakan apakah item ini sedang diedit
  editingValue: string; // Nilai saat ini di input edit
  onEditStart: (category: Category) => void; // Panggil saat tombol edit diklik
  onDelete: (id: number) => void;
  onEditChange: (value: string) => void; // Saat nilai input edit berubah
  onEditSave: (event: React.FormEvent) => Promise<void>; // Saat form edit disubmit
  onEditCancel: () => void; // Saat tombol cancel edit diklik
  isSubmitting: boolean; // Untuk disable tombol saat proses
}

const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  isEditing,
  editingValue,
  onEditStart,
  onDelete,
  onEditChange,
  onEditSave,
  onEditCancel,
  isSubmitting,
}) => {
  if (isEditing) {
    return (
      <form onSubmit={onEditSave} className="list-item category-item editing">
        <input
          type="text"
          className="form-control form-control-sm"
          value={editingValue}
          onChange={(e) => onEditChange(e.target.value)}
          required
          disabled={isSubmitting}
          autoFocus // Fokus otomatis ke input saat mode edit
        />
        <div className="button-group">
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
            onClick={onEditCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="list-item category-item">
      <span>{category.name}</span>
      <div className="button-group">
        <button
          className="button button-small"
          onClick={() => onEditStart(category)}
        >
          Edit
        </button>
        <button
          className="button button-small button-danger"
          onClick={() => onDelete(category.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

// Komponen Halaman Utama Categories
const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(
    null
  );
  const [editingCategoryName, setEditingCategoryName] = useState("");

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load categories.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmittingCreate(true);
    setError(null);
    try {
      await createCategory({ name: newCategoryName });
      setNewCategoryName("");
      await fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create category.");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (
      !window.confirm(
        "Delete this category? Tasks using it will lose their category association."
      )
    )
      return;
    setError(null);
    try {
      await deleteCategory(id);
      await fetchCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete category.");
    }
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setError(null); // Clear previous errors when starting edit
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategoryName.trim() || editingCategoryId === null) return;
    setIsSubmittingUpdate(true);
    setError(null);
    try {
      await updateCategory(editingCategoryId, { name: editingCategoryName });
      handleCancelEdit(); // Exit edit mode on success
      await fetchCategories();
    } catch (err: any) {
      // Keep edit mode open on error, display error message
      setError(err.response?.data?.message || "Failed to update category.");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  return (
    <div className="container">
      <h1>Manage Categories</h1>
      {/* Form Tambah */}
      <div className="card mb-2">
        <h2>Add New Category</h2>
        <form onSubmit={handleCreateCategory} className="add-category-form">
          <input
            type="text"
            className="form-control"
            placeholder="New category name..."
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            required
            disabled={isSubmittingCreate}
          />
          <button
            type="submit"
            className="button button-primary"
            disabled={isSubmittingCreate}
          >
            {isSubmittingCreate ? "Adding..." : "Add Category"}
          </button>
        </form>
        <ErrorMessage message={error && !editingCategoryId ? error : null} />
      </div>
      {/* Daftar Kategori */}
      <h2>Existing Categories</h2>
      {isLoading && <LoadingSpinner />}
      <ErrorMessage
        message={error && editingCategoryId !== null ? error : null}
      />{" "}
      {/* Error Update */}
      {!isLoading && categories.length === 0 && !error && (
        <p>No categories yet.</p>
      )}
      {!isLoading && categories.length > 0 && (
        <div className="list-container">
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              isEditing={editingCategoryId === cat.id}
              editingValue={editingCategoryName}
              onEditStart={handleStartEdit}
              onDelete={handleDeleteCategory}
              onEditChange={setEditingCategoryName}
              onEditSave={handleUpdateCategory}
              onEditCancel={handleCancelEdit}
              isSubmitting={isSubmittingUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
