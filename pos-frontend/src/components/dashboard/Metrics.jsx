import React, { useEffect, useState } from "react";
import { getDashboardSummary } from "../../https/dashboard";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const Metrics = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Gagal ambil data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return <p className="text-center text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div className="container mx-auto py-4 px-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Dashboard Metrics
      </h2>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-600 text-white p-4 rounded-lg">
          <p className="text-sm">Total Orders</p>
          <p className="text-2xl font-bold">{summary.totalOrders}</p>
        </div>
        <div className="bg-green-600 text-white p-4 rounded-lg">
          <p className="text-sm">Total Purchases</p>
          <p className="text-2xl font-bold">{summary.totalPurchases}</p>
        </div>
        <div className="bg-red-600 text-white p-4 rounded-lg">
          <p className="text-sm">Total Expenses</p>
          <p className="text-2xl font-bold">Rp {summary.totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-purple-600 text-white p-4 rounded-lg">
          <p className="text-sm">Stock Items</p>
          <p className="text-2xl font-bold">{summary.totalStockItems}</p>
        </div>
      </div>

      {/* Recharts Example */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Grafik Penjualan</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={summary.orders.slice(-7)}> {/* ambil 7 order terakhir */}
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="createdAt" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalAmount" stroke="#3b82f6" name="Total Penjualan" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Metrics;
