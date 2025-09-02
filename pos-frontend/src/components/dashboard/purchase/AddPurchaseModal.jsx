import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getUnits, getProducts, getSuppliers, createPurchase } from "../../../https";
import { useSnackbar } from "notistack";
import Select from "react-select";

const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#333",
    borderColor: "#555",
    color: "#fff",
    minHeight: "42px",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#262626",
    color: "#fff",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? "#444" : "#262626",
    color: "#fff",
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  input: (provided) => ({
    ...provided,
    color: "#fff",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#aaa",
  }),
};

const AddPurchaseModal = ({ isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: units } = useQuery({ queryKey: ["units"], queryFn: getUnits });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: getSuppliers });

  const [supplier, setSupplier] = useState(null);
  const [items, setItems] = useState([
    { product: null, quantity: 1, unit: "", price: 0, total: 0 },
  ]);

  // refs untuk auto fokus ke qty terakhir
  const qtyRefs = useRef([]);

  useEffect(() => {
    if (qtyRefs.current.length > 0) {
      const lastRef = qtyRefs.current[qtyRefs.current.length - 1];
      if (lastRef) lastRef.focus();
    }
  }, [items.length]);

  const { mutate } = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      enqueueSnackbar("Purchase berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["purchases"]);
      onClose();
    },
    onError: (err) => {
      console.error("Error createPurchase:", err.response?.data || err.message);
      enqueueSnackbar(
        err.response?.data?.message || "Gagal menambahkan purchase",
        { variant: "error" }
      );
    },
  });

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "quantity" || field === "price") {
      newItems[index].total =
        (parseFloat(newItems[index].quantity) || 0) *
        (parseFloat(newItems[index].price) || 0);
    }

    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const unitList = units?.data?.data || units?.data || [];

    const payload = {
      supplier: supplier?.value,
      items: items.map((i) => {
        const selectedUnit = unitList.find((u) => u._id === i.unit);

        return {
          product: i.product?.value,
          quantity: Number(i.quantity) || 0,
          unit: i.unit,
          price: Number(i.price) || 0,
          total: Number(i.total) || 0,
          unitBase: selectedUnit?._id || i.unit,
          qtyBase: Number(i.quantity) || 0,
        };
      }),
    };

    if (!payload.supplier) {
      enqueueSnackbar("Supplier wajib dipilih", { variant: "warning" });
      return;
    }
    if (payload.items.some((i) => !i.product || !i.unit)) {
      enqueueSnackbar("Produk & Unit wajib dipilih", { variant: "warning" });
      return;
    }

    mutate(payload);
  };

  const grandTotal = items.reduce((sum, i) => sum + (i.total || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#262626] p-6 rounded-lg w-[700px]">
        <h2 className="text-lg font-bold mb-4 text-white">Tambah Purchase</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Supplier */}
          <Select
            value={supplier}
            onChange={setSupplier}
            options={suppliers?.data?.data?.map((s) => ({
              value: s._id,
              label: s.name,
            }))}
            placeholder="Cari Supplier..."
            styles={customSelectStyles}
            isSearchable
          />

          {/* Items */}
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              {/* Produk */}
              <div className="flex-1">
                <Select
                  value={item.product}
                  onChange={(val) => handleItemChange(idx, "product", val)}
                  options={products?.data?.map((p) => ({
                    value: p._id,
                    label: p.name,
                  }))}
                  placeholder="Cari Produk..."
                  styles={customSelectStyles}
                  isSearchable
                />
              </div>

              <input
                type="number"
                placeholder="Qty"
                ref={(el) => (qtyRefs.current[idx] = el)}
                value={item.quantity}
                onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                className="w-20 px-3 py-2 rounded bg-[#333] text-white"
              />

              <select
                value={item.unit}
                onChange={(e) => handleItemChange(idx, "unit", e.target.value)}
                className="px-3 py-2 rounded bg-[#333] text-white"
                required
              >
                <option value="">Unit</option>
                {units?.data?.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.short}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Harga"
                value={item.price}
                onChange={(e) => handleItemChange(idx, "price", e.target.value)}
                className="w-24 px-3 py-2 rounded bg-[#333] text-white"
              />

              <span className="w-28 text-white text-right self-center">
                Rp {item.total.toLocaleString("id-ID")}
              </span>

              {/* Hapus row */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="text-red-400 hover:text-red-600 px-2"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Tombol tambah barang */}
          <button
            type="button"
            onClick={() =>
              setItems([
                ...items,
                { product: null, quantity: 1, unit: "", price: 0, total: 0 },
              ])
            }
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
          >
            + Tambah Barang
          </button>

          {/* Grand total */}
          <div className="flex justify-end mt-4 text-lg font-semibold text-white">
            Total: Rp {grandTotal.toLocaleString("id-ID")}
          </div>

          {/* Action button */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseModal;
