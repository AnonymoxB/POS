import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { addProduct, getCategories, getUnits } from "../../../https";

const AddProductModal = ({ isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    category: "",
    defaultUnit: "",
    price: 0,
  });

  // ambil data categories
  const { data: categoriesRes } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // ambil data units
  const { data: unitsRes } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });

  // pastikan array
  const categories = categoriesRes?.data || [];
  const units = unitsRes?.data || [];

  const mutation = useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      enqueueSnackbar("Produk berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["products"]);
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(err.message || "Gagal menambahkan produk", {
        variant: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-[#262626] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold text-white mb-4">Tambah Produk</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nama produk"
            className="p-2 rounded bg-[#333] text-white"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <select
            className="p-2 rounded bg-[#333] text-white"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="">Pilih kategori</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            className="p-2 rounded bg-[#333] text-white"
            value={form.defaultUnit}
            onChange={(e) =>
              setForm({ ...form, defaultUnit: e.target.value })
            }
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
            className="p-2 rounded bg-[#333] text-white"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
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

export default AddProductModal;
