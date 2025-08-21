import React, { useEffect, useState } from "react";
import { getCategories, deleteCategory } from "../../../https";
import { useSnackbar } from "notistack";
import { Pencil, Trash2 } from "lucide-react";
import AddCategoryModal from "./AddCategoryModal";
import EditCategoryModal from "./EditCategoryModal";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
  try {
    const res = await getCategories();
    const data = Array.isArray(res)
      ? res
      : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.data?.data)
      ? res.data.data
      : [];
    setCategories(data);
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    enqueueSnackbar("Gagal memuat kategori", { variant: "error" });
    setError("Gagal memuat kategori");
  } finally {
    setLoading(false);
  }
};


  const handleDelete = (id) => {
    enqueueSnackbar("Yakin ingin menghapus kategori ini?", {
      variant: "warning",
      action: (key) => (
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                await deleteCategory(id);
                setCategories((prev) => prev.filter((c) => c._id !== id));
                enqueueSnackbar("Kategori berhasil dihapus", { variant: "success" });
              } catch {
                enqueueSnackbar("Gagal menghapus kategori", { variant: "error" });
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

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchCategories();
    enqueueSnackbar("Kategori berhasil diperbarui", { variant: "success" });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto bg-[#262626] p-4 rounded-lg max-h-[700px]">
      <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
        <h2 className="text-xl font-semibold text-[#f5f5f5]">
          Daftar Kategori
        </h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
        >
          + Tambah Kategori
        </button>
      </div>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : loading ? (
        <p className="text-[#ababab]">Loading...</p>
      ) : categories.length === 0 ? (
        <p className="text-[#ababab]">Tidak ada kategori yang tersedia.</p>
      ) : (
        <div className="overflow-x-auto">
          <div className="overflow-y-auto max-h-[500px] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-hide rounded-md">
            <table className="w-full text-left text-[#f5f5f5]">
              <thead className="bg-[#333] text-[#ababab] sticky top-0 z-10">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Nama Kategori</th>
                  <th className="p-3">Icon</th>
                  <th className="p-3">Dibuat</th>
                  <th className="p-3">Diupdate</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat._id} className="border-b border-gray-700 hover:bg-[#333]">
                    <td className="p-4 text-center">{index + 1}</td>
                    <td className="p-4">{cat.name}</td>
                    <td className="p-4">{cat.icon || "-"}</td>
                    <td className="p-4">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="p-4">
                      {cat.updatedAt ? new Date(cat.updatedAt).toLocaleString("id-ID") : "-"}
                    </td>
                    <td className="p-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
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

      {isEditModalOpen && selectedCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          category={selectedCategory}
          onUpdated={handleUpdateSuccess}
        />
      )}
      {isAddModalOpen && (
        <AddCategoryModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onCreated={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default Category;
