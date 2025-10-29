import { useState, useMemo, useRef, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  GridSizeChangedEvent,
  ICellRendererParams,
} from "ag-grid-community";
import { useAuthStore } from "../../store/authStore";
import { contactAPI } from "../../lib/api";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

interface Contact {
  _id: string;
  name: string;
  company?: string;
  mobile: string;
  email: string;
  subject: string;
  message: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

const StatusChip = ({ value }: { value: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "read":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "responded":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
        value
      )}`}
    >
      {value || "new"}
    </span>
  );
};

export function AdminContactsPage() {
  const { isAdmin } = useAuthStore();
  const gridRef = useRef<AgGridReact<Contact>>(null);
  const qc = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Contact | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressHeaderMenuButton: true,
    }),
    []
  );

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: () => contactAPI.adminGetAll({ limit: 1000 }),
    enabled: isAdmin,
  });

  const contacts = data?.contacts || [];

  const columnDefs = useMemo<ColDef<Contact>[]>(
    () => [
      {
        headerName: "Name",
        field: "name",
        minWidth: 150,
        cellClass: "font-medium",
      },
      {
        headerName: "Company",
        field: "company",
        minWidth: 150,
      },
      {
        headerName: "Email",
        field: "email",
        minWidth: 200,
      },
      {
        headerName: "Mobile",
        field: "mobile",
        minWidth: 120,
      },
      {
        headerName: "Subject",
        field: "subject",
        minWidth: 200,
      },
      {
        headerName: "Status",
        field: "status",
        width: 120,
        cellRenderer: (p: ICellRendererParams<Contact>) => (
          <StatusChip value={p.data?.status || "new"} />
        ),
      },
      {
        headerName: "Date",
        field: "createdAt",
        width: 150,
        valueFormatter: (p) => new Date(p.value).toLocaleDateString(),
      },
      {
        headerName: "Actions",
        colId: "actions",
        width: 200,
        pinned: "right",
        sortable: false,
        filter: false,
        cellRenderer: (p: ICellRendererParams<Contact>) => (
          <div className="flex items-center justify-center gap-2">
            <button
              className="px-2.5 py-1.5 rounded-lg border hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
              onClick={() => {
                setSelectedContact(p.data!);
              }}
            >
              👁️
            </button>
            <button
              className="px-2.5 py-1.5 rounded-lg border text-red-600 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900"
              onClick={() => {
                setPendingDelete(p.data!);
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

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const onGridSizeChanged = (params: GridSizeChangedEvent) => {
    params.api.sizeColumnsToFit();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await contactAPI.adminDelete(pendingDelete._id);
      qc.invalidateQueries({ queryKey: ["admin-contacts"] });
      setConfirmOpen(false);
      setPendingDelete(null);
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  const updateStatus = async (contactId: string, status: string) => {
    try {
      await contactAPI.adminUpdateStatus(contactId, status);
      qc.invalidateQueries({ queryKey: ["admin-contacts"] });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Contact Messages
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {contacts.filter((c) => !c.status || c.status === "new").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              New Messages
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {contacts.filter((c) => c.status === "read").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Read</div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {contacts.filter((c) => c.status === "responded").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Responded
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
            <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
              {contacts.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-2">
          <div className="ag-theme-quartz h-[640px] w-full">
            <AgGridReact<Contact>
              ref={gridRef}
              rowData={contacts}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows
              pagination
              paginationPageSize={20}
              tooltipShowDelay={0}
              rowHeight={48}
              headerHeight={40}
              overlayNoRowsTemplate={`<div class="text-gray-500">No contacts found.</div>`}
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
          <div className="text-center py-10 text-sm text-gray-500">
            Loading…
          </div>
        )}
        {error && (
          <div className="text-center py-10 text-sm text-red-600">
            {(error as Error).message || "Failed to load contacts"}
          </div>
        )}
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedContact(null)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Contact Details
                </h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedContact.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Company
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedContact.company || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedContact.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Mobile
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {selectedContact.mobile}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Subject
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedContact.subject}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Message
                  </label>
                  <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </label>
                    <div className="mt-1">
                      <StatusChip value={selectedContact.status || "new"} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedContact.status || "new"}
                      onChange={(e) =>
                        updateStatus(selectedContact._id, e.target.value)
                      }
                      className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="new">New</option>
                      <option value="read">Read</option>
                      <option value="responded">Responded</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete contact message?"
        description={`Are you sure you want to delete the contact message from ${
          pendingDelete?.name ?? "this contact"
        }? This cannot be undone.`}
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </>
  );
}
