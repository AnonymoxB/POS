import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getTables, deleteTable } from "../../https";
import AddTableModal from "./AddTableModal";
import EditTableModal from "./EditTableModal";

const Table = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

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

  useEffect(() => {
    // Jika perlu load ulang atau efek lain bisa ditambahkan
  }, []);

  if (isLoading) return <p className="text-[#ababab]">Loading...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data meja</p>;

  const tables = data?.data?.data || [];

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg max-h-[700px]">
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">Daftar Meja</h2>
        <button
          onClick={() => setOpenAddModal(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          + Tambah Meja
        </button>
      </div>

      {tables.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada meja yang tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-hide rounded-md">
            <table className="w-full text-left text-[#f5f5f5]">
              <thead className="bg-[#333] text-[#ababab] sticky top-0 z-10">
                <tr>
                  <th className="p-3">No Meja</th>
                  <th className="p-3">Jumlah Kursi</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <tr
                    key={table._id}
                    className="border-b border-gray-700 hover:bg-[#333]"
                  >
                    <td className="p-4">{table.tableNo}</td>
                    <td className="p-4">{table.seats}</td>
                    <td className="p-4">{table.status || "-"}</td>
                    <td className="p-4 flex gap-2">
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
    </div>
  );
};

export default Table;
