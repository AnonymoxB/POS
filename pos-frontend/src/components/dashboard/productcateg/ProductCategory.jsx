import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductCategories, deleteProductCategory } from "../../../https";
import { useSnackbar } from "notistack";
import AddProductCategoryModal from "./AddProductCategoryModal";
import EditProductCategoryModal from "./EditProductCategory";

const ProductCategoryPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-categories"],
    queryFn: getProductCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductCategory,
    onSuccess: () => {
      enqueueSnackbar("Kategori berhasil dihapus", { variant: "success" });
      queryClient.invalidateQueries(["product-categories"]);
    },
    onError: () => {
      enqueueSnackbar("Gagal menghapus kategori", { variant: "error" });
    },
  });

  if (isLoading) return <p className="text-white">Loading...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data</p>;

  const categories = data?.data || [];

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-white">Kategori Produk</h1>
        <button
          onClick={() => setIsAddOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Tambah
        </button>
      </div>

      <div className="bg-[#262626] rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#333] text-white">
            <tr>
              <th className="px-4 py-2">Nama</th>
              <th className="px-4 py-2 w-40">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="2" className="text-center py-4 text-gray-400">
                  Belum ada kategori
                </td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c._id} className="border-t border-gray-700 text-white">
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(c);
                        setIsEditOpen(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(c._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah */}
      <AddProductCategoryModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      {/* Modal Edit */}
      <EditProductCategoryModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        category={selectedCategory}
      />
    </div>
  );
};

export default ProductCategoryPage;
