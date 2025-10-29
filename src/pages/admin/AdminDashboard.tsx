// src/pages/admin/AdminDashboard.tsx
import { useEffect, useRef } from "react";
import { Navigate } from "react-router-dom";
import Highcharts from "highcharts";
import { applyGreenTheme } from "../../lib/highchartsTheme";
import { useAuthStore } from "../../store/authStore";
import { Package, ShoppingCart, Users, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { productsAPI, ordersAPI } from "../../lib/api";

export function AdminDashboard() {
  const { isAdmin } = useAuthStore();
  const chartRef = useRef<HTMLDivElement>(null);
  const ordersChartRef = useRef<HTMLDivElement>(null);

  // Fetch real data from APIs
  const { data: productsData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => productsAPI.adminList(),
    enabled: isAdmin,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => ordersAPI.adminGetAll(),
    enabled: isAdmin,
  });

  useEffect(() => {
    applyGreenTheme();
  }, []);

  useEffect(() => {
    if (chartRef.current && ordersData) {
      // Calculate monthly sales from orders
      const monthlySales = [0, 0, 0, 0, 0, 0]; // Jan-Jun

      ordersData.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        const month = orderDate.getMonth();
        if (month >= 0 && month <= 5) {
          // Jan-Jun
          monthlySales[month] += order.totalAmount || 0;
        }
      });

      Highcharts.chart(chartRef.current, {
        chart: { type: "column", height: 300 },
        title: { text: "Monthly Sales" },
        xAxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
        yAxis: { title: { text: "Sales (₹)" } },
        series: [
          {
            type: "column",
            name: "Sales",
            data: monthlySales,
          },
        ],
      });
    }
  }, [ordersData]);

  useEffect(() => {
    if (ordersChartRef.current && ordersData) {
      // Calculate order status distribution
      const statusCounts: { [key: string]: number } = {};
      ordersData.forEach((order: any) => {
        const status = order.status || "pending";
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      const statusData = Object.entries(statusCounts).map(
        ([status, count]) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          y: count,
        })
      );

      Highcharts.chart(ordersChartRef.current, {
        chart: { type: "pie", height: 300 },
        title: { text: "Order Status Distribution" },
        series: [
          {
            type: "pie",
            name: "Orders",
            data: statusData,
          },
        ],
      });
    }
  }, [ordersData]);

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  // Calculate real statistics
  const totalProducts = productsData?.total || 0;
  const totalOrders = ordersData?.length || 0;
  const totalCustomers = 0; // No users API available
  const totalRevenue =
    ordersData?.reduce(
      (sum: number, order: any) => sum + (order.totalAmount || 0),
      0
    ) || 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount}`;
  };

  const stats = [
    { label: "Total Products", value: totalProducts.toString(), icon: Package },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      icon: ShoppingCart,
    },
    { label: "Customers", value: totalCustomers.toString(), icon: Users },
    { label: "Revenue", value: formatCurrency(totalRevenue), icon: BarChart3 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl grid place-items-center mb-4">
              <s.icon className="w-6 h-6 text-white" />
            </div>
            <div className="text-3xl font-bold mb-1 text-gray-900 dark:text-white">
              {s.value}
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Sales Overview
          </h2>
          <div ref={chartRef} />
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Order Status
          </h2>
          <div ref={ordersChartRef} />
        </div>
      </div>
    </div>
  );
}
