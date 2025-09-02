import React, { useEffect, useState } from "react";
import { getPayments, deleteMultiplePayments } from "../../https";
import DatePicker from "react-datepicker";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";


const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPayments, setSelectedPayments] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await getPayments();
        setPayments(response.data.data);
      } catch (error) {
        console.error(error);
        setError("Gagal memuat data pembayaran");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);


  if (loading) return <p className="text-[#ababab]">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  

  // Filter by search
  const filteredPayments = payments.filter(
    (pay) =>
      pay.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.sourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pay.method?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (id) => {
    const newSet = new Set(selectedPayments);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedPayments(newSet);
  };

  const handleSelectAll = () => {
    const currentIds = currentPayments.map((p) => p._id);
    const allSelected = currentIds.every((id) => selectedPayments.has(id));
    const newSet = new Set(selectedPayments);

    if (allSelected) currentIds.forEach((id) => newSet.delete(id));
    else currentIds.forEach((id) => newSet.add(id));

    setSelectedPayments(newSet);
  };

  const handleDeleteSelected = async () => {
    if (selectedPayments.size === 0) return;
    if (!window.confirm(`Hapus ${selectedPayments.size} payment terpilih?`)) return;

    try {
      setDeleting(true);
      await deleteMultiplePayments(Array.from(selectedPayments));
      setPayments((prev) => prev.filter((p) => !selectedPayments.has(p._id)));
      setSelectedPayments(new Set());
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus payment");
    } finally {
      setDeleting(false);
    }
  };

  const summary = payments.reduce(
  (acc, pay) => {
    const source = pay.sourceType?.toLowerCase();
    const amount = pay.amount || 0;

    if (source === "expense") {
      acc.expense.count += 1;
      acc.expense.total += amount;
    } else if (source === "purchase") {
      acc.purchase.count += 1;
      acc.purchase.total += amount;
    } else if (source === "order") {
      acc.order.count += 1;
      acc.order.total += amount;
    }

    return acc;
  },
  {
    expense: { count: 0, total: 0 },
    purchase: { count: 0, total: 0 },
    order: { count: 0, total: 0 },
  }
);

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  const getPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Card className="bg-[#262626] text-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold">Daftar Payment</h2>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDeleteSelected}
            disabled={selectedPayments.size === 0 || deleting}
          >
            Hapus Terpilih
          </Button> 
        </div>

        {/* Summary jumlah per tipe */}
          <div className="flex gap-4 mb-4">
            <div className="bg-red-600/20 text-red-400 px-3 py-2 rounded font-semibold">
              Expense: {summary.expense.count} | Rp {summary.expense.total.toLocaleString("id-ID")}
            </div>
            <div className="bg-blue-600/20 text-blue-400 px-3 py-2 rounded font-semibold">
              Purchase: {summary.purchase.count} | Rp {summary.purchase.total.toLocaleString("id-ID")}
            </div>
            <div className="bg-green-600/20 text-green-400 px-3 py-2 rounded font-semibold">
              Order: {summary.order.count} | Rp {summary.order.total.toLocaleString("id-ID")}
            </div>
          </div>


        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Cari berdasarkan Payment ID, Source, atau Metode..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#333] text-white border-gray-600"
          />
        </div>

        {currentPayments.length === 0 ? (
          <p className="text-gray-400">Tidak ada data pembayaran.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-600 text-sm">
              <thead>
                <tr className="bg-[#333] text-gray-300">
                  <th className="border border-gray-600 px-3 py-2">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={currentPayments.every((p) => selectedPayments.has(p._id))}
                    />
                  </th>
                  <th className="border border-gray-600 px-3 py-2">#</th>
                  <th className="border border-gray-600 px-3 py-2">Payment ID</th>
                  <th className="border border-gray-600 px-3 py-2">Tanggal</th>
                  <th className="border border-gray-600 px-3 py-2">Source</th>
                  <th className="border border-gray-600 px-3 py-2">Arah</th>
                  <th className="border border-gray-600 px-3 py-2">Metode</th>
                  <th className="border border-gray-600 px-3 py-2">Status</th>
                  <th className="border border-gray-600 px-3 py-2 text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {currentPayments.map((pay, index) => (
                  <tr
                    key={pay?._id || index}
                    className="border-t border-gray-700 hover:bg-[#333]/50"
                  >
                    <td className="border border-gray-600 px-3 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={selectedPayments.has(pay._id)}
                        onChange={() => handleSelect(pay._id)}
                      />
                    </td>
                    <td className="border border-gray-600 px-3 py-2 text-center">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 font-mono">
                      {pay?.paymentId || "-"}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 text-center">
                      {pay?.createdAt
                        ? new Date(pay.createdAt).toLocaleString("id-ID")
                        : "-"}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold mr-2
                          ${
                            pay?.sourceType?.toLowerCase() === "purchase"
                              ? "bg-blue-600/30 text-blue-400"
                              : pay?.sourceType?.toLowerCase() === "order"
                              ? "bg-green-600/30 text-green-400"
                              : pay?.sourceType?.toLowerCase() === "expense"
                              ? "bg-red-600/30 text-red-400"
                              : "bg-gray-600/30 text-gray-300"
                          }`}
                      >
                        {pay?.sourceType || "-"}
                      </span>
                    </td>
                    <td className="border border-gray-600 px-3 py-2 text-center">
                      {pay?.direction?.toLowerCase() === "in" ? (
                        <span className="text-green-400 font-semibold">Masuk</span>
                      ) : (
                        <span className="text-red-400 font-semibold">Keluar</span>
                      )}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 capitalize text-center">
                      {pay?.method || "-"}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 text-center">
                      {pay?.status?.toLowerCase() === "success" && (
                        <span className="px-2 py-1 rounded bg-green-600/30 text-green-400 text-xs">
                          Sukses
                        </span>
                      )}
                      {pay?.status?.toLowerCase() === "pending" && (
                        <span className="px-2 py-1 rounded bg-yellow-600/30 text-yellow-400 text-xs">
                          Pending
                        </span>
                      )}
                      {pay?.status?.toLowerCase() === "failed" && (
                        <span className="px-2 py-1 rounded bg-red-600/30 text-red-400 text-xs">
                          Gagal
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 font-semibold text-right">
                      {pay?.direction?.toLowerCase() === "in" ? (
                        <span className="text-green-400">
                          + Rp {pay?.amount?.toLocaleString("id-ID")}
                        </span>
                      ) : (
                        <span className="text-red-400">
                          - Rp {pay?.amount?.toLocaleString("id-ID")}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
              <div className="text-gray-400 text-sm">
                {filteredPayments.length > 0 && (
                  <span>
                    Menampilkan{" "}
                    <b>{indexOfFirstItem + 1}</b>–
                    <b>
                      {indexOfLastItem > filteredPayments.length
                        ? filteredPayments.length
                        : indexOfLastItem}
                    </b>{" "}
                    dari <b>{filteredPayments.length}</b> payment
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <label htmlFor="itemsPerPage">Tampilkan</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-[#333] text-white border border-gray-600 rounded px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per halaman</span>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                >
                  Prev
                </Button>

                {getPagination().map((page, idx) =>
                  page === "..." ? (
                    <span key={idx} className="px-2 text-gray-400">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      size="sm"
                      variant={currentPage === page ? "default" : "outline"}
                      className={`${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "bg-[#333] text-gray-300 hover:bg-gray-700"
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Payment;
