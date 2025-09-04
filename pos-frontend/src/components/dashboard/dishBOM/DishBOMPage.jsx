import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import DishBOM from "./DishBOM";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getDishes } from "../../../https";

export default function DishBOMPage() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const formatRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num || 0);

  const fetchDishes = useCallback(async () => {
    try {
      const data = await getDishes();
      setDishes(data);
    } catch (err) {
      console.error("Gagal fetch dishes:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  // Filter berdasarkan search
  const filteredDishes = dishes.filter(
    (dish) =>
      dish.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof dish.category === "string" &&
        dish.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Hitung data untuk halaman aktif
  const totalPages = Math.ceil(filteredDishes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDishes = filteredDishes.slice(indexOfFirstItem, indexOfLastItem);

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const getPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pages;
  };

  return (
    <Card className="bg-white dark:bg-[#262626] text-gray-900 dark:text-white">
      <CardContent className="p-6">
        <h1 className="text-xl font-bold mb-4">Dish BOM</h1>

        {/* Search Bar */}
        <div className="mb-4 flex justify-between items-center gap-3">
          <Input
            placeholder="Cari berdasarkan nama atau kategori..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 dark:border-gray-600 text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                  <th className="border px-3 py-2 text-left">Nama Dish</th>
                  <th className="border px-3 py-2 text-left">Kategori</th>
                  <th className="border px-3 py-2 text-right">HPP Hot</th>
                  <th className="border px-3 py-2 text-right">HPP Ice</th>
                  <th className="border px-3 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentDishes.length > 0 ? (
                  currentDishes.map((dish) => (
                    <tr
                      key={dish._id}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#333]/50"
                    >
                      <td className="border px-3 py-2 text-left">
                        {dish.name}
                      </td>
                      <td className="border px-3 py-2 text-left">
                        {typeof dish.category === "object"
                          ? dish.category?.name || "-"
                          : dish.category || "-"}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        {formatRupiah(dish.hpp?.hpphot)}
                      </td>
                      <td className="border px-3 py-2 text-right">
                        {formatRupiah(dish.hpp?.hppice)}
                      </td>
                      <td className="border px-3 py-2 text-center">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => setSelectedDish(dish)}
                        >
                          Lihat BOM
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="border px-3 py-4 text-center text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada dish
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                {filteredDishes.length > 0 && (
                  <span>
                    Menampilkan <b>{indexOfFirstItem + 1}</b>–
                    <b>
                      {indexOfLastItem > filteredDishes.length
                        ? filteredDishes.length
                        : indexOfLastItem}
                    </b>{" "}
                    dari <b>{filteredDishes.length}</b> dish
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
                          : "bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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

        {/* Modal Dish BOM */}
        {selectedDish && (
          <DishBOM
            dish={selectedDish}
            open={!!selectedDish}
            onClose={(updated) => {
              setSelectedDish(null);
              if (updated) {
                fetchDishes();
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
}
