import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getUnits, getProducts, updatePurchase } from "../../../https";
import { toast } from "sonner";

const EditPurchaseModal = ({ isOpen, onClose, purchase }) => {
  const queryClient = useQueryClient();

  const { data: units } = useQuery({ queryKey: ["units"], queryFn: getUnits });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: getProducts });

  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
  if (purchase) {
    setSupplier(
      typeof purchase.supplier === "object"
        ? purchase.supplier.name || ""
        : purchase.supplier || ""
    );

    setItems(
      purchase.items?.map((item) => ({
        product: item.product?._id || item.product,
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
      toast.success("Purchase berhasil diperbarui");
      queryClient.invalidateQueries(["purchases"]);
      onClose();
    },
    onError: () => {
      toast.error("Gagal update purchase");
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
    mutate({ supplier, items });
  };

  const totalPurchase = items.reduce((sum, i) => sum + (i.total || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-[#262626] p-6 rounded-xl w-[650px] shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-white">Edit Purchase</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            className="px-3 py-2 rounded bg-[#333] text-white"
            required
          />

          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2">
              <select
                value={item.product}
                onChange={(e) => handleItemChange(idx, "product", e.target.value)}
                className="px-3 py-2 rounded bg-[#333] text-white flex-1"
                required
              >
                <option value="">Pilih Produk</option>
                {products?.data?.data?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Qty"
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
                {units?.data?.data?.map((u) => (
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

              <span className="w-24 text-white text-right self-center">
                {item.total?.toLocaleString()}
              </span>
            </div>
          ))}

          <div className="flex justify-between items-center text-white mt-4">
            <span className="font-semibold">Total:</span>
            <span className="font-bold text-lg">
              {totalPurchase.toLocaleString()}
            </span>
          </div>

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
