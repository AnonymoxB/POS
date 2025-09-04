import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { addDish, getCategories } from "../../../https";

const AddDishModal = ({ onClose, onAdded }) => {
  const [dishData, setDishData] = useState({
    name: "",
    hpp: { hpphot: 0, hppice: 0 },
    price: { hot: 0, ice: 0 },
    category: "",
  });

  // Ambil data kategori
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  // Input handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDishData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setDishData((prev) => ({
      ...prev,
      price: { ...prev.price, [name]: Number(value) || 0 },
    }));
  };

  const handleHPPPriceChange = (e) => {
    const { name, value } = e.target;
    setDishData((prev) => ({
      ...prev,
      hpp: { ...prev.hpp, [name]: Number(value) || 0 },
    }));
  };

  // Mutation
  const dishMutation = useMutation({
    mutationFn: (reqData) => addDish(reqData),
    onSuccess: (res) => {
      enqueueSnackbar(res?.data?.message ?? "Menu berhasil ditambahkan", {
        variant: "success",
      });
      if (onAdded) onAdded();
      onClose(false);
    },
    onError: (err) => {
      const message = err?.response?.data?.message ?? "Gagal menambahkan menu";
      enqueueSnackbar(message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...dishData,
      price: {
        hot: Number(dishData.price.hot) || 0,
        ice: Number(dishData.price.ice) || 0,
      },
      hpp: {
        hpphot: Number(dishData.hpp.hpphot) || 0,
        hppice: Number(dishData.hpp.hppice) || 0,
      },
    };
    dishMutation.mutate(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-white dark:bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-900 dark:text-gray-100 text-xl font-semibold">
            Tambah Menu
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-600 dark:text-gray-300 hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {/* Nama Menu */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
              Nama Menu
            </label>
            <div className="flex items-center rounded-lg px-4 bg-gray-100 dark:bg-[#1f1f1f]">
              <input
                type="text"
                name="name"
                value={dishData.name}
                onChange={handleInputChange}
                className="bg-transparent flex-1 text-gray-900 dark:text-white p-4 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* HPP */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
              HPP
            </label>
            <div className="flex gap-2">
              <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Hot
                </span>
                <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-3 py-2">
                  <input
                    type="number"
                    name="hpphot"
                    value={dishData.hpp.hpphot}
                    onChange={handleHPPPriceChange}
                    className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none"
                    disabled
                  />
                </div>
              </div>

              <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Ice
                </span>
                <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-3 py-2">
                  <input
                    type="number"
                    name="hppice"
                    value={dishData.hpp.hppice}
                    onChange={handleHPPPriceChange}
                    className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
              Price
            </label>
            <div className="flex gap-2">
              <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Hot
                </span>
                <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-3 py-2">
                  <input
                    type="number"
                    name="hot"
                    value={dishData.price.hot}
                    onChange={handlePriceChange}
                    className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Ice
                </span>
                <div className="bg-gray-100 dark:bg-[#1f1f1f] rounded-lg px-3 py-2">
                  <input
                    type="number"
                    name="ice"
                    value={dishData.price.ice}
                    onChange={handlePriceChange}
                    className="w-full bg-transparent text-gray-900 dark:text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
              Category
            </label>
            <div className="flex items-center rounded-lg px-4 bg-gray-100 dark:bg-[#1f1f1f]">
              <select
                name="category"
                value={dishData.category}
                onChange={handleInputChange}
                className="w-full p-2 rounded bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={dishMutation.isPending}
            className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold disabled:opacity-50"
          >
            {dishMutation.isPending ? "Menyimpan..." : "Add Dish"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddDishModal;
