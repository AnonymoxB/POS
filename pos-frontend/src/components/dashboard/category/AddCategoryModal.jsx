import React, { useState } from "react";
import { motion } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { addCategory } from "../../../https";

const AddCategoryModal = ({ isOpen, onClose, onCreated }) => {
  const [categoryData, setCategoryData] = useState({ name: "", icon: "" });

  const categoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: (res) => {
      enqueueSnackbar(res?.data?.message || "Kategori berhasil ditambahkan", {
        variant: "success",
      });
      onClose(); // tutup modal
      setCategoryData({ name: "", icon: "" });
      if (onCreated) onCreated();
    },
    onError: (err) => {
      enqueueSnackbar(
        err?.response?.data?.message || "Gagal menambahkan kategori",
        { variant: "error" }
      );
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryData.name.trim()) {
      enqueueSnackbar("Nama kategori tidak boleh kosong", { variant: "warning" });
      return;
    }
    if (!categoryData.icon.trim()) {
      enqueueSnackbar("Icon kategori tidak boleh kosong", { variant: "warning" });
      return;
    }
    categoryMutation.mutate(categoryData);
  };

  if (!isOpen) return null; // modal tidak dirender kalau isOpen = false

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose} // klik luar modal tutup
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="bg-[#262626] p-6 rounded-lg shadow-lg w-96"
        onClick={(e) => e.stopPropagation()} // biar klik dalam modal tidak nutup
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[#f5f5f5] text-xl font-semibold">Add Category</h2>
          <button
            onClick={onClose}
            className="text-[#f5f5f5] hover:text-red-500"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Category Name
            </label>
            <input
              type="text"
              name="name"
              value={categoryData.name}
              onChange={handleInputChange}
              className="w-full rounded-lg px-4 py-3 bg-[#1f1f1f] text-white focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-[#ababab] mb-2 text-sm font-medium">
              Icon (Emoji)
            </label>
            <input
              type="text"
              name="icon"
              placeholder="🍲"
              value={categoryData.icon}
              onChange={handleInputChange}
              className="w-full rounded-lg px-4 py-3 bg-[#1f1f1f] text-white focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={categoryMutation.isLoading}
            className="w-full rounded-lg mt-6 py-3 text-lg bg-yellow-400 text-gray-900 font-bold disabled:opacity-70"
          >
            {categoryMutation.isLoading ? "Saving..." : "Add Category"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};


export default AddCategoryModal;
