import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductCategory } from "../../../https";
import { useSnackbar } from "notistack";

const EditProductCategoryModal = ({ isOpen, onClose, category }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  useEffect(() => {
    if (category) setName(category.name);
  }, [category]);

  const { mutate } = useMutation({
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-[#262626] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-white mb-4">Edit Kategori Produk</h2>
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
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductCategoryModal;
