import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getPurchases, deletePurchase } from "../../../https";
import AddPurchaseModal from "./AddPurchaseModal";
import EditPurchaseModal from "./EditPurchaseModal";

const Purchase = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Fetch purchases
  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
  });

  // Mutation delete
  const { mutate: removePurchase } = useMutation({
    mutationFn: deletePurchase,
    onSuccess: () => {
      enqueueSnackbar("Purchase berhasil dihapus", { variant: "success" });
      queryClient.invalidateQueries(["purchases"]);
    },
    onError: () => {
      enqueueSnackbar("Gagal menghapus purchase", { variant: "error" });
    },
  });

  const handleDelete = (id) => {
    enqueueSnackbar("Yakin ingin menghapus purchase ini?", {
      variant: "warning",
      action: (key) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              try {
                removePurchase(id);
              } catch {
                enqueueSnackbar("Gagal menghapus purchase", {
                  variant: "error",
                });
              } finally {
                closeSnackbar(key);
              }
            }}
            className="text-red-500 font-semibold"
          >
            Ya
          </button>
          <button
            onClick={() => closeSnackbar(key)}
            className="text-gray-300 font-semibold"
          >
            Batal
          </button>
        </div>
      ),
    });
  };

  const handleEdit = (purchase) => {
    setSelectedPurchase(purchase);
    setOpenEditModal(true);
  };

  const handleUpdateSuccess = () => {
    queryClient.invalidateQueries(["purchases"]);
  };

  if (isLoading) return <p className="text-[#ababab]">Loading...</p>;
  if (isError)
    return <p className="text-red-500">Gagal memuat data purchase</p>;

  const purchases = data?.data?.data || [];

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg max-h-[700px]">
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">Daftar Purchase</h2>
        <button
          onClick={() => setOpenAddModal(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          + Tambah Purchase
        </button>
      </div>

      {purchases.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada purchase yang tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-hide rounded-md">
            <table className="w-full text-left text-[#f5f5f5]">
              <thead className="bg-[#333] text-[#ababab] sticky top-0 z-10">
                <tr>
                  <th className="p-3">Tanggal</th>
                  <th className="p-3">Supplier</th>
                  <th className="p-3">Produk</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Harga</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Grand Total</th>
                  <th className="p-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr
                    key={purchase._id}
                    className="border-b border-gray-700 hover:bg-[#333]"
                  >
                    <td className="p-4">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">{purchase.supplier}</td>
                    <td className="p-4">
                      <ul>
                        {purchase.items.map((i) => (
                          <li key={i._id}>
                            {i.product?.name} ({i.unit?.short})
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">
                      <ul>
                        {purchase.items.map((i) => (
                          <li key={i._id}>{i.quantity}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">
                      <ul>
                        {purchase.items.map((i) => (
                          <li key={i._id}>
                            Rp {i.price.toLocaleString("id-ID")}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4">
                      <ul>
                        {purchase.items.map((i) => (
                          <li key={i._id}>
                            Rp {i.total.toLocaleString("id-ID")}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 font-bold text-green-400">
                      Rp {purchase.grandTotal.toLocaleString("id-ID")}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(purchase)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(purchase._id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {openAddModal && (
        <AddPurchaseModal
          isOpen={openAddModal}
          onClose={() => setOpenAddModal(false)}
          onAdded={handleUpdateSuccess}
        />
      )}

      {openEditModal && selectedPurchase && (
        <EditPurchaseModal
          isOpen={openEditModal}
          purchase={selectedPurchase}
          onClose={() => setOpenEditModal(false)}
          onUpdated={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default Purchase;
