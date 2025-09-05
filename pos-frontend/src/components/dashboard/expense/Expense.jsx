import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getExpenses, deleteExpense } from "../../../https";
import AddExpenseModal from "./AddExpenseModal";
import EditExpenseModal from "./EditExpenseModal";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Expense = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch expenses
  const { data, isLoading, isError } = useQuery({
    queryKey: ["expenses"],
    queryFn: getExpenses,
  });

  // Mutation delete
  const { mutate: removeExpense } = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      enqueueSnackbar("Expense berhasil dihapus ✅", { variant: "success" });
      queryClient.invalidateQueries(["expenses"]);
    },
    onError: () => {
      enqueueSnackbar("Gagal menghapus expense ❌", { variant: "error" });
    },
  });

  const handleDelete = (id) => {
    enqueueSnackbar("Yakin ingin menghapus expense ini?", {
      variant: "warning",
      action: (key) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              try {
                removeExpense(id);
              } catch {
                enqueueSnackbar("Gagal menghapus expense ❌", { variant: "error" });
              } finally {
                closeSnackbar(key);
              }
            }}
            className="text-red-500 font-semibold"
          >
            Ya
          </button>
          <button
            onClick={() => closeSnackbar(key)}
            className="text-gray-400 font-semibold"
          >
            Batal
          </button>
        </div>
      ),
    });
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setOpenEditModal(true);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries(["expenses"]);
  };

  if (isLoading) return <p className="text-gray-400 dark:text-gray-300">Loading...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data expense</p>;

  const expenses = data?.data?.data || [];

  // Filter berdasarkan search
  const filteredExpenses = expenses.filter(
    (exp) =>
      exp.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);

  const getPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // Hitung total amount
  const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <Card className="bg-white dark:bg-[#1e1e1e] shadow-lg rounded-xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Daftar Expense</h2>
          <Button
            onClick={() => setOpenAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            + Tambah Expense
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Cari berdasarkan deskripsi atau kategori..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>

        {/* Table */}
        {currentExpenses.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Tidak ada expense yang tersedia.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Tanggal</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Deskripsi</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Kategori</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Jumlah</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentExpenses.map((exp) => (
                  <tr
                    key={exp._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                  >
                    <td className="px-3 py-2">
                      {new Date(exp.date).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-3 py-2">{exp.note}</td>
                    <td className="px-3 py-2">{exp.category}</td>
                    <td className="px-3 py-2 text-right">
                      Rp {exp.amount?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-2 text-center flex gap-2 justify-center">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleEdit(exp)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(exp._id)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="mt-3 text-right text-lg font-semibold text-gray-900 dark:text-gray-100">
              Total: Rp {totalAmount.toLocaleString("id-ID")}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                {filteredExpenses.length > 0 && (
                  <span>
                    Menampilkan <b>{indexOfFirstItem + 1}</b>–<b>{Math.min(indexOfLastItem, filteredExpenses.length)}</b>{" "}
                    dari <b>{filteredExpenses.length}</b> expense
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <label htmlFor="itemsPerPage">Tampilkan</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-gray-100 dark:bg-[#2a2a2a] text-gray-900 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
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
                          : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#333]"
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

        {/* Modals */}
        {openAddModal && (
          <AddExpenseModal
            isOpen={openAddModal}
            onClose={() => setOpenAddModal(false)}
            onAdded={handleUpdateSuccess}
          />
        )}

        {openEditModal && selectedExpense && (
          <EditExpenseModal
            isOpen={openEditModal}
            expense={selectedExpense}
            onClose={() => setOpenEditModal(false)}
            onUpdated={handleUpdateSuccess}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Expense;
