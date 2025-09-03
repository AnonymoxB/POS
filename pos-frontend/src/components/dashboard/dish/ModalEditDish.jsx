import { Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { updateDish } from "../../../https";

const ModalEditDish = ({ isOpen, onClose, dish, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    hpp: { hpphot: 0, hppice: 0 },
    price: { hot: 0, ice: 0 },
  });

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name || "",
        category: dish.category || "",
        hpp: {
          hpphot: dish.hpp?.hpphot || 0,
          hppice: dish.hpp?.hppice || 0,
        },
        price: {
          hot: dish.price?.hot || 0,
          ice: dish.price?.ice || 0,
        },
      });
    }
  }, [dish]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.price) {
      setFormData((prev) => ({
        ...prev,
        price: { ...prev.price, [name]: Number(value) || 0 },
      }));
    } else if (name in formData.hpp) {
      setFormData((prev) => ({
        ...prev,
        hpp: { ...prev.hpp, [name]: Number(value) || 0 },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const mutation = useMutation({
    mutationFn: () => updateDish(dish._id, formData),
    onSuccess: (res) => {
      enqueueSnackbar(res?.data?.message ?? "Menu berhasil diperbarui", {
        variant: "success",
      });
      if (onUpdated) onUpdated();
      onClose();
    },
    onError: (err) => {
      const message = err?.response?.data?.message ?? "Gagal memperbarui menu";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-[#262626] text-gray-900 dark:text-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Edit Dish
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Menu */}
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Dish Name
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

            {/* Category */}
            <div>
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Category
              </label>
              <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-4 py-2">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* HPP */}
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  HPP Hot
                </label>
                <input
                  type="number"
                  name="hpphot"
                  value={formData.hpp.hpphot}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  HPP Ice
                </label>
                <input
                  type="number"
                  name="hppice"
                  value={formData.hpp.hppice}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Price */}
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Price Hot
                </label>
                <input
                  type="number"
                  name="hot"
                  value={formData.price.hot}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
              <div className="w-1/2">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Price Ice
                </label>
                <input
                  type="number"
                  name="ice"
                  value={formData.price.ice}
                  onChange={handleChange}
                  className="w-full bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {mutation.isPending ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ModalEditDish;
