import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getUnits, getProducts, createPurchase } from "../../../https";
import { useSnackbar } from "notistack";

const AddPurchaseModal = ({ isOpen, onClose }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const { data: units } = useQuery({ queryKey: ["units"], queryFn: getUnits });
  const { data: products } = useQuery({ queryKey: ["products"], queryFn: getProducts });

  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState([
    { product: "", quantity: 1, unit: "", price: 0, total: 0 },
  ]);

  const { mutate } = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      enqueueSnackbar("Purchase berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["purchases"]);
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Gagal menambahkan purchase", { variant: "error" });
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
    mutate({ supplier, items });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#262626] p-6 rounded-lg w-[600px]">
        <h2 className="text-lg font-bold mb-4 text-white">Tambah Purchase</h2>
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
                onChange={(e) =>
                  handleItemChange(idx, "product", e.target.value)
                }
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
                onChange={(e) =>
                  handleItemChange(idx, "quantity", e.target.value)
                }
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
                onChange={(e) =>
                  handleItemChange(idx, "price", e.target.value)
                }
                className="w-24 px-3 py-2 rounded bg-[#333] text-white"
              />
              <span className="w-24 text-white text-right self-center">
                {item.total}
              </span>
            </div>
          ))}

          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseModal;
