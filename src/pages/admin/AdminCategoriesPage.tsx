// src/pages/admin/AdminCategoriesPage.tsx
import { useMemo, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { categoriesAPI } from "../../lib/api";
import { formatDateTime } from "../../lib/utils";

import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
} from "ag-grid-community";

// AG Grid v31+ module registration
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

/* ----------------------- Types ----------------------- */
type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
};

/* ----------------------- Reusable Dialog Shell ----------------------- */
function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ----------------------- Create / Edit Form Dialog ----------------------- */
function CategoryFormDialog({
  isOpen,
  mode,
  initial,
  onClose,
  onSaved,
}: {
  isOpen: boolean;
  mode: "create" | "edit";
  initial?: Partial<Category>;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState<boolean>(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Reset when record changes or dialog toggles
  useMemo(() => {
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setIsActive(initial?.isActive ?? true);
    setErr(null);
  }, [isOpen, initial?._id]); // eslint-disable-line

  const input =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setErr("Category name is required.");
      return;
    }
    if (trimmed.length < 3) {
      setErr("Category name must be at least 3 characters.");
      return;
    }

    try {
      setSaving(true);
      if (mode === "create") {
        await categoriesAPI.create({
          name: trimmed,
          description: description?.trim() || undefined,
          isActive,
        });
      } else if (initial?._id) {
        await categoriesAPI.update(initial._id, {
          name: trimmed,
          description: description?.trim() || undefined,
          isActive,
        });
      }
      await onSaved();
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => !saving && onClose()}
      title={mode === "create" ? "Add New Category" : "Edit Category"}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Category Name *
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
            placeholder="e.g., Safety Equipment"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={input + " min-h-[96px]"}
            placeholder="Brief description of this category..."
          />
        </div>

        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <span className="text-sm">Active</span>
        </label>

        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
            {err}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-500 text-white disabled:opacity-60"
          >
            {saving
              ? "Saving…"
              : mode === "create"
              ? "Create Category"
              : "Update Category"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/* ----------------------- Confirm Dialog ----------------------- */
function ConfirmDialog({
  open,
  title,
  description,
  onClose,
  onConfirm,
  confirming,
}: {
  open: boolean;
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  confirming?: boolean;
}) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {description}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
            disabled={confirming}
          >
            {confirming ? "Deleting…" : "Yes, delete"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------- Page ----------------------- */
export default function AdminCategoriesPage() {
  const { isAdmin } = useAuthStore();
  const gridRef = useRef<AgGridReact<Category>>(null);
  const queryClient = useQueryClient();

  const [quickFilter, setQuickFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [toDelete, setToDelete] = useState<{
    id: string;
    name?: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoriesAPI.getAll(),
    staleTime: 30_000,
  });

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const items: Category[] = useMemo(() => {
    return Array.isArray(data) ? data : data?.items ?? [];
  }, [data]);

  const refresh = useCallback(
    async () =>
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] }),
    [queryClient]
  );

  const handleEdit = useCallback((c: Category) => {
    setEditing(c);
    setEditOpen(true);
  }, []);

  const handleAskDelete = useCallback((c: Category) => {
    setToDelete({ id: c._id, name: c.name });
    setConfirmOpen(true);
  }, []);

  const doDelete = useCallback(async () => {
    if (!toDelete?.id) return;
    try {
      setConfirming(true);
      await categoriesAPI.delete(toDelete.id);
      await refresh();
    } catch (e: any) {
      alert(e?.message || "Failed to delete category");
    } finally {
      setConfirming(false);
      setConfirmOpen(false);
      setToDelete(null);
    }
  }, [toDelete, refresh]);

  // Column defs
  const columnDefs = useMemo<ColDef<Category>[]>(() => {
    return [
      {
        headerName: "Name",
        field: "name",
        tooltipField: "name",
        minWidth: 220,
        cellClass: "font-medium",
      },
      {
        headerName: "Description",
        field: "description",
        minWidth: 340,
        valueFormatter: (p) => p.value || "—",
      },
      {
        headerName: "Active",
        field: "isActive",
        width: 140,
        filter: true,
        sortable: true,
        cellRenderer: (p: ICellRendererParams<Category>) => {
          const on = !!p.data?.isActive;
          return (
            <span
              className={
                "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs " +
                (on
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200")
              }
            >
              <span
                className={
                  "inline-block h-2 w-2 rounded-full " +
                  (on ? "bg-emerald-500" : "bg-gray-400")
                }
              />
              {on ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        headerName: "Created",
        field: "createdAt",
        minWidth: 180,
        valueFormatter: (p) => (p.value ? formatDateTime(p.value) : "—"),
      },
      {
        headerName: "Actions",
        colId: "actions",
        width: 170,
        sortable: false,
        filter: false,
        pinned: "right",
        suppressSizeToFit: true,
        cellRenderer: (p: ICellRendererParams<Category>) => (
          <div className="flex justify-center gap-2">
            <button
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              title="Edit"
              onClick={() => p.data && handleEdit(p.data)}
            >
              ✏️
            </button>
            <button
              className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              title="Delete"
              onClick={() => p.data && handleAskDelete(p.data)}
            >
              🗑
            </button>
          </div>
        ),
      },
    ];
  }, [handleEdit, handleAskDelete]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
      cellStyle: { alignItems: "center", display: "flex" },
    }),
    []
  );

  const onGridReady = (_e: GridReadyEvent) => {
    const api = gridRef.current?.api;
    if (!api) return;

    // Auto-size columns initially
    const ids = (api.getAllGridColumns() || []).map((c) => c.getColId());
    api.autoSizeColumns(ids, false);

    if (quickFilter) api.setGridOption("quickFilterText", quickFilter);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage product categories.
          </p>
        </div>

        <button
          onClick={() => setCreateOpen(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-500 text-white"
        >
          + Add Category
        </button>
      </div>

      {/* Search + Counters */}
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <input
          value={quickFilter}
          onChange={(e) => {
            const v = e.target.value;
            setQuickFilter(v);
            gridRef.current?.api?.setGridOption("quickFilterText", v);
          }}
          placeholder="Search categories… (name, link)"
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm w-80"
        />
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <span className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            Total: <b>{items.length}</b>
          </span>
          <span className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            Active: <b>{items.filter((c) => c.isActive !== false).length}</b>
          </span>
          <span className="px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            Inactive: <b>{items.filter((c) => c.isActive === false).length}</b>
          </span>
        </div>
      </div>

      {/* Grid Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-2">
        <div className="ag-theme-quartz h-[560px] w-full">
          <AgGridReact<Category>
            ref={gridRef}
            rowData={items}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows
            pagination
            paginationPageSize={20}
            rowHeight={48}
            headerHeight={40}
            overlayNoRowsTemplate={`<div class="text-gray-500">No categories found.</div>`}
            onGridReady={onGridReady}
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-10 text-sm text-gray-500">Loading…</div>
      )}
      {error && (
        <div className="text-center py-10 text-sm text-red-600">
          {(error as Error).message || "Failed to load categories"}
        </div>
      )}

      {/* Create */}
      <CategoryFormDialog
        isOpen={createOpen}
        mode="create"
        onClose={() => setCreateOpen(false)}
        onSaved={refresh}
      />

      {/* Edit */}
      <CategoryFormDialog
        isOpen={editOpen}
        mode="edit"
        initial={editing ?? undefined}
        onClose={() => {
          setEditOpen(false);
          setEditing(null);
        }}
        onSaved={refresh}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmOpen}
        confirming={confirming}
        onClose={() => setConfirmOpen(false)}
        onConfirm={doDelete}
        title="Delete category?"
        description={`Are you sure you want to delete “${
          toDelete?.name ?? "this category"
        }”? This cannot be undone.`}
      />
    </>
  );
}
