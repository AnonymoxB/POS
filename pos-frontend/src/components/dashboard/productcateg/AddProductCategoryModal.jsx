import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductCategory } from "../../../https";
import { useSnackbar } from "notistack";

const AddProductCategoryModal = ({ isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { mutate, isLoading } = useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      enqueueSnackbar("Kategori produk berhasil ditambahkan", {
        variant: "success",
      });
      queryClient.invalidateQueries(["product-categories"]);
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Gagal menambahkan kategori produk", {
        variant: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ name });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-[#262626] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Tambah Kategori Produk
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nama kategori"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white placeholder-gray-400"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-70"
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductCategoryModal;
