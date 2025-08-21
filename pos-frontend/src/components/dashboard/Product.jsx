import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getProducts, deleteProduct } from "../../https";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";

const Product = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      enqueueSnackbar("Produk berhasil dihapus", { variant: "success" });
      queryClient.invalidateQueries(["products"]);
    },
    onError: (err) => {
      enqueueSnackbar(err.message || "Gagal menghapus produk", {
        variant: "error",
      });
    },
  });

  if (isLoading) return <p className="text-[#ababab]">Loading...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data produk</p>;

  const products = data?.data?.data || [];

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg max-h-[700px]">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">Daftar Produk</h2>
        <button
          onClick={() => setOpenAddModal(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          + Tambah Produk
        </button>
      </div>

      {products.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada produk tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[#f5f5f5]">
            <thead className="bg-[#333] text-[#ababab] sticky top-0 z-10">
              <tr>
                <th className="p-3">Nama</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Harga</th>
                <th className="p-3">Stok</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-gray-700 hover:bg-[#333]"
                >
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category?.name || "-"}</td>
                  <td className="p-3">{p.defaultUnit?.short || "-"}</td>
                  <td className="p-3">Rp {p.price?.toLocaleString("id-ID")}</td>
                  <td className="p-3">{p.stockDisplay || "0"}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => setEditData(p)}
                      className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(p._id)}
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700 text-sm"
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

      {openAddModal && (
        <AddProductModal
          isOpen={openAddModal}
          onClose={() => setOpenAddModal(false)}
        />
      )}

      {editData && (
        <EditProductModal
          isOpen={!!editData}
          onClose={() => setEditData(null)}
          product={editData}
        />
      )}
    </div>
  );
};

export default Product;
