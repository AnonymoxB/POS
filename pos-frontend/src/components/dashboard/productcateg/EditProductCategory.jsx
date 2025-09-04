import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductCategory } from "../../../https";
import { useSnackbar } from "notistack";

const EditProductCategoryModal = ({ isOpen, onClose, category }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (category) setName(category.name || "");
  }, [category]);

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ id, data }) => updateProductCategory(id, data),
    onSuccess: () => {
      enqueueSnackbar("Kategori produk berhasil diperbarui", { variant: "success" });
      queryClient.invalidateQueries(["product-categories"]);
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Gagal memperbarui kategori produk", { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({ id: category._id, data: { name } });
  };

  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-[#262626] p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Edit Kategori Produk
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductCategoryModal;
