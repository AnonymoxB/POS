import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { IoMdClose } from "react-icons/io";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { addTable } from "../../https";

const AddTableModal = ({ isOpen, onClose, onAdded }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    tableNo: "",
    seats: "",
  });

  const mutation = useMutation({
    mutationFn: addTable,
    onSuccess: () => {
        queryClient.invalidateQueries(["tables"]);
        enqueueSnackbar("Meja berhasil ditambahkan", { variant: "success" });
        onAdded();
        onClose();
    },
    onError: () => {
        enqueueSnackbar("Gagal menambahkan meja", { variant: "error" });
    },
    });


  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-[#262626] text-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <Dialog.Title className="text-xl font-semibold">Tambah Meja</Dialog.Title>
            <button onClick={onClose} className="text-gray-400 hover:text-red-500">
              <IoMdClose size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-[#ababab]">No Meja</label>
              <input
                type="text"
                name="tableNo"
                value={formData.tableNo}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] rounded-lg px-4 py-2 text-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-[#ababab]">Jumlah Kursi</label>
              <input
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className="w-full bg-[#1f1f1f] rounded-lg px-4 py-2 text-white focus:outline-none"
                required
                min={1}
              />
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
                disabled={mutation.isLoading}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg"
              >
                {mutation.isLoading ? "Menyimpan..." : "Tambah"}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddTableModal;
