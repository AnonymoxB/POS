import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { updateSupplier } from "../../../https";

const EditSupplierModal = ({ isOpen, onClose, supplier }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });
    }
  }, [supplier]);

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => updateSupplier(supplier._id, data),
    onSuccess: () => {
      enqueueSnackbar("Supplier berhasil diperbarui", { variant: "success" });
      queryClient.invalidateQueries(["suppliers"]);
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(
        err?.response?.data?.message || "Gagal memperbarui supplier",
        { variant: "error" }
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
  };

  if (!isOpen || !supplier) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#262626] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Supplier
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nama Supplier"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white placeholder-gray-400"
            required
          />
          <input
            type="text"
            placeholder="Nomor Telepon"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white placeholder-gray-400"
          />
          <textarea
            placeholder="Alamat"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white placeholder-gray-400"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 px-4 py-2 rounded text-gray-900 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSupplierModal;
