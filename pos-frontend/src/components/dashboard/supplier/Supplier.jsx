import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { Pencil, Trash2 } from "lucide-react";
import { getSuppliers, deleteSupplier } from "../../../https";
import AddSupplierModal from "./AddSupplierModal";
import EditSupplierModal from "./EditSupplierModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Supplier = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // search + pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // fetch suppliers pakai react-query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      enqueueSnackbar("Supplier berhasil dihapus", { variant: "success" });
      queryClient.invalidateQueries(["suppliers"]);
    },
    onError: (err) => {
      enqueueSnackbar(
        err?.response?.data?.message || "Gagal menghapus supplier",
        { variant: "error" }
      );
    },
  });

  const handleDelete = (id) => {
    enqueueSnackbar("Yakin ingin menghapus supplier ini?", {
      variant: "warning",
      action: (key) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              deleteMutation.mutate(id, {
                onSettled: () => closeSnackbar(key),
              });
            }}
            className="text-red-500 font-semibold"
          >
            Ya
          </button>
          <button
            onClick={() => closeSnackbar(key)}
            className="text-gray-500 dark:text-gray-300 font-semibold"
          >
            Batal
          </button>
        </div>
      ),
    });
  };

  if (isLoading)
    return (
      <p className="text-gray-500 dark:text-gray-400 px-4 py-2">Loading...</p>
    );
  if (isError)
    return (
      <p className="text-red-500 px-4 py-2">Gagal memuat data supplier</p>
    );

  const suppliers = data?.data?.data || [];

  // filter by search
  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  // pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSuppliers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPagination = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, "...", totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage, "...", totalPages];
      }
    }
    return pages;
  };

  return (
    <Card className="bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white shadow-lg">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold mb-4">Daftar Supplier</h1>
          <Button
            onClick={() => setOpenAddModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            + Tambah Supplier
          </Button>
        </div>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Cari supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        {/* Tabel */}
        {filteredSuppliers.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Tidak ada supplier yang tersedia.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                    #
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                    Nama
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                    Telepon
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                    Alamat
                  </th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((s, index) => (
                  <tr
                    key={s._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                  >
                    <td className="p-4 text-center">
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.phone || "-"}</td>
                    <td className="px-3 py-2">{s.address || "-"}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => setEditData(s)}
                        >
                          <Pencil size={16} /> Edit
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={() => handleDelete(s._id)}
                        >
                          <Trash2 size={16} /> Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
              {/* Info jumlah data */}
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                {filteredSuppliers.length > 0 && (
                  <span>
                    Menampilkan <b>{indexOfFirstItem + 1}</b>–
                    <b>
                      {indexOfLastItem > filteredSuppliers.length
                        ? filteredSuppliers.length
                        : indexOfLastItem}
                    </b>{" "}
                    dari <b>{filteredSuppliers.length}</b> supplier
                  </span>
                )}
              </div>

              {/* Dropdown items per page */}
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <label htmlFor="itemsPerPage">Tampilkan</label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-2 py-1"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>per halaman</span>
              </div>

              {/* Numbered Pagination */}
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
                          : "bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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

        {/* Modal */}
        {openAddModal && (
          <AddSupplierModal
            isOpen={openAddModal}
            onClose={() => setOpenAddModal(false)}
          />
        )}
        {editData && (
          <EditSupplierModal
            isOpen={!!editData}
            onClose={() => setEditData(null)}
            supplier={editData}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Supplier;
