import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { addDish } from "../../https"; // pastikan fungsi ini tersedia

const AddDishModal = ({ setIsAddModalOpen, onClose, onAdded }) => {
  const [dishData, setDishData] = useState({
    name: "",
    hpp: {
      hpphot:"",
      hppice:"",
    },
    price: {
        hot: "",
        ice: ""
    },
    category: "",
    });

  const handlePriceChange = (e) => {
  const { name, value } = e.target;
  setDishData((prev) => ({
    ...prev,
    price: {
      ...prev.price,
      [name]: value,
    },
  }));
};

const handleHPPPriceChange = (e) => {
  const { name, value } = e.target;
  setDishData((prev) => ({
    ...prev,
    hpp: {
      ...prev.hpp,
      [name]: value,
    },
  }));
};


  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setDishData((prev) => ({
    ...prev,
    [name]: value,
  }));
};


  const handleCloseModal = () => {
    onClose(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dishMutation.mutate(dishData);
  };

  const dishMutation = useMutation({
    mutationFn: (reqData) => addDish(reqData),
    onSuccess: (res) => {
      setIsAddModalOpen(false);
      enqueueSnackbar(res.data.message || "Menu berhasil ditambahkan", {
        variant: "success",
      });
      if (onAdded) onAdded();
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || "Gagal menambahkan menu", {
        variant: "error",
      });
    },
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">Tambah Menu</h2>
          <button
            onClick={handleCloseModal}
            className="text-[#f5f5f5] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Nama Menu
            </label>
            <div className="flex items-center rounded-lg px-4 bg-[#1f1f1f]">
              <input
                type="text"
                name="name"
                value={dishData.name}
                onChange={handleInputChange}
                className="bg-transparent flex-1 text-white p-4 focus:outline-none"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              HPP Price
            </label>
            <div className="flex gap-2">
                {/* HPP Hot price */}
                <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-400 mb-1">Hot</span>
                <div className="bg-[#1f1f1f] rounded-lg px-3 py-2">
                    <input
                    type="number"
                    name="hpphot"
                    value={dishData.hpp.hpphot}
                    onChange={handleHPPPriceChange}
                    placeholder="HPP Hot price"
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                    />
                </div>
                </div>

                {/* Ice price */}
                <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-400 mb-1">Ice</span>
                <div className="bg-[#1f1f1f] rounded-lg px-3 py-2">
                    <input
                    type="number"
                    name="hppice"
                    value={dishData.hpp.hppice}
                    onChange={handleHPPPriceChange}
                    placeholder="HPP Ice price"
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                    />
                </div>
                </div>
            </div>
          </div>

          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
                Price
            </label>
            <div className="flex gap-2">
                {/* Hot price */}
                <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-400 mb-1">Hot</span>
                <div className="bg-[#1f1f1f] rounded-lg px-3 py-2">
                    <input
                    type="number"
                    name="hot"
                    value={dishData.price.hot}
                    onChange={handlePriceChange}
                    placeholder="Hot price"
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                    />
                </div>
                </div>

                {/* Ice price */}
                <div className="flex flex-col w-1/2">
                <span className="text-sm text-gray-400 mb-1">Ice</span>
                <div className="bg-[#1f1f1f] rounded-lg px-3 py-2">
                    <input
                    type="number"
                    name="ice"
                    value={dishData.price.ice}
                    onChange={handlePriceChange}
                    placeholder="Ice price"
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                    />
                </div>
                </div>
            </div>
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Category
            </label>
            <div className="flex items-center rounded-lg px-4 bg-[#1f1f1f]">
              <input
                type="text"
                name="category"
                value={dishData.category}
                onChange={handleInputChange}
                className="bg-transparent flex-1 text-white p-4 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold"
          >
            Add Dish
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddDishModal;
