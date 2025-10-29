// src/pages/admin/AdminProductsPage.tsx
import { useMemo, useRef, useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { productsAPI } from "../../lib/api";
import { Button } from "../../components/ui/Button";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import { Plus, Download } from "lucide-react";
import { ConfirmDialog } from "../../components/admin/ConfirmDialog";

import { AgGridReact } from "ag-grid-react";
import type {
  ColDef,
  GridReadyEvent,
  ICellRendererParams,
  GridSizeChangedEvent,
} from "ag-grid-community";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

type Product = {
  _id: string;
  id?: string;
  sku: string;
  name: string;
  slug: string;
  categoryId?: { _id: string; name: string; slug: string } | string;
  brandId?: { _id: string; name: string; slug: string } | string;
  priceSell?: number;
  stockQty?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string;
};

function ActionsCell({
  data,
  onEdit,
  onDelete,
}: ICellRendererParams<Product> & {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const id = data?._id || data?.id;
  return (
    <div className="flex items-center justify-center gap-2 w-full">
      <button
        onClick={() => id && onEdit(id)}
        title="Edit"
        className="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
      >
        ✏️
      </button>
      <button
        onClick={() => id && onDelete(id)}
        title="Delete"
        className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        🗑
      </button>
    </div>
  );
}

export function AdminProductsPage() {
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const gridRef = useRef<AgGridReact<Product>>(null);
  const [quickFilter, setQuickFilter] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => productsAPI.adminList({ page: 1, limit: 500 }),
    staleTime: 30_000,
  });

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  const items: Product[] = useMemo(() => data?.items ?? [], [data]);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      flex: 1,
      minWidth: 130,
      sortable: true,
      filter: true,
      resizable: true,
      cellStyle: { display: "flex", alignItems: "center" },
    }),
    []
  );

  const handleEdit = useCallback(
    (id: string) => navigate(`/admin/products/${id}/edit`),
    [navigate]
  );

  const handleDelete = useCallback((id: string, name?: string) => {
    setPendingDelete({ id, name: name || "this product" });
    setConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pendingDelete?.id) return;
    try {
      await productsAPI.adminDelete(pendingDelete.id);
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    } catch (err: any) {
      alert(err?.message || "Failed to delete");
    } finally {
      setPendingDelete(null);
      setConfirmOpen(false);
    }
  }, [pendingDelete, queryClient]);

  // Little chip renderer for booleans
  const Chip = ({
    on,
    textOn,
    textOff,
  }: {
    on: boolean;
    textOn: string;
    textOff: string;
  }) => (
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
      {on ? textOn : textOff}
    </span>
  );

  // Columns — no image column; replace boolean ticks with chips
  const columnDefs = useMemo<ColDef<Product>[]>(() => {
    return [
      {
        headerName: "Name",
        field: "name",
        tooltipField: "name",
        minWidth: 220,
        cellClass: "font-medium",
      },
      { headerName: "SKU", field: "sku", width: 140, minWidth: 120 },
      {
        headerName: "Category",
        minWidth: 200,
        valueGetter: (p) =>
          typeof p.data?.categoryId === "string"
            ? p.data?.categoryId
            : p.data?.categoryId?.name || "—",
      },
      {
        headerName: "Price",
        field: "priceSell",
        width: 140,
        minWidth: 120,
        valueFormatter: (p) => formatCurrency(Number(p.value || 0)),
      },
      { headerName: "Stock", field: "stockQty", width: 120, minWidth: 100 },
      {
        headerName: "Status",
        field: "isActive",
        width: 140,
        cellDataType: false, // avoid boolean checkbox rendering
        cellRenderer: (p: ICellRendererParams<Product>) => (
          <Chip on={!!p.data?.isActive} textOn="Active" textOff="Inactive" />
        ),
      },
      {
        headerName: "Featured",
        field: "isFeatured",
        width: 140,
        cellDataType: false,
        cellRenderer: (p: ICellRendererParams<Product>) => (
          <Chip on={!!p.data?.isFeatured} textOn="Yes" textOff="No" />
        ),
      },
      {
        headerName: "Created",
        field: "createdAt",
        width: 180,
        minWidth: 160,
        valueFormatter: (p) => (p.value ? formatDateTime(p.value) : "—"),
      },
      {
        headerName: "Actions",
        colId: "actions",
        width: 170,
        minWidth: 170,
        maxWidth: 170,
        sortable: false,
        filter: false,
        pinned: "right",
        suppressSizeToFit: true,
        cellRenderer: (p: ICellRendererParams<Product>) => (
          <ActionsCell
            {...p}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id, p.data?.name)}
          />
        ),
      },
    ];
  }, [handleDelete, handleEdit]);

  const fitColumns = () => {
    const api = gridRef.current?.api;
    if (!api) return;
    const all = api.getAllGridColumns();
    if (!all) return;
    api.autoSizeColumns(
      all.map((c) => c.getColId()),
      false
    );
  };

  const onGridReady = (_e: GridReadyEvent) => {
    if (quickFilter)
      gridRef.current?.api?.setGridOption("quickFilterText", quickFilter);
    fitColumns();
  };

  const onGridSizeChanged = (_e: GridSizeChangedEvent) => fitColumns();

  const onExportCsv = () => {
    const api = gridRef.current?.api;
    if (!api) return;
    const cols = (api.getAllGridColumns() ?? [])
      .map((c) => c.getColId())
      .filter((id) => id !== "actions");
    api.exportDataAsCsv({ fileName: "products.csv", columnKeys: cols });
  };

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Products
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage catalogue, pricing and inventory.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        <input
          value={quickFilter}
          onChange={(e) => {
            const v = e.target.value;
            setQuickFilter(v);
            gridRef.current?.api?.setGridOption("quickFilterText", v);
          }}
          placeholder="Search products... (name, SKU, category)"
          className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm w-80"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCsv}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
            title="Export CSV"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
          <Link to="/admin/products/new">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-2">
        <div className="ag-theme-quartz h-[640px] w-full">
          <AgGridReact<Product>
            ref={gridRef}
            rowData={items}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            animateRows
            pagination
            paginationPageSize={20}
            tooltipShowDelay={0}
            rowHeight={48}
            headerHeight={40}
            overlayNoRowsTemplate={`<div class="text-gray-500">No products found.</div>`}
            getRowClass={(p) =>
              (p.node?.rowIndex ?? 0) % 2 === 0 ? "bg-gray-50/60" : ""
            }
            suppressCellFocus
            onGridReady={onGridReady}
            onGridSizeChanged={onGridSizeChanged}
          />
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-10 text-sm text-gray-500">Loading…</div>
      )}
      {error && (
        <div className="text-center py-10 text-sm text-red-600">
          {(error as Error).message || "Failed to load products"}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete product?"
        description={`Are you sure you want to delete ${
          pendingDelete?.name ?? "this product"
        }? This cannot be undone.`}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </>
  );
}
