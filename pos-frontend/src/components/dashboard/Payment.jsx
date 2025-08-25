import React, { useEffect, useState } from "react";
import { getPayments } from "../../https";
import DatePicker from "react-datepicker";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";


const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getPayments();
        setPayments(response.data.data);
        setFilteredPayments(response.data.data);
      } catch (error) {
        console.error("Error fetching payments", error);
        setError("Gagal memuat data pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [filter, payments, startDate, endDate]);

  const filterPayments = () => {
    const now = new Date();
    let filtered = [];

    switch (filter) {
      case "today":
        filtered = payments.filter((p) => {
          const date = new Date(p.createdAt);
          return date.toDateString() === now.toDateString();
        });
        break;
      case "week": {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        filtered = payments.filter((p) => {
          const date = new Date(p.createdAt);
          return date >= startOfWeek && date <= now;
        });
        break;
      }
      case "month":
        filtered = payments.filter((p) => {
          const date = new Date(p.createdAt);
          return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
          );
        });
        break;
      case "custom":
        if (startDate && endDate) {
          filtered = payments.filter((p) => {
            const date = new Date(p.createdAt);
            return date >= startDate && date <= endDate;
          });
        } else {
          filtered = payments;
        }
        break;
      default:
        filtered = payments;
    }

    setFilteredPayments(filtered);
  };

  // 🔢 Hitung total masuk, keluar, saldo
  const totalIn = filteredPayments
    .filter((p) => p.direction === "in")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalOut = filteredPayments
    .filter((p) => p.direction === "out")
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const netTotal = totalIn - totalOut;

  // 📊 Data untuk grafik bulanan
  const chartData = [];
  const grouped = {};

  filteredPayments.forEach((p) => {
    const date = new Date(p.createdAt);
    const key = `${date.getMonth() + 1}/${date.getFullYear()}`;
    if (!grouped[key]) grouped[key] = { month: key, masuk: 0, keluar: 0 };

    if (p.direction === "in") {
      grouped[key].masuk += p.amount || 0;
    } else {
      grouped[key].keluar += p.amount || 0;
    }
  });

  for (let key in grouped) {
    chartData.push(grouped[key]);
  }

  return (
    <div className="container overflow-y-scroll h-[700px] scrollbar-hide mx-auto bg-[#262626] p-4 rounded-lg">
      {/* Filter & Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="text-[#f5f5f5] text-xl font-semibold">Payment History</h2>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#333] text-[#f5f5f5] border border-gray-600 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">Semua</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="custom">Custom Tanggal</option>
          </select>

          {filter === "custom" && (
            <div className="flex items-center gap-2">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Mulai"
                className="bg-[#333] text-[#f5f5f5] border border-gray-600 rounded-md px-3 py-1 text-sm"
              />
              <span className="text-[#f5f5f5]">sampai</span>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Selesai"
                className="bg-[#333] text-[#f5f5f5] border border-gray-600 rounded-md px-3 py-1 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      {/* Ringkasan total */}
      <div className="text-[#f5f5f5] mb-6 text-sm space-y-1">
        <div>
          Total Masuk:{" "}
          <span className="font-bold text-green-400">
            Rp {totalIn.toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          Total Keluar:{" "}
          <span className="font-bold text-red-400">
            Rp {totalOut.toLocaleString("id-ID")}
          </span>
        </div>
        <div>
          Saldo Bersih:{" "}
          <span className="font-bold text-blue-400">
            Rp {netTotal.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Grafik bar */}
      <div className="bg-[#333] p-4 rounded-lg mb-6">
        <h3 className="text-[#f5f5f5] mb-2">Grafik Pemasukan vs Pengeluaran</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="month" stroke="#f5f5f5" />
            <YAxis stroke="#f5f5f5" />
            <Tooltip />
            <Legend />
            <Bar dataKey="masuk" fill="#22c55e" name="Pemasukan" />
            <Bar dataKey="keluar" fill="#ef4444" name="Pengeluaran" />
          </BarChart>
        </ResponsiveContainer>
      </div>

            {/* Pie Chart */}
      <div className="bg-[#333] p-4 rounded-lg mb-6">
        <h3 className="text-[#f5f5f5] mb-2">Perbandingan Masuk vs Keluar</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Pemasukan", value: totalIn },
                { name: "Pengeluaran", value: totalOut },
              ]}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              <Cell key="in" fill="#22c55e" />
              <Cell key="out" fill="#ef4444" />
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>


      {/* Tabel data */}
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : loading ? (
        <p className="text-[#ababab]">Loading...</p>
      ) : filteredPayments.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada data pembayaran.</p>
      ) : (
        <div className="w-full overflow-x-auto max-w-full">
          <table className="w-full text-left text-[#f5f5f5]">
            <thead className="bg-[#333] text-[#ababab]">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Payment ID</th>
                <th className="p-3">Source ID</th>
                <th className="p-3">Tipe</th>
                <th className="p-3">Arah</th>
                <th className="p-3">Metode</th>
                <th className="p-3">Status</th>
                <th className="p-3">Jumlah</th>
                <th className="p-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((pay, index) => (
                <tr
                  key={pay._id || index}
                  className="border-b border-gray-600 hover:bg-[#333]"
                >
                  <td className="p-4 text-center">{index + 1}</td>
                  <td className="p-4">{pay.paymentId || "-"}</td>
                  <td className="p-4">{pay.sourceId || "-"}</td>
                  <td className="p-4 capitalize">{pay.sourceType || "-"}</td>
                  <td className="p-4 capitalize">
                    {pay.direction === "in" ? "Masuk" : "Keluar"}
                  </td>
                  <td className="p-4 capitalize">{pay.method || "-"}</td>
                  <td className="p-4 capitalize">{pay.status || "-"}</td>
                  <td className="p-4">
                    Rp {pay.amount?.toLocaleString("id-ID") ?? "-"}
                  </td>
                  <td className="p-4">
                    {pay.createdAt
                      ? new Date(pay.createdAt).toLocaleString("id-ID")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Payment;
