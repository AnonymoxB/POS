import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { updateProduct, getProductCategories, getUnits } from "../../../https";

const EditProductModal = ({ isOpen, onClose, product }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    category: "",
    defaultUnit: "",
    price: 0,
    density:"",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product?.name || "",
        category: product?.category?._id || product?.category || "",
        defaultUnit: product?.defaultUnit?._id || product?.defaultUnit || "",
        price: product?.price || 0,
        density: product?.density ?? "",
      });
    }
  }, [product]);

  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getProductCategories,
  });
  const categories = categoriesRes?.data?.data || [];

  const { data: unitsRes } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });
  const units = unitsRes?.data || [];

  const mutation = useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    onSuccess: () => {
      enqueueSnackbar("Produk berhasil diperbarui", { variant: "success" });
      queryClient.invalidateQueries(["products"]);
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(err.message || "Gagal memperbarui produk", {
        variant: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      id: product._id,
      data: { ...form, price: Number(form.price) },
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#262626] p-6 rounded-xl shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Edit Produk
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nama produk"
            className="p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <select
            className="p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            value={form.category || ""}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            value={form.defaultUnit || ""}
            onChange={(e) => setForm({ ...form, defaultUnit: e.target.value })}
            required
          >
            <option value="">Pilih unit</option>
            {units.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.short})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Harga"
            className="p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Density (g/ml, opsional)"
            className="p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            value={form.density}
            onChange={(e) => setForm({ ...form, density: e.target.value })}
          />

          <div className="flex justify-end gap-2 mt-2">
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
              disabled={mutation.isLoading}
            >
              {mutation.isLoading ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
