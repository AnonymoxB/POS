import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductCategories, deleteProductCategory } from "../../../https";
import { useSnackbar } from "notistack";
import AddProductCategoryModal from "./AddProductCategoryModal";
import EditProductCategoryModal from "./EditProductCategory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import DeleteConfirmModal from "./DeleteConfirmModal";

const ProductCategoryPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["product-categories"],
    queryFn: getProductCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProductCategory,
    onSuccess: () => {
      enqueueSnackbar("Kategori berhasil dihapus", { variant: "success" });
      queryClient.invalidateQueries(["product-categories"]);
      setIsDeleteOpen(false);
    },
    onError: () => {
      enqueueSnackbar("Gagal menghapus kategori", { variant: "error" });
    },
  });

  if (isLoading) return <p className="text-gray-600 dark:text-gray-300">Loading...</p>;
  if (isError) return <p className="text-red-500">Gagal memuat data</p>;

  const categories = data?.data?.data || [];

  // Filter search
  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <Card className="bg-white dark:bg-[#262626] text-gray-900 dark:text-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold">Kategori Produk</h1>
          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Tambah Kategori
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#333] px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
            <thead>
              <tr className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">
                  Nama
                </th>
                <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan="2"
                    className="text-center py-4 text-gray-500 dark:text-gray-400"
                  >
                    Belum ada kategori
                  </td>
                </tr>
              ) : (
                currentCategories.map((c) => (
                  <tr
                    key={c._id}
                    className="border-t border-gray-300 dark:border-gray-700"
                  >
                    <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                      {c.name}
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
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
                        onClick={() => {
                          setSelectedCategory(c);
                          setIsDeleteOpen(true);
                        }}
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

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            {filteredCategories.length > 0 && (
              <span>
                Menampilkan{" "}
                <b>{indexOfFirstItem + 1}</b>–
                <b>
                  {indexOfLastItem > filteredCategories.length
                    ? filteredCategories.length
                    : indexOfLastItem}
                </b>{" "}
                dari <b>{filteredCategories.length}</b> kategori
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <label htmlFor="itemsPerPage">Tampilkan</label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>per halaman</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Prev
            </Button>

            {getPagination().map((page, idx) =>
              page === "..." ? (
                <span key={idx} className="px-2 text-gray-500 dark:text-gray-400">
                  ...
                </span>
              ) : (
                <Button
                  key={page}
                  size="sm"
                  variant={currentPage === page ? "default" : "outline"}
                  className={`${
                    currentPage === page
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            )}

            <Button
              size="sm"
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
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

        {/* Modal Delete */}
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          onConfirm={() =>
            deleteMutation.mutate(selectedCategory._id)
          }
          title="Hapus Kategori"
          message={`Yakin mau hapus kategori "${selectedCategory?.name}"?`}
          isLoading={deleteMutation.isLoading}
        />
      </CardContent>
    </Card>
  );
};

export default ProductCategoryPage;
