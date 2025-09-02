import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import AddDishBOMModal from "./AddDishBOMModal";
import EditDishBOMModal from "./EditDishBOMModal";
import { getDishBOMs, deleteDishBOM } from "../../../https";

export default function DishBOM({ dish, open, onClose }) {
  const [bom, setBOM] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadBOM = useCallback(async () => {
    if (!dish?._id) return;
    setLoading(true);
    try {
      const res = await getDishBOMs(dish._id);
      setBOM(res.data?.data || []);
    } catch (err) {
      console.error("Gagal load BOM:", err);
      setBOM([]);
    } finally {
      setLoading(false);
    }
  }, [dish?._id]);

  // Reload BOM saat modal dibuka atau dish berubah
  useEffect(() => {
    if (open && dish?._id) loadBOM();
  }, [open, dish, loadBOM]);

  const handleDelete = async (id) => {
    if (!confirm("Yakin hapus bahan ini?")) return;
    setDeletingId(id);
    try {
      await deleteDishBOM(id);
      await loadBOM();
    } catch (err) {
      console.error("Gagal hapus BOM:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#262626] text-white rounded-lg p-6 w-full max-w-3xl shadow-lg">
        <h2 className="text-lg font-bold mb-4">BOM untuk {dish?.name}</h2>

        <div className="overflow-x-auto rounded border border-gray-700 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#333] text-gray-300">
                <th className="px-3 py-2 text-left">Bahan</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-left">Unit</th>
                <th className="px-3 py-2 text-left">Variant</th>
                <th className="px-3 py-2 text-right">HPP</th>
                <th className="px-3 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : bom.length > 0 ? (
                bom.map((item, idx) => {
                  const hpp = Number(item.product?.hpp) || 0;
                  const conversion = Number(item.unit?.conversion) || 1;
                  const totalHPP = hpp * item.qty * conversion;

                  return (
                    <tr
                      key={item._id}
                      className={`${
                        idx % 2 === 0 ? "bg-[#2e2e2e]" : "bg-[#262626]"
                      } border-t border-gray-700`}
                    >
                      <td className="px-3 py-2">{item.product?.name}</td>
                      <td className="px-3 py-2 text-right">{item.qty}</td>
                      <td className="px-3 py-2">{item.unit?.short || item.unit}</td>
                      <td className="px-3 py-2">{item.variant}</td>
                      <td className="px-3 py-2 text-right">Rp {totalHPP}</td>
                      <td className="px-3 py-2 text-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700"
                          onClick={() => setEditItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          disabled={deletingId === item._id}
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleDelete(item._id)}
                        >
                          {deletingId === item._id ? "Menghapus..." : "Hapus"}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-400">
                    Belum ada bahan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setAddOpen(true)}
          >
            Tambah Bahan
          </Button>
          <Button
            className="bg-gray-600 hover:bg-gray-700"
            onClick={() => onClose(false)}
          >
            Tutup
          </Button>
        </div>
      </div>

      <AddDishBOMModal
        dish={dish}
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          loadBOM(); // reload otomatis
        }}
      />

      <EditDishBOMModal
        item={editItem}
        isOpen={!!editItem}
        onClose={() => {
          setEditItem(null);
          loadBOM();
        }}
      />
    </div>
  );
}
