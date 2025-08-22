import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

const AddDishBOMModal = ({ dish, isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({ product: "", qty: 1, unit: "" });

  useEffect(() => {
    if (isOpen) {
      fetch("/api/product")
        .then((res) => res.json())
        .then((data) => setProducts(data.data || []));

      fetch("/api/unit")
        .then((res) => res.json())
        .then((data) => {
            console.log("Units API result:", data);
            setUnits(data.data || data || []);
          });
    }
  }, [isOpen]);

  const { mutate, isLoading } = useMutation({
    mutationFn: async () => {
      return await fetch(`/api/dish-bom/${dish._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }).then((res) => {
        if (!res.ok) throw new Error("Gagal menambah bahan");
        return res.json();
      });
    },
    onSuccess: () => {
      enqueueSnackbar("Bahan berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["dish-bom", dish._id]);
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(err?.message || "Gagal menambah bahan", {
        variant: "error",
      });
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
          Tambah Bahan untuk {dish?.name}
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
              className="bg-green-600 px-4 py-2 rounded text-white hover:bg-green-700"
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
