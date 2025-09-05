import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { addDishBOM, getProducts, getUnits } from "../../../https";

const AddDishBOMModal = ({ dish, isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [form, setForm] = useState({
    product: "",
    qty: 1,
    unit: "",
    variant: "ice",
  });

  // Load products & units saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      getProducts()
        .then((res) => setProducts(res.data || []))
        .catch((err) => console.error("Error load products:", err));

      getUnits()
        .then((res) => setUnits(res.data?.data || res.data || []))
        .catch((err) => console.error("Error load units:", err));
    }
  }, [isOpen]);

  // Filter unit berdasarkan produk yang dipilih
  useEffect(() => {
    if (!form.product || !units.length) {
      setFilteredUnits([]);
      return;
    }

    const selectedProduct = products.find((p) => p._id === form.product);
    if (!selectedProduct) return;

    const validUnits = [];
    const findUnits = (unitId) => {
      const u = units.find((x) => x._id === unitId);
      if (u) {
        validUnits.push(u);
        if (u.baseUnit) findUnits(u.baseUnit);
      }
    };

    findUnits(selectedProduct.unit);
    setFilteredUnits(validUnits);
    setForm((f) => ({ ...f, unit: "" })); // reset unit jika produk ganti
  }, [form.product, units, products]);

  // Mutation
  const { mutate, isLoading } = useMutation({
    mutationFn: async () => addDishBOM(dish._id, form),
    onSuccess: () => {
      enqueueSnackbar("Bahan berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["dish-bom", dish._id]);
      handleClose();
    },
    onError: (err) => {
      enqueueSnackbar(err?.message || "Gagal menambah bahan", {
        variant: "error",
      });
    },
  });

  // Reset form + close modal
  const handleClose = () => {
    setForm({ product: "", qty: 1, unit: "", variant: "ice" });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#262626] text-gray-900 dark:text-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4">
          Tambah Bahan untuk {dish?.name}
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
            onChange={(e) =>
              setForm({ ...form, qty: Number(e.target.value) })
            }
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            required
            disabled={isLoading}
            min="0"
          />

          {/* Unit */}
          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
            className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
            required
            disabled={isLoading || !filteredUnits.length}
          >
            <option value="" disabled>
              -- pilih unit --
            </option>
            {filteredUnits.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.short})
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
            <option value="" disabled>
              -- pilih variant --
            </option>
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
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDishBOMModal;
