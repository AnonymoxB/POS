import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function AddDishBOMModal({ dish, onClose }) {
  const [products, setProducts] = useState([]);
  const [newItem, setNewItem] = useState({ product: "", qty: 1, unit: "" });

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.data || []));
  }, []);

  const addItem = async () => {
    await fetch("/api/dish-bom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dish: dish._id, ...newItem }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#262626] text-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Tambah Bahan untuk {dish?.name}</h2>

        <select
          className="bg-[#333] text-white border border-gray-600 rounded p-2 mb-2 w-full"
          value={newItem.product}
          onChange={(e) => setNewItem({ ...newItem, product: e.target.value })}
        >
          <option value="">-- pilih bahan --</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="bg-[#333] text-white border border-gray-600 rounded p-2 mb-2 w-full"
          value={newItem.qty}
          onChange={(e) => setNewItem({ ...newItem, qty: e.target.value })}
        />

        <input
          type="text"
          className="bg-[#333] text-white border border-gray-600 rounded p-2 mb-4 w-full"
          placeholder="Unit"
          value={newItem.unit}
          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
        />

        <div className="flex justify-end gap-2">
          <Button className="bg-gray-600 hover:bg-gray-700" onClick={onClose}>
            Batal
          </Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={addItem}>
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
