import { Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useMutation } from "@tanstack/react-query";
import { updateCategory } from "../../../https";

const EditCategoryModal = ({ isOpen, onClose, category, onUpdated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({ name: "" });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
      });
    }
  }, [category]);

  const mutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      enqueueSnackbar("Kategori berhasil diperbarui", { variant: "success" });
      onUpdated();
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(err.message || "Gagal memperbarui kategori", {
        variant: "error",
      });
    },
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ id: category._id, data: formData });
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-[#262626] text-gray-900 dark:text-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Edit Kategori
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-700 dark:text-[#ababab]">
                Nama Kategori
              </label>
              <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-4 py-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={mutation.isLoading}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg disabled:opacity-70"
              >
                {mutation.isLoading ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditCategoryModal;
