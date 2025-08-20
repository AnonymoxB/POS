import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createUnit, getUnits } from "../../https";
import { useSnackbar } from "notistack";

const AddUnitModal = ({ isOpen, onClose, onAdded }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["units"], queryFn: getUnits });

  const [form, setForm] = useState({
    name: "",
    short: "",
    baseUnit: "",
    conversion: 1,
  });

  const { mutate } = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      enqueueSnackbar("Unit berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["units"]);
      onAdded();
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Gagal menambahkan unit", { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#262626] p-6 rounded-lg w-96">
        <h2 className="text-lg font-bold mb-4 text-white">Tambah Unit</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Nama Unit"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="px-3 py-2 rounded bg-[#333] text-white"
            required
          />
          <input
            type="text"
            placeholder="Singkatan"
            value={form.short}
            onChange={(e) => setForm({ ...form, short: e.target.value })}
            className="px-3 py-2 rounded bg-[#333] text-white"
            required
          />
          <select
            value={form.baseUnit}
            onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}
            className="px-3 py-2 rounded bg-[#333] text-white"
          >
            <option value="">Unit Dasar</option>
            {data?.data?.data?.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Konversi"
            value={form.conversion}
            onChange={(e) => setForm({ ...form, conversion: e.target.value })}
            className="px-3 py-2 rounded bg-[#333] text-white"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnitModal;
