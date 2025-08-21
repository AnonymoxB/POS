import { Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { updateDish } from "../../../https";


const ModalEditDish = ({ isOpen, onClose, dish, onUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    hppHot: "",
    hppIce: "",
    priceHot: "",
    priceIce: "",
  });

  useEffect(() => {
    if (dish) {
      setFormData({
        name: dish.name || "",
        category: dish.category || "",
        hppHot: dish.hpp?.hpphot || "",
        hppIce: dish.hpp?.hppice || "",
        priceHot: dish.price?.hot || "",
        priceIce: dish.price?.ice || "",
      });
    }
  }, [dish]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDish(dish._id, {
        name: formData.name,
        category: formData.category,
        hpp: {
            hot: parseInt(formData.hppHot),
            ice: parseInt(formData.hppIce),
        },
        price: {
            hot: parseInt(formData.priceHot),
            ice: parseInt(formData.priceIce),
        },
        });

      onUpdated(); // untuk refresh data
      onClose();   // untuk tutup modal
    } catch (err) {
      console.error("Gagal update menu:", err);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#262626] text-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-xl font-semibold mb-4">
            Edit Dish
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[#ababab]">Dish Name</label>
              <div className="bg-[#1f1f1f] rounded-lg px-4 py-2">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-[#ababab]">Category</label>
              <div className="bg-[#1f1f1f] rounded-lg px-4 py-2">
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="text-sm text-[#ababab]">HPP Hot</label>
                <div className="bg-[#1f1f1f] rounded-lg px-4 py-2">
                  <input
                    type="number"
                    name="hppHot"
                    value={formData.hppHot}
                    onChange={handleChange}
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label className="text-sm text-[#ababab]">HPP Ice</label>
                <div className="bg-[#1f1f1f] rounded-lg px-4 py-2">
                  <input
                    type="number"
                    name="hppIce"
                    value={formData.hppIce}
                    onChange={handleChange}
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="text-sm text-[#ababab]">Hot Price</label>
                <div className="bg-[#1f1f1f] rounded-lg px-4 py-2">
                  <input
                    type="number"
                    name="priceHot"
                    value={formData.priceHot}
                    onChange={handleChange}
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
              <div className="w-1/2">
                <label className="text-sm text-[#ababab]">Ice Price</label>
                <div className="bg-[#1f1f1f] rounded-lg px-4 py-2">
                  <input
                    type="number"
                    name="priceIce"
                    value={formData.priceIce}
                    onChange={handleChange}
                    className="w-full bg-transparent text-white focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg"
              >
                Simpan
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ModalEditDish;
