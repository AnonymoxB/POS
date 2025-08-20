import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getUnits, deleteUnit } from "../../https";
import AddUnitModal from "./AddUnitModal";
import EditUnitModal from "./EditUnitModal";

const Unit = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

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


  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg max-h-[700px]">
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">Daftar Unit</h2>
        <button
          onClick={() => setOpenAddModal(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          + Tambah Unit
        </button>
      </div>

      {units.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada unit yang tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-hide rounded-md">
            <table className="w-full text-left text-[#f5f5f5]">
              <thead className="bg-[#333] text-[#ababab] sticky top-0 z-10">
                <tr>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Singkatan</th>
                  <th className="p-3">Base Unit</th>
                  <th className="p-3">Konversi</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr
                    key={unit._id}
                    className="border-b border-gray-700 hover:bg-[#333]"
                  >
                    <td className="p-4">{unit.name}</td>
                    <td className="p-4">{unit.short}</td>
                    <td className="p-4">{unit.baseUnit?.name || "-"}</td>
                    <td className="p-4">{unit.conversion}</td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(unit)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(unit._id)}
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
    </div>
  );
};

export default Unit;
