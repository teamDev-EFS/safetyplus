// src/pages/admin/AdminOrdersPage.tsx
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../../store/authStore";
import { ordersAPI } from "../../lib/api";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const formatDateTime = (d?: string) => (d ? new Date(d).toLocaleString() : "—");

export function AdminOrdersPage() {
  const { isAdmin, user } = useAuthStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => ordersAPI.adminGetAll(),
    enabled: !!user && isAdmin,
  });

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Orders
      </h1>
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/40 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Order No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {orders?.map((o: any) => (
                <tr
                  key={o._id || o.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <td className="px-6 py-4 font-medium">{o.orderNo}</td>
                  <td className="px-6 py-4 text-sm">
                    {o.guestInfo ? (
                      <>
                        <div>{o.guestInfo.name}</div>
                        <div className="text-gray-500">{o.guestInfo.email}</div>
                        <div className="text-gray-500">{o.guestInfo.phone}</div>
                      </>
                    ) : o.userId ? (
                      <>
                        <div>{o.userId.name}</div>
                        <div className="text-gray-500">{o.userId.email}</div>
                        <div className="text-gray-500">
                          {o.shippingAddress?.phone || "—"}
                        </div>
                      </>
                    ) : (
                      "Unknown User"
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {o.items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatCurrency(o.totals?.grand || 0)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {o.paymentMethod || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        o.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : o.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : o.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDateTime(o.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
