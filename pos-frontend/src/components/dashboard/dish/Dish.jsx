import React, { useEffect, useState } from "react";
import { getDishes, deleteDish } from "../../../https";
import { useSnackbar } from "notistack";
import ModalEditDish from "./ModalEditDish";
import { Pencil, Trash2 } from "lucide-react";
import AddDishModal from "./AddDishModal";

const Dish = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState(null);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  const fetchDishes = async () => {
  try {
    const response = await getDishes();
    setDishes(Array.isArray(response) ? response : response?.data ?? []);
  } catch (err) {
    console.error("Gagal memuat data menu:", err);
    enqueueSnackbar("Gagal memuat data menu: " + (err?.response?.data?.message || err.message || ""), {
      variant: "error",
    });
    setError("Gagal memuat data menu");
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (dish) => {
    setSelectedDish(dish);
    setIsEditModalOpen(true);
  };

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

  const handleUpdateSuccess = () => {
    fetchDishes();
    enqueueSnackbar("Menu berhasil diperbarui", { variant: "success" });
  };



  useEffect(() => {
    fetchDishes();
  }, []);

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg max-h-[700px]">
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">
          Daftar Menu
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          + Tambah Menu
        </button>
      </div>



      {error ? (
        <p className="text-red-500">{error}</p>
      ) : loading ? (
        <p className="text-[#ababab]">Loading...</p>
      ) : dishes.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada menu yang tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-hide rounded-md">
            <table className="w-full text-left text-[#f5f5f5]">
              <thead className="bg-[#333] text-[#ababab] sticky top-0 z-10">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Nama</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">HPP Hot</th>
                  <th className="p-3">HPP Ice</th>
                  <th className="p-3">Harga Hot</th>
                  <th className="p-3">Harga Ice</th>
                  <th className="p-3">Create</th>
                  <th className="p-3">Update</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {dishes.map((dish, index) => (
                  <tr
                    key={dish._id}
                    className="border-b border-gray-700 hover:bg-[#333]"
                  >
                    <td className="p-4 text-center">{index + 1}</td>
                    <td className="p-4">{dish.name}</td>
                    <td className="p-4">{dish.category}</td>
                    <td className="p-4">
                      {dish.hpp?.hpphot ? `Rp ${dish.hpp.hpphot}` : "-"}
                    </td>
                    <td className="p-4">
                      {dish.hpp?.hppice ? `Rp ${dish.hpp.hppice}` : "-"}
                    </td>
                    <td className="p-4">
                      {dish.price?.hot ? `Rp ${dish.price.hot}` : "-"}
                    </td>
                    <td className="p-4">
                      {dish.price?.ice ? `Rp ${dish.price.ice}` : "-"}
                    </td>
                    <td className="p-4">
                      {dish.createdAt
                        ? new Date(dish.createdAt).toLocaleString("id-ID")
                        : "-"}
                    </td>
                    <td className="p-4">
                      {dish.updatedAt
                        ? new Date(dish.updatedAt).toLocaleString("id-ID")
                        : "-"}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(dish)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(dish._id)}
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
          </div>
        </div>
      )}

      {isEditModalOpen && selectedDish && (
        <ModalEditDish
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          dish={selectedDish}
          onUpdated={handleUpdateSuccess}
        />
      )}
      {isAddModalOpen && (
        <AddDishModal
          isOpen={isAddModalOpen}
          onClose={() =>setIsAddModalOpen(false)}
          onCreated={handleUpdateSuccess}
        />
      )}

    </div>
  );
};

export default Dish;
