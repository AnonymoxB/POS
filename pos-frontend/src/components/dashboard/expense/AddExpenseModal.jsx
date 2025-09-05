import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "../../../https";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Fungsi untuk format angka ke Rupiah
const formatRupiah = (value) => {
  if (!value) return "";
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const AddExpenseModal = ({ isOpen, onClose, onAdded }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    note: "",
    category: "",
    amount: "",
    date: "",
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      enqueueSnackbar("✅ Expense berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["expenses"]);
      onAdded?.();
      onClose();
    },
    onError: () => {
      enqueueSnackbar("❌ Gagal menambahkan expense", { variant: "error" });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const cleanValue = value.replace(/\D/g, ""); // Hapus semua karakter non-angka
      setForm({ ...form, [name]: cleanValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate({
      ...form,
      amount: Number(form.amount), // Simpan angka murni ke DB
    });
  };

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      onClose();
    }
  };

  return (
    <div
      id="modal-overlay"
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-white dark:bg-[#262626] p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
          Tambah Expense
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nama expense"
            name="note"
            value={form.note}
            onChange={handleChange}
            required
            className="bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600"
          />
          <Input
            placeholder="Kategori"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600"
          />
          <Input
            type="text"
            placeholder="Jumlah (Rp)"
            name="amount"
            value={formatRupiah(form.amount)}
            onChange={handleChange}
            required
            className="bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600"
          />
          <Input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="bg-gray-100 dark:bg-[#2a2a2a] border border-gray-300 dark:border-gray-600"
          />
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
