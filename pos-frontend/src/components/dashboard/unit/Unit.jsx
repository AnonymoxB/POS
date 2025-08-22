import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getUnits, deleteUnit } from "../../../https";
import AddUnitModal from "./AddUnitModal";
import EditUnitModal from "./EditUnitModal";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Unit = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  // Search & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch units
  const { data, isLoading, isError } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });

  // Mutation delete
  const { mutate: removeUnit } = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      enqueueSnackbar("Unit berhasil dihapus", { variant: "success" });
      queryClient.invalidateQueries(["units"]);
    },
    onError: () => {
      enqueueSnackbar("Gagal menghapus unit", { variant: "error" });
    },
  });

  const handleDelete = (id) => {
    enqueueSnackbar("Yakin ingin menghapus unit ini?", {
      variant: "warning",
      action: (key) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              try {
                removeUnit(id);
              } catch {
                enqueueSnackbar("Gagal menghapus unit", { variant: "error" });
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
            className="text-gray-300 font-semibold"
          >
            Batal
          </button>
        </div>
      ),
    });
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setOpenEditModal(true);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries(["units"]);
  };

  if (isLoading) return <p className="text-[#ababab]">Loading...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data unit</p>;

  const units = data?.data || [];

  // Filter berdasarkan search
  const filteredUnits = units.filter(
    (unit) =>
      unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.short?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstItem, indexOfLastItem);

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
          <h2 className="text-xl font-bold">Daftar Unit</h2>
          <Button
            onClick={() => setOpenAddModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            + Tambah Unit
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            placeholder="Cari berdasarkan nama atau singkatan..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#333] text-white border-gray-600"
          />
        </div>

        {currentUnits.length === 0 ? (
          <p className="text-gray-400">Tidak ada unit yang tersedia.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-600 text-sm">
              <thead>
                <tr className="bg-[#333] text-gray-300">
                  <th className="border border-gray-600 px-3 py-2 text-left">
                    Nama
                  </th>
                  <th className="border border-gray-600 px-3 py-2 text-left">
                    Singkatan
                  </th>
                  <th className="border border-gray-600 px-3 py-2 text-left">
                    Base Unit
                  </th>
                  <th className="border border-gray-600 px-3 py-2 text-left">
                    Konversi
                  </th>
                  <th className="border border-gray-600 px-3 py-2 text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUnits.map((unit) => (
                  <tr
                    key={unit._id}
                    className="border-t border-gray-700 hover:bg-[#333]/50"
                  >
                    <td className="border border-gray-600 px-3 py-2">
                      {unit.name}
                    </td>
                    <td className="border border-gray-600 px-3 py-2">
                      {unit.short}
                    </td>
                    <td className="border border-gray-600 px-3 py-2">
                      {unit.baseUnit?.name || "-"}
                    </td>
                    <td className="border border-gray-600 px-3 py-2">
                      {unit.conversion}
                    </td>
                    <td className="border border-gray-600 px-3 py-2 text-center flex gap-2 justify-center">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleEdit(unit)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(unit._id)}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
              {/* Info jumlah data */}
              <div className="text-gray-400 text-sm">
                {filteredUnits.length > 0 && (
                  <span>
                    Menampilkan{" "}
                    <b>{indexOfFirstItem + 1}</b>–
                    <b>
                      {indexOfLastItem > filteredUnits.length
                        ? filteredUnits.length
                        : indexOfLastItem}
                    </b>{" "}
                    dari <b>{filteredUnits.length}</b> unit
                  </span>
                )}
              </div>

              {/* Items per page */}
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
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "text-gray-300"
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
          <AddUnitModal
            isOpen={openAddModal}
            onClose={() => setOpenAddModal(false)}
            onAdded={handleUpdateSuccess}
          />
        )}

        {openEditModal && selectedUnit && (
          <EditUnitModal
            isOpen={openEditModal}
            unit={selectedUnit}
            onClose={() => setOpenEditModal(false)}
            onUpdated={handleUpdateSuccess}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Unit;
