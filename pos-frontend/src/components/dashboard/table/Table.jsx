import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getTables, deleteTable } from "../../../https";
import AddTableModal from "./AddTableModal";
import EditTableModal from "./EditTableModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input"

const Table = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // search & pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch tables
  const { data, isLoading, isError } = useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
  });

  // Mutation delete
  const { mutate: removeTable } = useMutation({
    mutationFn: deleteTable,
    onSuccess: () => {
      enqueueSnackbar("Meja berhasil dihapus", { variant: "success" });
      queryClient.invalidateQueries(["tables"]);
    },
    onError: () => {
      enqueueSnackbar("Gagal menghapus meja", { variant: "error" });
    },
  });

  const handleDelete = (id) => {
    enqueueSnackbar("Yakin ingin menghapus meja ini?", {
      variant: "warning",
      action: (key) => (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                removeTable(id);
              } catch {
                enqueueSnackbar("Gagal menghapus meja", { variant: "error" });
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

  const handleEdit = (table) => {
    setSelectedTable(table);
    setOpenEditModal(true);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries(["tables"]);
  };

  if (isLoading) return <p className="text-[#ababab]">Loading...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data meja</p>;

  
  const tables = data?.data?.data || [];

  
 const filteredTables = tables.filter((p) =>
  (p?.name || "").toLowerCase().includes((searchTerm || "").toLowerCase())
);



  // pagination calculation
  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTables.slice(indexOfFirstItem, indexOfLastItem);

  // fungsi untuk pagination dengan ellipsis
  const getPagination = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
      }
    }
    return pages;
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <Card className="bg-[#262626] text-white">
      <CardContent className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">Daftar Meja</h2>
          <Button
            onClick={() => setOpenAddModal(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            + Tambah Meja
          </Button>
      </div>
      <div className="mb-4">
          <Input
            type="text"
            placeholder="Cari no meja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md bg-[#333] px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
          />
      </div>

      {filteredTables.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada meja yang tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          
            <table className="w-full border-collapse border border-gray-600 text-sm">
              <thead>
                <tr className="bg-[#333] text-gray-300">
                  <th className="border border-gray-600 px-3 py-2 text-center">No</th>
                  <th className="border border-gray-600 px-3 py-2 text-center">No Meja</th>
                  <th className="border border-gray-600 px-3 py-2 text-center">Jumlah Kursi</th>
                  <th className="border border-gray-600 px-3 py-2 text-center">Status</th>
                  <th className="border border-gray-600 px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {currentItems.map((table, idx) => (
                  <tr
                    key={table._id}
                    className="border-b border-gray-700 hover:bg-[#333]"
                  >
                    <td className="p-4 text-center">{indexOfFirstItem + idx + 1}</td>
                    <td className="border border-gray-600 px-3 py-2 text-center">{table.tableNo}</td>
                    <td className="border border-gray-600 px-3 py-2 text-center">{table.seats}</td>
                    <td className="border border-gray-600 px-3 py-2 text-center">{table.status || "-"}</td>
                    <td className="p-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(table)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(table._id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            {/* Info jumlah data */}
            <div className="text-gray-400 text-sm">
              {filteredTables.length > 0 && (
                <span>
                  Menampilkan <b>{indexOfFirstItem + 1}</b>–
                  <b>
                    {indexOfLastItem > filteredTables.length
                      ? filteredTables.length
                      : indexOfLastItem}
                  </b>{" "}
                  dari <b>{filteredTables.length}</b> meja
                </span>
              )}
            </div>

            {/* Dropdown items per page */}
            <div className="flex items-center gap-2 text-gray-300">
              <label htmlFor="itemsPerPage">Tampilkan</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-[#333] text-white border border-gray-600 rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per halaman</span>
            </div>

            {/* Numbered Pagination with Ellipsis */}
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

      {openAddModal && (
        <AddTableModal
          isOpen={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onAdded={handleUpdateSuccess}
        />
      )}

      {openEditModal && selectedTable && (
        <EditTableModal
          isOpen={openEditModal}
          table={selectedTable}
          onClose={() => setOpenEditModal(false)}
          onUpdated={handleUpdateSuccess}
        />
      )}
      </CardContent>
    </Card>
  );
};

export default Table;
