import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function EditDishBOMModal({ item, onClose }) {
  const [form, setForm] = useState({
    product: item.product?._id || "",
    qty: item.qty || 1,
    unit: item.unit?.short || item.unit || "",
  });

  const updateItem = async () => {
    await fetch(`/api/dish-bom/${item._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#262626] text-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Edit Bahan</h2>

        <input
          type="number"
          className="bg-[#333] text-white border border-gray-600 rounded p-2 mb-2 w-full"
          value={form.qty}
          onChange={(e) => setForm({ ...form, qty: e.target.value })}
        />

        <input
          type="text"
          className="bg-[#333] text-white border border-gray-600 rounded p-2 mb-4 w-full"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />

        <div className="flex justify-end gap-2">
          <Button className="bg-gray-600 hover:bg-gray-700" onClick={onClose}>
            Batal
          </Button>
          <Button className="bg-yellow-600 hover:bg-yellow-700" onClick={updateItem}>
            Update
          </Button>
        </div>
      </div>
    </div>
  );
}
