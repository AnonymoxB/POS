import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductCategory } from "../../../https";
import { useSnackbar } from "notistack";

const AddProductCategoryModal = ({ isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  const { mutate } = useMutation({
    mutationFn: createProductCategory,
    onSuccess: () => {
      enqueueSnackbar("Kategori produk berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["product-categories"]);
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Gagal menambahkan kategori produk", { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ name });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-[#262626] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-white mb-4">Tambah Kategori Produk</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nama kategori"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 rounded bg-[#333] text-white"
            required
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductCategoryModal;
