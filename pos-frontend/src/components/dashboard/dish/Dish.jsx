import React, { useEffect, useState } from "react";
import { getDishes, deleteDish } from "../../../https";
import { useSnackbar } from "notistack";
import ModalEditDish from "./ModalEditDish";
import AddDishModal from "./AddDishModal";
import { Pencil, Trash2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


const Dish = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);

  // snackbar
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5); // default 5

  // search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // fetch dishes
  const fetchDishes = async () => {
    try {
      const response = await getDishes();
      setDishes(Array.isArray(response) ? response : response?.data ?? []);
    } catch (err) {
      console.error("Gagal memuat data menu:", err);
      enqueueSnackbar(
        "Gagal memuat data menu: " +
          (err?.response?.data?.message || err.message || ""),
        { variant: "error" }
      );
      setError("Gagal memuat data menu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  // kategori unik
  const categories = [
    ...new Set(dishes.map((dish) => dish.category).filter(Boolean)),
  ];

  // filter
  const filteredDishes = dishes.filter(
    (dish) =>
      (dish.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.category?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory ? dish.category === selectedCategory : true)
  );

  // pagination logic
  const totalItems = filteredDishes.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredDishes.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // handle edit
  const handleEdit = (dish) => {
    setSelectedDish(dish);
    setIsEditModalOpen(true);
  };

  // handle delete
  const handleDelete = (id) => {
    enqueueSnackbar("Yakin ingin menghapus menu ini?", {
      variant: "warning",
      action: (key) => (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await deleteDish(id);
                setDishes((prev) => prev.filter((d) => d._id !== id));
                enqueueSnackbar("Menu berhasil dihapus", { variant: "success" });
              } catch {
                enqueueSnackbar("Gagal menghapus menu", { variant: "error" });
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

  // setelah update / tambah
  const handleUpdateSuccess = () => {
    fetchDishes();
    enqueueSnackbar("Menu berhasil diperbarui", { variant: "success" });
  };

  return (
    <Card className="bg-[#262626] text-white">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-xl font-bold">Daftar Menu</h1>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            + Tambah Menu
          </Button>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative w-full md:w-1/3">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari nama / kategori..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-3 py-2 rounded bg-[#333] text-white focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full md:w-1/4 p-2 rounded bg-[#333] text-white"
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : filteredDishes.length === 0 ? (
          <p className="text-gray-400">Tidak ada menu yang cocok.</p>
        ) : (
          <div className="overflow-x-auto">
            <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-hide rounded-md">
              <table className="w-full border-collapse border border-gray-600 text-sm">
                <thead>
                  <tr className="bg-[#333] text-gray-300 sticky top-0 z-10">
                    <th className="border border-gray-600 px-3 py-2">#</th>
                    <th className="border border-gray-600 px-3 py-2">Nama</th>
                    <th className="border border-gray-600 px-3 py-2">Kategori</th>
                    <th className="border border-gray-600 px-3 py-2">HPP Hot</th>
                    <th className="border border-gray-600 px-3 py-2">HPP Ice</th>
                    <th className="border border-gray-600 px-3 py-2">Harga Hot</th>
                    <th className="border border-gray-600 px-3 py-2">Harga Ice</th>
                    <th className="border border-gray-600 px-3 py-2">Create</th>
                    <th className="border border-gray-600 px-3 py-2">Update</th>
                    <th className="border border-gray-600 px-3 py-2 text-center w-40">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((dish, index) => (
                    <tr
                      key={dish._id}
                      className="border-t border-gray-700 hover:bg-[#333]/50"
                    >
                      <td className="border border-gray-600 px-3 py-2 text-center">
                        {startIndex + index + 1}
                      </td>
                      <td className="border border-gray-600 px-3 py-2">{dish.name}</td>
                      <td className="border border-gray-600 px-3 py-2">{dish.category}</td>
                      <td className="border border-gray-600 px-3 py-2">
                        {dish.hpp?.hpphot ? `Rp ${dish.hpp.hpphot}` : "-"}
                      </td>
                      <td className="border border-gray-600 px-3 py-2">
                        {dish.hpp?.hppice ? `Rp ${dish.hpp.hppice}` : "-"}
                      </td>
                      <td className="border border-gray-600 px-3 py-2">
                        {dish.price?.hot ? `Rp ${dish.price.hot}` : "-"}
                      </td>
                      <td className="border border-gray-600 px-3 py-2">
                        {dish.price?.ice ? `Rp ${dish.price.ice}` : "-"}
                      </td>
                      <td className="border border-gray-600 px-3 py-2">
                        {dish.createdAt
                          ? new Date(dish.createdAt).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="border border-gray-600 px-3 py-2">
                        {dish.updatedAt
                          ? new Date(dish.updatedAt).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="border border-gray-600 px-3 py-2 text-center">
                        <div className="flex justify-center gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleEdit(dish)}
                          >
                            <Pencil size={14} /> Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDelete(dish._id)}
                          >
                            <Trash2 size={14} /> Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-3">
              {/* Info jumlah data */}
              <p className="text-gray-400 text-sm">
                Menampilkan{" "}
                <span className="font-semibold">
                  {totalItems === 0 ? 0 : startIndex + 1}
                </span>{" "}
                -{" "}
                <span className="font-semibold">
                  {Math.min(startIndex + itemsPerPage, totalItems)}
                </span>{" "}
                dari <span className="font-semibold">{totalItems}</span> data
              </p>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <label className="text-gray-300 text-sm">Tampilkan</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="p-1 rounded bg-[#333] text-white text-sm"
                >
                  {[5, 10, 20, 50].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
                <span className="text-gray-300 text-sm">/ halaman</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  
                >
                  Prev
                </Button>

                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  return (
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
                  );
                })}

                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Edit */}
        {isEditModalOpen && selectedDish && (
          <ModalEditDish
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            dish={selectedDish}
            onUpdated={handleUpdateSuccess}
          />
        )}

        {/* Modal Tambah */}
        {isAddModalOpen && (
          <AddDishModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onCreated={handleUpdateSuccess}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default Dish;


