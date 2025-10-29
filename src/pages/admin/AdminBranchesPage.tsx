// src/pages/admin/AdminBranchesPage.tsx
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

import { branchesAPI } from "../../lib/apiAdmin";
import AdminModal from "../../components/admin/AdminModal";
import { Button } from "../../components/ui/Button";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";

type Branch = {
  _id: string;
  city: string;
  addressLines: string[];
  phones: string[];
  emails: string[];
  isActive?: boolean;
  mapEmbedUrl?: string;
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

export default function AdminBranchesPage() {
  const qc = useQueryClient();
  const gridRef = useRef<AgGridReact<Branch>>(null);
  const [filter, setFilter] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Branch | null>(null);

  const { data = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: branchesAPI.list,
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
  const columns = useMemo<ColDef<Branch>[]>(
    () => [
      {
        headerName: "City",
        field: "city",
        minWidth: 200,
        cellClass: "font-medium",
      },
      {
        headerName: "Address",
        valueGetter: (p) => (p.data?.addressLines || []).join(", "),
        minWidth: 300,
      },
      {
        headerName: "Phones",
        valueGetter: (p) => (p.data?.phones || []).join(", "),
        minWidth: 200,
      },
      {
        headerName: "Emails",
        valueGetter: (p) => (p.data?.emails || []).join(", "),
        minWidth: 220,
      },
      {
        headerName: "Active",
        field: "isActive",
        width: 140,
        cellDataType: false,
        cellRenderer: (p: ICellRendererParams<Branch>) => (
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
        cellRenderer: (p: ICellRendererParams<Branch>) => (
          <div className="flex items-center justify-center gap-2">
            <button
              className="px-2.5 py-1.5 rounded-lg border hover:border-emerald-300 hover:bg-emerald-50"
              onClick={() => {
                setEditing(p.data!);
                setOpen(true);
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
    const form = new FormData(e.currentTarget);
    const data: any = Object.fromEntries(form as any);

    // Process isActive checkbox
    data.isActive = data.isActive === "on";

    data.addressLines = (data.addressLines || "")
      .split("\n")
      .map((s: string) => s.trim())
      .filter(Boolean);
    data.phones = (data.phones || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    data.emails = (data.emails || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);

    try {
      if (editing?._id) await branchesAPI.update(editing._id, data);
      else await branchesAPI.create(data);

      setOpen(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["branches"] });
    } catch (error: any) {
      console.error("Error saving branch:", error);
      alert(error.message || "Failed to save branch");
    }
  };

  const remove = async () => {
    if (!toDelete?._id) return;
    await branchesAPI.delete(toDelete._id);
    setConfirmOpen(false);
    setToDelete(null);
    qc.invalidateQueries({ queryKey: ["branches"] });
  };

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branches</h1>
          <p className="text-sm text-gray-500">
            Company addresses & contact points.
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
            placeholder="Search branches…"
            className="px-3 py-2 rounded-lg border text-sm w-72"
          />
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            + Add Branch
          </Button>
        </div>
      </div>

      <div className="ag-theme-quartz h-[640px] w-full bg-white rounded-xl border p-2">
        <AgGridReact<Branch>
          ref={gridRef}
          rowData={data}
          columnDefs={columns}
          defaultColDef={defaultColDef}
          pagination
          paginationPageSize={20}
          rowHeight={48}
          headerHeight={40}
          overlayNoRowsTemplate={`<div class="text-gray-500">No branches found.</div>`}
        />
      </div>

      <AdminModal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit Branch" : "Create Branch"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">City *</label>
              <input
                name="city"
                required
                defaultValue={editing?.city || ""}
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Address Lines (one per line)
              </label>
              <textarea
                name="addressLines"
                rows={3}
                defaultValue={(editing?.addressLines || []).join("\n")}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Phones (comma separated)
              </label>
              <input
                name="phones"
                defaultValue={(editing?.phones || []).join(", ")}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                Emails (comma separated)
              </label>
              <input
                name="emails"
                defaultValue={(editing?.emails || []).join(", ")}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Google Map Embed URL
              </label>
              <input
                name="mapEmbedUrl"
                defaultValue={editing?.mapEmbedUrl || ""}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
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
              {editing ? "Update Branch" : "Create Branch"}
            </Button>
          </div>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={remove}
        title="Delete branch?"
        description={`Are you sure you want to delete ${
          toDelete?.city ?? "this branch"
        }?`}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </>
  );
}
