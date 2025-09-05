import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import AddDishBOMModal from "./AddDishBOMModal";
import EditDishBOMModal from "./EditDishBOMModal";
import { getDishBOMs, deleteDishBOM } from "../../../https";
import { useSnackbar } from "notistack";

export default function DishBOM({ dish, open, onClose }) {
  const [bom, setBOM] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);

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

  useEffect(() => {
    if (open && dish?._id) loadBOM();
  }, [open, dish, loadBOM]);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteDishBOM(id);
      enqueueSnackbar("Bahan berhasil dihapus", { variant: "success" });
      await loadBOM();
    } catch (err) {
      console.error("Gagal hapus BOM:", err);
      enqueueSnackbar("Gagal menghapus bahan", { variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#262626] text-gray-900 dark:text-white rounded-lg p-6 w-full max-w-3xl shadow-lg">
        <h2 className="text-lg font-bold mb-4">BOM untuk {dish?.name}</h2>

        {/* Table */}
        <div className="overflow-x-auto rounded border border-gray-300 dark:border-gray-700 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-300">
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
                  <td colSpan="6" className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : bom.length > 0 ? (
                bom.map((item, idx) => {
                  const hpp = Number(item.product?.hpp) || 0;
                  const qty = Number(item.qty) || 0;
                  const conversion = Number(item.unit?.conversion) || 1;
                  const totalHPP = hpp * qty * conversion;

                  return (
                    <tr
                      key={item._id}
                      className={`${
                        idx % 2 === 0 ? "bg-gray-50 dark:bg-[#2e2e2e]" : "bg-white dark:bg-[#262626]"
                      } border-t border-gray-200 dark:border-gray-700`}
                    >
                      <td className="px-3 py-2">{item.product?.name || "-"}</td>
                      <td className="px-3 py-2 text-right">{qty}</td>
                      <td className="px-3 py-2">{item.unit?.short || item.unit?.name || "-"}</td>
                      <td className="px-3 py-2">{item.variant}</td>
                      <td className="px-3 py-2 text-right">{formatRupiah(totalHPP)}</td>
                      <td className="px-3 py-2 text-center space-x-2">
                        <Button
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          onClick={() => setEditItem(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          disabled={deletingId === item._id}
                          className="bg-red-600 hover:bg-red-700 text-white"
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
                  <td colSpan="6" className="text-center py-4 text-gray-500 dark:text-gray-400">
                    Belum ada bahan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => setAddOpen(true)}
          >
            Tambah Bahan
          </Button>
          <Button
            className="bg-gray-600 hover:bg-gray-700 text-white"
            onClick={() => onClose(false)}
          >
            Tutup
          </Button>
        </div>
      </div>

      {/* Modal Tambah */}
      <AddDishBOMModal
        dish={dish}
        isOpen={addOpen}
        onClose={() => {
          setAddOpen(false);
          loadBOM();
        }}
      />

      {/* Modal Edit */}
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
