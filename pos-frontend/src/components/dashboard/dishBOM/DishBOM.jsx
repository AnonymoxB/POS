import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import AddDishBOMModal from "./AddDishBOMModal";
import EditDishBOMModal from "./EditDishBOMModal";

export default function DishBOMList({ dish, open, onClose }) {
  const [bom, setBOM] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadBOM = () => {
    fetch(`/api/dish-bom/${dish._id}`)
      .then((res) => res.json())
      .then((data) => {
        setBOM(data.data || []);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (open && dish?._id) {
      loadBOM();
    }
  }, [open, dish]);

  const deleteItem = async (id) => {
    if (!confirm("Yakin hapus bahan ini?")) return;
    await fetch(`/api/dish-bom/${id}`, { method: "DELETE" });
    loadBOM();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#262626] text-white rounded-lg p-6 w-full max-w-3xl">
        <h2 className="text-lg font-bold mb-4">BOM untuk {dish?.name}</h2>

        {/* Tabel BOM */}
        <table className="w-full border-collapse border border-gray-600 text-sm mb-4">
          <thead>
            <tr className="bg-[#333] text-gray-300">
              <th className="border border-gray-600 px-3 py-2 text-left">Bahan</th>
              <th className="border border-gray-600 px-3 py-2 text-right">Qty</th>
              <th className="border border-gray-600 px-3 py-2 text-left">Unit</th>
              <th className="border border-gray-600 px-3 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : bom.length > 0 ? (
              bom.map((item) => (
                <tr key={item._id} className="border-t border-gray-700">
                  <td className="border border-gray-600 px-3 py-2">{item.product?.name}</td>
                  <td className="border border-gray-600 px-3 py-2 text-right">{item.qty}</td>
                  <td className="border border-gray-600 px-3 py-2">{item.unit?.short || item.unit}</td>
                  <td className="border border-gray-600 px-3 py-2 text-center">
                    <Button
                      size="sm"
                      className="bg-yellow-600 hover:bg-yellow-700 mr-2"
                      onClick={() => setEditItem(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => deleteItem(item._id)}
                    >
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-400">
                  Belum ada bahan
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between">
          <Button className="bg-green-600 hover:bg-green-700" onClick={() => setAddOpen(true)}>
            Tambah Bahan
          </Button>
          <Button className="bg-gray-600 hover:bg-gray-700" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>

      {/* Modal Tambah */}
      {addOpen && (
        <AddDishBOMModal
          dish={dish}
          onClose={() => {
            setAddOpen(false);
            loadBOM();
          }}
        />
      )}

      {/* Modal Edit */}
      {editItem && (
        <EditDishBOMModal
          item={editItem}
          onClose={() => {
            setEditItem(null);
            loadBOM();
          }}
        />
      )}
    </div>
  );
}
