import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getPurchases, deletePurchase } from "../../../https";
import AddPurchaseModal from "./AddPurchaseModal";
import EditPurchaseModal from "./EditPurchaseModal";
import { Card, CardContent } from "@/components/ui/card";

const Purchase = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch purchases
  const { data, isLoading, isError } = useQuery({
    queryKey: ["purchases"],
    queryFn: getPurchases,
  });

  // Delete mutation
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

  const purchases = data?.data?.data || [];

  // Filter
  const filteredPurchases = purchases.filter(
    (p) =>
      p.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.items?.some((i) =>
        i.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Pagination
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPurchases = filteredPurchases.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const getPagination = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, "...", totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
      }
    }
    return pages;
  };

  // Summary total
  const totalGrand = filteredPurchases.reduce(
    (sum, p) => sum + (p.grandTotal || 0),
    0
  );

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg max-h-[800px]">
      {/* Header */}
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">Daftar Purchase</h2>
        <button
          onClick={() => setOpenAddModal(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          + Tambah Purchase
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Cari supplier / produk..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full rounded-md border border-gray-600 bg-[#1f1f1f] px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-10 w-full animate-pulse rounded bg-[#333]"
            ></div>
          ))}
        </div>
      )}

      {/* Error */}
      {isError && <p className="text-red-500">Gagal memuat data purchase</p>}

      {/* Empty state */}
      {!isLoading && !isError && currentPurchases.length === 0 && (
        <p className="text-[#ababab] text-center py-6">
          Tidak ada purchase. Tambahkan data baru!
        </p>
      )}

      {/* Desktop Table */}
      {!isLoading && currentPurchases.length > 0 && (
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full border-collapse border border-gray-600 text-sm">
            <thead>
              <tr className="bg-[#333] text-gray-300">
                <th className="border border-gray-600 px-3 py-2 text-left">Tanggal</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Supplier</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Produk</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Qty</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Harga</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Total</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Grand Total</th>
                <th className="border border-gray-600 px-3 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-white">
              {currentPurchases.map((purchase) => (
                <tr
                  key={purchase._id}
                  className="border-b border-gray-700 hover:bg-[#333]"
                >
                  <td className="border border-gray-600 px-3 py-2">
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-600 px-3 py-2">{purchase.supplier?.name || "-"}</td>
                  <td className="border border-gray-600 px-3 py-2">
                    <ul>
                      {purchase.items.map((i) => (
                        <li key={i._id}>
                          {i.product?.name} ({i.unit?.short || ""})
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-gray-600 px-3 py-2">
                    <ul>
                      {purchase.items.map((i) => (
                        <li key={i._id}>{i.quantity}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-gray-600 px-3 py-2">
                    <ul>
                      {purchase.items.map((i) => (
                        <li key={i._id}>
                          {i.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-gray-600 px-3 py-2">
                    <ul>
                      {purchase.items.map((i) => (
                        <li key={i._id}>
                          {i.total.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="border border-gray-600 px-3 py-2 font-bold text-green-400">
                    {purchase.grandTotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                  </td>
                  <td className="border border-gray-600 px-3 py-2 flex gap-2">
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
      )}

      {/* Mobile Card View */}
      {!isLoading && currentPurchases.length > 0 && (
        <div className="block md:hidden space-y-4">
          {currentPurchases.map((purchase) => (
            <Card
              key={purchase._id}
              className="bg-[#1f1f1f] border border-gray-700 text-white"
            >
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">
                    {new Date(purchase.purchaseDate).toLocaleDateString()}
                  </span>
                  <span className="font-bold text-green-400">
                    {purchase.grandTotal.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                  </span>
                </div>
                <p className="font-semibold">{purchase.supplier?.name || "-"}</p>
                <ul className="text-sm text-gray-300">
                  {purchase.items.map((i) => (
                    <li key={i._id}>
                      {i.product?.name} - {i.quantity} {i.unit?.short} @{" "}
                      {i.price.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEdit(purchase)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(purchase._id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination + PerPage */}
      {filteredPurchases.length > 0 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-[#ababab] text-sm">Tampilkan</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-md border border-gray-600 bg-[#1f1f1f] px-2 py-1 text-sm text-white"
            >
              {[5, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-[#ababab] text-sm">data per halaman</span>
          </div>

          <div className="flex items-center gap-2">
            {getPagination().map((page, idx) =>
              page === "..." ? (
                <span key={idx} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? "bg-green-600 text-white"
                      : "bg-[#333] text-[#ababab] hover:bg-[#444]"
                  }`}
                >
                  {page}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <Card className="mt-4 bg-[#1f1f1f] border border-gray-700">
        <CardContent className="p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#f5f5f5]">Total Belanja</h3>
          <p className="text-xl font-bold text-green-400">
            {totalGrand.toLocaleString("id-ID", { style: "currency", currency: "IDR" })}
          </p>
        </CardContent>
      </Card>

      {/* Modals */}
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
