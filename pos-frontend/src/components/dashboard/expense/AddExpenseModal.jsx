import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExpense } from "../../../https";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AddExpenseModal = ({ isOpen, onClose, onAdded }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    category: "",
    amount: "",
    date: "",
  });

  const { mutate, isLoading } = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      enqueueSnackbar("Expense berhasil ditambahkan", { variant: "success" });
      queryClient.invalidateQueries(["expenses"]);
      onAdded?.();
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Gagal menambahkan expense", { variant: "error" });
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#262626] p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-white">Tambah Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Nama expense"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            placeholder="Kategori"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          />
          <Input
            type="number"
            placeholder="Jumlah"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
          />
          <Input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
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
