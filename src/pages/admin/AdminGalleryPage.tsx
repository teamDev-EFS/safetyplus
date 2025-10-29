// src/pages/admin/AdminGalleryPage.tsx
import { useMemo, useRef, useState, useEffect } from "react";
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

import { albumsAPI } from "../../lib/apiAdmin";
import AdminModal from "../../components/admin/AdminModal";
import ImageDropzone from "../../components/admin/ImageDropZone";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { getImageUrl } from "../../lib/utils";

type Album = {
  _id: string;
  title: string;
  slug: string;
  eventDate?: string;
  isActive?: boolean;
  coverPath?: string;
  tags?: string[];
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
    {on ? "Active" : "Hidden"}
  </span>
);

export default function AdminGalleryPage() {
  const qc = useQueryClient();
  const gridRef = useRef<AgGridReact<Album>>(null);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Album | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);

  const { data = [] } = useQuery({
    queryKey: ["albums"],
    queryFn: albumsAPI.list,
  });

  const removeExistingImage = (idx: number) => {
    const next = existingImages.filter((_, i) => i !== idx);
    setExistingImages(next);
  };

  // Populate existing images when editing
  useEffect(() => {
    if (editing?.coverPath) {
      setExistingImages([{ url: getImageUrl(editing.coverPath) }]);
    } else {
      setExistingImages([]);
    }
  }, [editing]);

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
  const columns = useMemo<ColDef<Album>[]>(
    () => [
      {
        headerName: "Title",
        field: "title",
        minWidth: 240,
        cellClass: "font-medium",
      },
      { headerName: "Link", field: "slug", minWidth: 220 },
      {
        headerName: "Tags",
        valueGetter: (p) => (p.data?.tags || []).join(", "),
        minWidth: 180,
      },
      { headerName: "Event Date", field: "eventDate", minWidth: 160 },
      {
        headerName: "Active",
        field: "isActive",
        width: 140,
        cellDataType: false,
        cellRenderer: (p: ICellRendererParams<Album>) => (
          <Chip on={!!p.data?.isActive} />
        ),
      },
      {
        headerName: "Actions",
        colId: "actions",
        width: 170,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<Album>) => (
          <div className="flex items-center justify-center gap-2">
            <button
              className="px-2.5 py-1.5 rounded-lg border hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => {
                console.log("Editing album:", p.data);
                setEditing(p.data!);
                setOpen(true);
                setFiles([]);
                setExistingImages([]);
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

    // Process isActive checkbox
    const isActive = fd.get("isActive") === "on";
    fd.delete("isActive");
    fd.append("isActive", isActive.toString());

    // Remove slug field - let backend generate it from title
    fd.delete("slug");

    // Add existing images data
    if (existingImages.length > 0) {
      fd.append("existingImages", JSON.stringify(existingImages));
    }

    try {
      if (editing?._id) {
        await albumsAPI.update(editing._id, fd);
      } else {
        await albumsAPI.create(fd);
      }

      setOpen(false);
      setEditing(null);
      setFiles([]);
      setExistingImages([]);
      qc.invalidateQueries({ queryKey: ["albums"] });
    } catch (error: any) {
      console.error("Error saving album:", error);
      alert(error.message || "Failed to save album");
    }
  };

  const remove = async () => {
    if (!toDelete?._id) return;
    await albumsAPI.delete(toDelete._id);
    setConfirmOpen(false);
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["albums"] });
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gallery</h1>
          <p className="text-sm text-gray-500">
            Awards & company achievements.
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
            placeholder="Search albums…"
            className="px-3 py-2 rounded-lg border text-sm w-72"
          />
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            + Add Album
          </Button>
        </div>
      </div>

      <div className="ag-theme-quartz h-[640px] w-full bg-white rounded-xl border p-2">
        <AgGridReact<Album>
          ref={gridRef}
          rowData={data}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={20}
          rowHeight={48}
          headerHeight={40}
          overlayNoRowsTemplate={`<div class="text-gray-500">No albums found.</div>`}
        />
      </div>

      <AdminModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
          setFiles([]);
          setExistingImages([]);
        }}
        title={editing ? "Edit Album" : "Create Album"}
      >
        <form
          key={editing?._id || "new"}
          onSubmit={onSubmit}
          className="space-y-4"
        >
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
                Link (auto-generated)
              </label>
              <input
                name="slug"
                defaultValue={editing?.slug || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Event Date</label>
              <input
                name="eventDate"
                type="date"
                defaultValue={editing?.eventDate?.slice(0, 10) || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <input
                name="tags"
                defaultValue={(editing?.tags || []).join(", ")}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-3 mt-6">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked={editing?.isActive ?? true}
              />
              <label htmlFor="isActive" className="text-sm">
                Active
              </label>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Cover</label>
            <ImageDropzone
              onFiles={setFiles}
              max={1}
              existing={existingImages}
              onRemoveExisting={(idx) => removeExistingImage(Number(idx))}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded-lg border"
              onClick={() => {
                setOpen(false);
                setEditing(null);
                setFiles([]);
                setExistingImages([]);
              }}
            >
              Cancel
            </button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              type="submit"
            >
              {editing ? "Update Album" : "Create Album"}
            </Button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        title="Delete album?"
        description={`Are you sure you want to delete ${
          toDelete?.title ?? "this album"
        }? This cannot be undone.`}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </>
  );
}
