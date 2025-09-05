import React, { useEffect, useState } from "react";
import api from "../../https/axiosWrapper";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

const Metrics = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");
  const [category, setCategory] = useState("all");

  const fetchSummary = async (selectedRange = range, selectedCategory = category) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/metrics?range=${selectedRange}&category=${selectedCategory}`);
      setSummary(res.data.data);
    } catch (err) {
      console.error("Gagal ambil data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [range, category]);

  if (loading || !summary) {
    return <p className="text-center text-gray-500">Loading dashboard...</p>;
  }

  return (
    <div className="container mx-auto py-4 px-6">
      {/* Filter range */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Dashboard Metrics
        </h2>
        <div className="flex gap-3">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border px-3 py-2 rounded-md bg-white dark:bg-gray-800 dark:text-white"
          >
            <option value="day">Harian</option>
            <option value="week">Mingguan</option>
            <option value="month">Bulanan</option>
          </select>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-3 py-2 rounded-md bg-white dark:bg-gray-800 dark:text-white"
          >
            {summary.categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Semua Kategori" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summary.metricsData.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg shadow-lg"
            style={{ backgroundColor: item.color, color: "white" }}
          >
            <p className="text-sm">{item.title}</p>
            <p className="text-2xl font-bold">
              {item.unit === "Rp"
                ? `Rp ${item.value.toLocaleString()}`
                : `${item.value} ${item.unit}`}
            </p>
          </div>
        ))}
      </div>

      {/* Grafik Stok Produk */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Stok Produk</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={summary.stockChart}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="stock" fill="#6366f1" name="Jumlah Stok" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Metrics;
