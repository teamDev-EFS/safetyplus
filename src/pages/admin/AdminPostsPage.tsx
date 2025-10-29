// src/pages/admin/AdminPostsPage.tsx
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
  ModuleRegistry,
} from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule as any]);
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { postsAPI } from "../../lib/apiAdmin";
import AdminModal from "../../components/admin/AdminModal";
import ImageDropzone from "../../components/admin/ImageDropZone";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";

type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentHtml?: string;
  isPublished?: boolean;
  tags?: string[];
  coverPath?: string;
  publishedAt?: string;
};

const Chip = ({ on }: { on: boolean }) => (
  <span
    className={
      "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs border " +
      (on
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-gray-100 text-gray-600 border-gray-200")
    }
  >
    <span
      className={
        "h-2 w-2 rounded-full " + (on ? "bg-emerald-500" : "bg-gray-400")
      }
    />
    {on ? "Published" : "Draft"}
  </span>
);

export default function AdminPostsPage() {
  const qc = useQueryClient();
  const gridRef = useRef<AgGridReact<Post>>(null);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Post | null>(null);
  const [files, setFiles] = useState<File[]>([]);

  const { data = [] } = useQuery({
    queryKey: ["posts"],
    queryFn: postsAPI.list,
  });

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 140,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    []
  );
  const columns = useMemo<ColDef<Post>[]>(
    () => [
      {
        headerName: "Title",
        field: "title",
        minWidth: 260,
        cellClass: "font-medium",
      },
      { headerName: "Link", field: "slug", minWidth: 220 },
      {
        headerName: "Tags",
        valueGetter: (p) => (p.data?.tags || []).join(", "),
        minWidth: 180,
      },
      {
        headerName: "Status",
        field: "isPublished",
        width: 140,
        cellDataType: false,
        cellRenderer: (p: ICellRendererParams<Post>) => (
          <Chip on={!!p.data?.isPublished} />
        ),
      },
      { headerName: "Published", field: "publishedAt", minWidth: 180 },
      {
        headerName: "Actions",
        colId: "actions",
        width: 170,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<Post>) => (
          <div className="flex items-center justify-center gap-2">
            <button
              className="px-2.5 py-1.5 rounded-lg border hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => {
                setEditing(p.data!);
                setOpen(true);
                setFiles([]);
              }}
            >
              ✏️
            </button>
            <button
              className="px-2.5 py-1.5 rounded-lg border text-red-600 hover:border-red-300 hover:bg-red-50"
              onClick={() => {
                setToDelete(p.data!);
                setConfirmOpen(true);
              }}
            >
              🗑
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // Add cover file if selected
    if (files[0]) fd.append("cover", files[0]);

    // Process tags - convert comma-separated string to array
    const tagsString = fd.get("tags") as string;
    if (tagsString) {
      fd.delete("tags");
      const tagsArray = tagsString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      tagsArray.forEach((tag) => fd.append("tags", tag));
    }

    // Process isPublished checkbox
    const isPublished = fd.get("isPublished") === "on";
    fd.delete("isPublished");
    fd.append("isPublished", isPublished.toString());

    try {
      if (editing?._id) {
        await postsAPI.update(editing._id, fd);
      } else {
        await postsAPI.create(fd);
      }

      setOpen(false);
      setEditing(null);
      setFiles([]);
      qc.invalidateQueries({ queryKey: ["posts"] });
    } catch (error: any) {
      console.error("Error saving post:", error);
      alert(error.message || "Failed to save post");
    }
  };

  const remove = async () => {
    if (!toDelete?._id) return;
    await postsAPI.delete(toDelete._id);
    setConfirmOpen(false);
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["posts"] });
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts</h1>
          <p className="text-sm text-gray-500">
            Publish events & announcements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              gridRef.current?.api?.setGridOption(
                "quickFilterText",
                e.target.value
              );
            }}
            placeholder="Search posts…"
            className="px-3 py-2 rounded-lg border text-sm w-72"
          />
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            + Add Post
          </Button>
        </div>
      </div>

      <div className="ag-theme-quartz h-[640px] w-full bg-white rounded-xl border p-2">
        <AgGridReact<Post>
          ref={gridRef}
          rowData={data}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={20}
          rowHeight={48}
          headerHeight={40}
          overlayNoRowsTemplate={`<div class="text-gray-500">No posts found.</div>`}
        />
      </div>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Post" : "Create Post"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <input
                name="title"
                required
                defaultValue={editing?.title || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Link (auto-generated) *
              </label>
              <input
                name="slug"
                required
                defaultValue={editing?.slug || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Tags (comma separated)
              </label>
              <input
                name="tags"
                defaultValue={(editing?.tags || []).join(", ")}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                id="isPublished"
                name="isPublished"
                defaultChecked={editing?.isPublished ?? false}
              />
              <label htmlFor="isPublished" className="text-sm">
                Published
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Short Summary</label>
            <textarea
              name="excerpt"
              rows={2}
              defaultValue={editing?.excerpt || ""}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">
              Content (HTML or text)
            </label>
            <textarea
              name="contentHtml"
              rows={6}
              defaultValue={editing?.contentHtml || ""}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Cover</label>
            <ImageDropzone
              onFiles={setFiles}
              max={1}
              existing={editing?.coverPath ? [{ url: editing.coverPath }] : []}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-lg border"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              type="submit"
            >
              {editing ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        title="Delete post?"
        description={`Are you sure you want to delete ${
          toDelete?.title ?? "this post"
        }? This cannot be undone.`}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </>
  );
}
