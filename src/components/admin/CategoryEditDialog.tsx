import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { X } from "lucide-react";

interface CategoryEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdated: (category: {
    _id: string;
    name: string;
    slug: string;
  }) => void;
  category: {
    _id: string;
    name: string;
    slug: string;
    description?: string;
  } | null;
}

export function CategoryEditDialog({
  isOpen,
  onClose,
  onCategoryUpdated,
  category,
}: CategoryEditDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || "");
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Category name is required";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    if (!category) return;

    setIsUpdating(true);
    try {
      const { categoriesAPI } = await import("../../lib/api");
      const updatedCategory = await categoriesAPI.update(category._id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });

      onCategoryUpdated(updatedCategory);
      setName("");
      setDescription("");
      onClose();
    } catch (error: any) {
      console.error("Failed to update category:", error);
      alert(error.message || "Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit Category
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Safety Equipment"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
              disabled={isUpdating}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this category..."
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={isUpdating}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || !name.trim()}>
              {isUpdating ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
