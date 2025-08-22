import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getProducts, deleteProduct } from "../../../https";
import AddProductModal from "./AddProductModal";
import EditProductModal from "./EditProductModal";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Product = () => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editData, setEditData] = useState(null);

  // Pagination + Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

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

  const products = data?.data || [];

  
  const filteredProducts = products.filter((p) =>
  p.name.toLowerCase().includes(searchTerm.toLowerCase())
);


  // Pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPagination = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <Card className="bg-[#262626] text-white">
    <CardContent className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">Daftar Produk</h2>
        <button
            onClick={() => setOpenAddModal(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
          >
            + Tambah Produk
          </button>
      </div>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Cari produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border border-gray-600 bg-[#333] px-3 py-2 text-sm text-white focus:outline-none"
          />
          
        </div>
      

      {filteredProducts.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada produk tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-600 text-sm">
              <thead>
                <tr className="bg-[#333] text-gray-300">
                  <th className="border border-gray-600 px-3 py-2 text-left">#</th>
                  <th className="border border-gray-600 px-3 py-2 text-left">Nama</th>
                  <th className="border border-gray-600 px-3 py-2 text-left">Kategori</th>
                  <th className="border border-gray-600 px-3 py-2 text-center">Unit</th>
                  <th className="border border-gray-600 px-3 py-2 text-right">Harga</th>
                  <th className="border border-gray-600 px-3 py-2 text-right">Stok</th>
                  <th className="border border-gray-600 px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {currentItems.map((p, idx) => (
                  <tr
                    key={p._id}
                    className="border-b border-gray-700 hover:bg-[#333]"
                  >
                    <td className="border border-gray-600 px-3 py-2 text-center">{indexOfFirstItem + idx + 1}</td>
                    <td className="border border-gray-600 px-3 py-2 text-left">{p.name}</td>
                    <td className="border border-gray-600 px-3 py-2 text-left">{p.category?.name || "-"}</td>
                    <td className="border border-gray-600 px-3 py-2 text-center">{p.defaultUnit?.short || "-"}</td>
                    <td className="border border-gray-600 px-3 py-2 text-right">Rp {p.price?.toLocaleString("id-ID")}</td>
                    <td className="border border-gray-600 px-3 py-2 text-right">{p.stockDisplay || "0"}</td>
                    <td className="p-3 flex gap-2 justify-center ">
                      <button
                        onClick={() => setEditData(p)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(p._id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        <Trash2 size={16} />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
            <div className="text-gray-400 text-sm">
              {filteredProducts.length > 0 && (
                <span>
                  Menampilkan{" "}
                  <b>{indexOfFirstItem + 1}</b>–
                  <b>
                    {indexOfLastItem > filteredProducts.length
                      ? filteredProducts.length
                      : indexOfLastItem}
                  </b>{" "}
                  dari <b>{filteredProducts.length}</b> produk
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <label htmlFor="itemsPerPage">Tampilkan</label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="bg-[#333] text-white border border-gray-600 rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
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
                  <span key={idx} className="px-2 text-gray-400">
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
                          : "bg-[#333] text-gray-300 hover:bg-gray-700"
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
    </CardContent>
  </Card>
  );
};

export default Product;
