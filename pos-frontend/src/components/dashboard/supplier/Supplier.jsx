import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getSuppliers, deleteSupplier } from "../../../https";
import AddSupplierModal from "./AddSupplierModal";
import EditSupplierModal from "./EditSupplierModal";

const Supplier = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editData, setEditData] = useState(null);

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
      enqueueSnackbar(err?.response?.data?.message || "Gagal menghapus supplier", {
        variant: "error",
      });
    },
  });

  if (isLoading) return <p className="text-[#ababab]">Loading...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data supplier</p>;

  const suppliers = data?.data?.data || [];

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg max-h-[700px]">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">Daftar Supplier</h2>
        <button
          onClick={() => setOpenAddModal(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          + Tambah Supplier
        </button>
      </div>

      {suppliers.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada supplier tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[#f5f5f5]">
            <thead className="bg-[#333] text-[#ababab] sticky top-0 z-10">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Telepon</th>
                <th className="p-3">Alamat</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr
                  key={s._id}
                  className="border-b border-gray-700 hover:bg-[#333]"
                >
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.phone || "-"}</td>
                  <td className="p-3">{s.address || "-"}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => setEditData(s)}
                      className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(s._id)}
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
    </div>
  );
};

export default Supplier;
