import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpense } from "../../../https";
import { useSnackbar } from "notistack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EditExpenseModal = ({ isOpen, onClose, expense, onUpdated }) => {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    note: "",
    category: "",
    amount: "",
    date: "",
  });

  // ketika modal dibuka isi form dengan data lama
  useEffect(() => {
    if (expense) {
      setForm({
        name: expense.note || "",
        category: expense.category || "",
        amount: expense.amount || "",
        date: expense.date ? expense.date.split("T")[0] : "",
      });
    }
  }, [expense]);

  const { mutate, isLoading } = useMutation({
    mutationFn: ({ id, data }) => updateExpense(id, data),
    onSuccess: () => {
      enqueueSnackbar("Expense berhasil diperbarui", { variant: "success" });
      queryClient.invalidateQueries(["expenses"]);
      onUpdated?.();
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Gagal memperbarui expense", { variant: "error" });
    },
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!expense?._id) return;
    mutate({ id: expense._id, data: form });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#262626] p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-white">Edit Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            placeholder="Nama expense"
            name="note"
            value={form.note}
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

export default EditExpenseModal;
