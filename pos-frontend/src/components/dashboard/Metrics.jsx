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

const formatRupiah = (num) => {
  if (typeof num !== "number") return "-";
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const Metrics = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");
  const [category, setCategory] = useState("all");

  const fetchSummary = async (selectedRange = range, selectedCategory = category) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/metrics?range=${selectedRange}&category=${selectedCategory}`
      );

      console.log("📦 API Response:", res.data); // DEBUG
      // cek apakah res.data langsung berisi metrics atau ada di dalam data
      setSummary(res.data?.data || res.data || null);
    } catch (err) {
      console.error("❌ Gagal ambil data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [range, category]);

  if (loading) {
    return <p className="text-center text-gray-500">Memuat dashboard...</p>;
  }

  if (!summary) {
    return <p className="text-center text-red-500">Tidak ada data tersedia.</p>;
  }

  return (
    <div className="container mx-auto py-4 px-6">
      {/* Filter */}
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
            {summary?.categories?.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Semua Kategori" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summary?.metricsData?.map((item, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg shadow-lg"
            style={{ backgroundColor: item.color, color: "white" }}
          >
            <p className="text-sm">{item.title}</p>
            <p className="text-2xl font-bold">
              {item.unit === "Rp"
                ? formatRupiah(item.value)
                : `${item.value} ${item.unit}`}
            </p>
          </div>
        ))}

        {summary?.profit && (
          <div className="p-4 rounded-lg shadow-lg bg-green-600 text-white">
            <p className="text-sm">Profit Global</p>
            <p className="text-2xl font-bold">{formatRupiah(summary.profit)}</p>
          </div>
        )}
      </div>

      {/* Stok Produk */}
      {summary?.stockChart?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
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
      )}

      {/* Grafik Profit */}
      {summary?.profitChart?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-4">Grafik Profit</h3>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={summary.profitChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(val) => formatRupiah(val)} />
              <Legend />
              <Line type="monotone" dataKey="profit" stroke="#16a34a" name="Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Profit Per Dish */}
      {summary?.profitPerDish && summary.profitPerDish.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mt-8">
          <h3 className="text-lg font-semibold mb-4">Profit Per Dish</h3>

          {/* Chart */}
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={[...summary.profitPerDish].sort((a, b) => b.profit - a.profit)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dish" />
              <YAxis />
              <Tooltip formatter={(val) => formatRupiah(val)} />
              <Legend />
              <Bar dataKey="profit" fill="#f59e0b" name="Profit" />
            </BarChart>
          </ResponsiveContainer>

          {/* Tabel */}
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Dish</th>
                  <th className="p-2">Harga</th>
                  <th className="p-2">HPP</th>
                  <th className="p-2">Terjual</th>
                  <th className="p-2">Revenue</th>
                  <th className="p-2">Profit</th>
                  <th className="p-2">% Margin</th>
                </tr>
              </thead>
              <tbody>
                {summary.profitPerDish
                  .sort((a, b) => b.profit - a.profit)
                  .map((d, idx) => {
                    const margin =
                      d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) : 0;
                    return (
                      <tr
                        key={idx}
                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="p-2">{d.dish}</td>
                        <td className="p-2">{formatRupiah(d.price)}</td>
                        <td className="p-2">{formatRupiah(d.hpp)}</td>
                        <td className="p-2">{d.totalSold}</td>
                        <td className="p-2">{formatRupiah(d.revenue)}</td>
                        <td className="p-2 font-semibold text-green-600">
                          {formatRupiah(d.profit)}
                        </td>
                        <td className="p-2">{margin}%</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">
          📭 Tidak ada data profit per dish.
        </p>
      )}
    </div>
  );
};

export default Metrics;
