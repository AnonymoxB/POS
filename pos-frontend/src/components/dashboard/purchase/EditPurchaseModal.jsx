import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getUnits, getProducts, getSuppliers, updatePurchase } from "../../../https";
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

const EditPurchaseModal = ({ isOpen, onClose, purchase }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: units } = useQuery({ queryKey: ["units"], queryFn: getUnits });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: getProducts });
  const { data: suppliers } = useQuery({ queryKey: ["suppliers"], queryFn: getSuppliers });

  const [supplier, setSupplier] = useState(null);
  const [items, setItems] = useState([]);

  const qtyRefs = useRef([]);

  // isi data awal ketika modal dibuka
  useEffect(() => {
    if (purchase) {
      setSupplier(
        purchase.supplier
          ? { value: purchase.supplier._id || purchase.supplier, label: purchase.supplier.name || purchase.supplier }
          : null
      );

      setItems(
        purchase.items?.map((item) => ({
          product: item.product
            ? { value: item.product._id || item.product, label: item.product.name || "" }
            : null,
          quantity: item.quantity,
          unit: item.unit?._id || item.unit,
          price: item.price,
          total: (item.quantity || 0) * (item.price || 0),
        })) || []
      );
    }
  }, [purchase]);

  const { mutate, isLoading } = useMutation({
    mutationFn: (data) => updatePurchase(purchase._id, data),
    onSuccess: () => {
      enqueueSnackbar("Purchase berhasil diperbarui", { variant: "success" });
      queryClient.invalidateQueries(["purchases"]);
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || "Gagal update purchase", { variant: "error" });
    },
  });

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    if (field === "quantity" || field === "price") {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].total = qty * price;
    }

    setItems(newItems);
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const payload = {
  supplier: supplier?.value || supplier,
  items: items.map(i => ({
    product: i.product?.value || i.product,
    quantity: Number(i.quantity) || 0,
    unit: i.unit?.value || i.unit,
    price: Number(i.price) || 0,
    total: (Number(i.quantity) || 0) * (Number(i.price) || 0),
    qtyBase: Number(i.quantity) || 0,
  })),
  grandTotal: items.reduce(
    (sum, it) => sum + ((Number(it.quantity) || 0) * (Number(it.price) || 0)),
    0
  ),
};

console.log("🚀 PAYLOAD UPDATE:", JSON.stringify(payload, null, 2));
mutate(payload);

};




  const grandTotal = items.reduce((sum, i) => sum + (i.total || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#262626] p-6 rounded-xl w-[700px] shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-white">Edit Purchase</h2>
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
                Rp {item.total?.toLocaleString("id-ID")}
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

          {/* Tambah barang */}
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

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md disabled:opacity-50"
            >
              {isLoading ? "Menyimpan..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPurchaseModal;
