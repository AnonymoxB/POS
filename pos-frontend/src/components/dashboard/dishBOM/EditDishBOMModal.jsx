import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { updateDishBOM, getProducts, getUnits } from "../../../https";

const EditDishBOMModal = ({ item, isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    product: "",
    qty: 1,
    unit: "",
    variant: "ice",
  });

  // 🔄 Load data ketika modal terbuka
  useEffect(() => {
    if (isOpen && item) {
      setForm({
        product: item.product?._id || "",
        qty: item.qty || 1,
        unit: item.unit?._id || item.unit || "",
        variant: item.variant || "ice",
      });

      getProducts()
        .then((res) => setProducts(res.data || []))
        .catch((err) => console.error("❌ Gagal load products:", err));

      getUnits()
        .then((res) => setUnits(res.data?.data || res.data || []))
        .catch((err) => console.error("❌ Gagal load units:", err));
    }
  }, [isOpen, item]);

  // 🔑 Mutation Update Dish BOM
  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => updateDishBOM(item._id, data),
    onSuccess: () => {
      enqueueSnackbar("Bahan berhasil diperbarui ✅", { variant: "success" });
      queryClient.invalidateQueries(["dish-bom", item.dish]);
      handleClose();
    },
    onError: (err) => {
      console.error("❌ Update BOM Error:", err);
      enqueueSnackbar(err?.response?.data?.message || "Gagal mengedit bahan", {
        variant: "error",
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
  };

  const handleClose = () => {
    setForm({ product: "", qty: 1, unit: "", variant: "ice" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#262626] text-gray-900 dark:text-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Edit Bahan {item?.product?.name}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product */}
          <select
            value={form.product}
            onChange={(e) => setForm({ ...form, product: e.target.value })}
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            required
            disabled={isLoading}
          >
            <option value="" disabled>
              -- pilih bahan --
            </option>
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
            onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            required
            disabled={isLoading}
            min="1"
          />

          {/* Unit */}
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            required
            disabled={isLoading}
          >
            <option value="" disabled>
              -- pilih unit --
            </option>
            {units.map((u) => (
              <option key={u._id || u.id} value={u._id || u.id}>
                {u.name || u.unitName} ({u.short || u.symbol})
              </option>
            ))}
          </select>

          {/* Variant */}
          <select
            value={form.variant}
            onChange={(e) => setForm({ ...form, variant: e.target.value })}
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            required
            disabled={isLoading}
          >
            <option value="hot">Hot</option>
            <option value="ice">Ice</option>
          </select>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="bg-gray-400 dark:bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-500 dark:hover:bg-gray-700"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white"
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
