import React, { useEffect, useState } from "react";
import { getPayments } from "../../https";
import DatePicker from "react-datepicker";

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
      case "week":
        { const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        filtered = payments.filter((p) => {
          const date = new Date(p.createdAt);
          return date >= startOfWeek && date <= now;
        });
        break; }
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

  const totalAmount = filteredPayments.reduce(
    (acc, curr) => acc + (curr.amount || 0),
    0
  );

  return (
    <div className="container overflow-y-scroll h-[700px] scrollbar-hide mx-auto bg-[#262626] p-4 rounded-lg">
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

      <div className="text-[#f5f5f5] mb-3 text-sm">
        Total Pembayaran:{" "}
        <span className="font-bold text-green-400">
          Rp {totalAmount.toLocaleString("id-ID")}
        </span>
      </div>

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
                <th className="p-3">Order ID</th>
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
                  <td className="p-4">{pay.orderId || "-"}</td>
                  <td className="p-4 capitalize">{pay.method || "-"}</td>
                  <td className="p-4 capitalize">{pay.status || "-"}</td>
                  <td className="p-4">Rp {pay.amount?.toLocaleString("id-ID") ?? "-"}</td>
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
