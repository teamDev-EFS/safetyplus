// src/pages/admin/AdminTeamPage.tsx
import { useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ColDef,
  ModuleRegistry,
  ICellRendererParams,
} from "ag-grid-community";
import type { Module as _m } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule as unknown as _m]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { teamAPI } from "../../lib/apiAdmin";
import AdminModal from "../../components/admin/AdminModal";
import ImageDropzone from "../../components/admin/ImageDropZone";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";
import { X } from "lucide-react";

/* ---------- Files base URL ---------- */
const FILES_BASE =
  (import.meta as any)?.env?.VITE_FILES_BASE_URL ||
  (import.meta as any)?.env?.VITE_API_URL ||
  "http://localhost:5000";

/** Convert stored relative path to absolute URL (works for `/team/...` or `/uploads/team/...`) */
function fileUrl(path?: string | null): string | null {
  if (!path) return null;
  const cleaned = String(path).replace("/undefined/", "/team/");
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  const withSlash = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  const ensured = withSlash.startsWith("/uploads/")
    ? withSlash
    : `/uploads${withSlash}`;
  return `${FILES_BASE.replace(/\/$/, "")}${ensured}`;
}

/* ---------- Types ---------- */
type Team = {
  _id: string;
  name: string;
  role: string;
  dept?: string;
  bioHtml?: string;
  email?: string;
  phone?: string;
  photoPath?: string;
  socials?: { linkedin?: string };
  priority?: number;
  isActive?: boolean;
  createdAt?: string;
};

/* ---------- Small UI ---------- */
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
    {on ? "Active" : "Inactive"}
  </span>
);

/* =======================================================================
 * Page
 * =======================================================================
 */
export default function AdminTeamPage() {
  const qc = useQueryClient();
  const gridRef = useRef<AgGridReact<Team>>(null);

  const [quickFilter, setQuickFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Team | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [removedExisting, setRemovedExisting] = useState(false);

  const { data = [] } = useQuery({
    queryKey: ["team"],
    queryFn: teamAPI.list,
    staleTime: 60_000,
  });

  /* ---------- Grid ---------- */
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

  const columns = useMemo<ColDef<Team>[]>(
    () => [
      {
        headerName: "Photo",
        field: "photoPath",
        width: 96,
        sortable: false,
        filter: false,
        suppressMenu: true,
        cellRenderer: (p: ICellRendererParams<Team>) => {
          const u = fileUrl(p.data?.photoPath);
          return u ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img
              src={u}
              crossOrigin="anonymous"
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                objectFit: "cover",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
              onError={(e) =>
                ((e.target as HTMLImageElement).style.display = "none")
              }
            />
          ) : (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                background: "#f1f5f9",
              }}
            />
          );
        },
      },
      {
        headerName: "Name",
        field: "name",
        minWidth: 200,
        cellClass: "font-medium",
      },
      { headerName: "Role", field: "role", minWidth: 180 },
      { headerName: "Dept", field: "dept", minWidth: 140 },
      {
        headerName: "Priority",
        field: "priority",
        width: 110,
        valueFormatter: (p) =>
          String(typeof p.value === "number" ? p.value : Number(p.value || 0)),
      },
      {
        headerName: "Active",
        field: "isActive",
        width: 140,
        cellDataType: false,
        cellRenderer: (p: ICellRendererParams<Team>) => (
          <Chip on={!!p.data?.isActive} />
        ),
      },
      {
        headerName: "Actions",
        colId: "actions",
        width: 180,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<Team>) => (
          <div className="flex items-center justify-center gap-2">
            <button
              className="px-2.5 py-1.5 rounded-lg border hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => {
                setEditing(p.data!);
                setOpen(true);
                setFiles([]);
                setRemovedExisting(false);
              }}
              title="Edit"
            >
              ✏️
            </button>
            <button
              className="px-2.5 py-1.5 rounded-lg border text-red-600 hover:border-red-300 hover:bg-red-50"
              onClick={() => {
                setToDelete(p.data!);
                setConfirmOpen(true);
              }}
              title="Delete"
            >
              🗑
            </button>
          </div>
        ),
      },
    ],
    []
  );

  /* ---------- Submit ---------- */
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    // normalize
    fd.set("isActive", String(fd.get("isActive") === "on"));
    const pri = Number(fd.get("priority") ?? 0);
    fd.set("priority", String(isNaN(pri) ? 0 : pri));

    // photo handling
    if (files[0]) fd.append("photo", files[0]);
    if (removedExisting && !files[0]) {
      fd.append("removePhoto", "true"); // backend should clear & delete
    }

    try {
      if (editing?._id) await teamAPI.update(editing._id, fd);
      else await teamAPI.create(fd);

      setOpen(false);
      setEditing(null);
      setFiles([]);
      setRemovedExisting(false);
      await qc.invalidateQueries({ queryKey: ["team"] });
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to save team member");
    }
  }

  /* ---------- Delete ---------- */
  async function remove() {
    if (!toDelete?._id) return;
    await teamAPI.delete(toDelete._id);
    setConfirmOpen(false);
    setToDelete(null);
    await qc.invalidateQueries({ queryKey: ["team"] });
  }

  /* ===================================================================
   * Render
   * =================================================================== */
  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-sm text-gray-500">Manage team members.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={quickFilter}
            onChange={(e) => {
              const v = e.target.value;
              setQuickFilter(v);
              gridRef.current?.api?.setGridOption("quickFilterText", v);
            }}
            placeholder="Search team…"
            className="px-3 py-2 rounded-lg border text-sm w-72"
          />
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setEditing(null);
              setOpen(true);
              setFiles([]);
              setRemovedExisting(false);
            }}
          >
            + Add Member
          </Button>
        </div>
      </div>

      <div className="ag-theme-quartz h-[640px] w-full bg-white rounded-xl border p-2">
        <AgGridReact<Team>
          ref={gridRef}
          rowData={data}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={20}
          rowHeight={56}
          headerHeight={42}
          overlayNoRowsTemplate={`<div class="text-gray-500">No team members found.</div>`}
        />
      </div>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Member" : "Add Member"}
      >
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Basics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <input
                name="name"
                required
                defaultValue={editing?.name || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role *</label>
              <input
                name="role"
                required
                defaultValue={editing?.role || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <input
                name="dept"
                defaultValue={editing?.dept || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <input
                name="priority"
                type="number"
                defaultValue={editing?.priority ?? 0}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={editing?.email || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                name="phone"
                defaultValue={editing?.phone || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm font-medium">
              Bio (HTML or plain text)
            </label>
            <textarea
              name="bioHtml"
              rows={5}
              defaultValue={editing?.bioHtml || ""}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>

          {/* Status / LinkedIn */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">LinkedIn</label>
              <input
                name="socials.linkedin"
                defaultValue={editing?.socials?.linkedin || ""}
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

          {/* Current Images (like your sample) */}
          {editing?.photoPath && !removedExisting && (
            <div>
              <label className="text-sm font-medium block mb-2">
                Current Images
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <img
                    src={fileUrl(editing.photoPath)!}
                    className="w-full h-36 object-cover"
                    crossOrigin="anonymous"
                    onError={(e) =>
                      ((e.target as HTMLImageElement).style.display = "none")
                    }
                  />
                  {/* remove button */}
                  <button
                    type="button"
                    aria-label="Remove image"
                    className="absolute right-2 top-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow p-1"
                    onClick={() => setRemovedExisting(true)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {/* label like Primary/Secondary */}
                  <div className="px-3 py-1 text-xs text-gray-700">Profile</div>
                </div>
              </div>
            </div>
          )}

          {/* Upload New (dropzone). If a new file is chosen while an image exists,
              we auto-mark removedExisting so the old one gets replaced. */}
          <div>
            <label className="text-sm font-medium">Upload New Photo</label>
            <ImageDropzone
              max={1}
              existing={[]} // we show our own "Current Images" block above
              onFiles={(picked) => {
                setFiles(picked);
                if (editing?.photoPath) setRemovedExisting(true);
              }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              type="submit"
            >
              {editing ? "Update Member" : "Create Member"}
            </Button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        title="Delete member?"
        description={`Are you sure you want to delete ${
          toDelete?.name ?? "this member"
        }? This cannot be undone.`}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </>
  );
}
