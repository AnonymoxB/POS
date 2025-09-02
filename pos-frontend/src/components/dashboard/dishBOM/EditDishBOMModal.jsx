import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { updateDishBOM, getProducts, getUnits } from "../../../https";

const EditDishBOMModal = ({ item, isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({ product: "", qty: 1, unit: "", variant: "ice" });

  // 🔹 Load products & units saat modal terbuka
  useEffect(() => {
    if (isOpen && item) {
      setForm({
        product: item.product?._id || "",
        qty: item.qty || 1,
        unit: item.unit?._id || item.unit || "",
        variant: item.variant || "ice",
      });

      getProducts()
        .then((res) => setProducts(res.data || res || []))
        .catch((err) => console.error("Error load products:", err));

      getUnits()
        .then((res) => setUnits(res.data?.data || res.data || []))
        .catch((err) => console.error("Error load units:", err));
    }
  }, [isOpen, item]);

  // 🔹 Mutation untuk update BOM
  const { mutate, isLoading } = useMutation({
    mutationFn: async () => updateDishBOM(item._id, form),
    onSuccess: () => {
      enqueueSnackbar("Bahan berhasil diperbarui", { variant: "success" });
      queryClient.invalidateQueries(["dish-bom", item.dish]);
      onClose(true);
    },
    onError: (err) => {
      enqueueSnackbar(err?.message || "Gagal mengedit bahan", { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#262626] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-semibold text-white mb-4">
          Edit Bahan {item?.product?.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product */}
          <select
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
            className="w-full p-2 rounded bg-[#333] text-white"
            required
          >
            <option value="">-- pilih bahan --</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Qty */}
          <input
            type="number"
            value={form.qty}
            onChange={(e) => setForm({ ...form, qty: e.target.value })}
            className="w-full p-2 rounded bg-[#333] text-white"
            required
          />

          {/* Unit */}
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="w-full p-2 rounded bg-[#333] text-white"
            required
          >
            <option value="">-- pilih unit --</option>
            {units.map((u) => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.name || u.unitName} ({u.short || u.symbol})
              </option>
            ))}
          </select>

          {/* Variant */}
          <select
            value={form.variant || ""}
            onChange={(e) => setForm({ ...form, variant: e.target.value })}
            className="w-full p-2 rounded bg-[#333] text-white"
            required
          >
            <option value="">-- pilih variant --</option>
            <option value="hot">Hot</option>
            <option value="ice">Ice</option>
          </select>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-600 px-4 py-2 rounded text-white hover:bg-yellow-700"
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDishBOMModal;
