"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import {
  getStockTransactions,
  createStockTransaction,
  getProducts,
  getUnits,
} from "../../https";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ITEMS_CHOICES = [5, 10, 20, 50];

function usePagination(data, itemsPerPage) {
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(
    () => data.slice(indexOfFirstItem, indexOfLastItem),
    [data, indexOfFirstItem, indexOfLastItem]
  );
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  return {
    currentPage,
    setCurrentPage,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems,
    totalPages,
  };
}

function PaginationBar({
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  showingFrom,
  showingTo,
  totalItems,
}) {
  const getPagination = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, "...", totalPages];
    if (currentPage >= totalPages - 2)
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage, "...", totalPages];
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4">
      <div className="text-gray-600 dark:text-gray-400 text-sm">
        {totalItems > 0 && (
          <span>
            Menampilkan <b>{showingFrom}</b>–<b>{showingTo}</b> dari <b>{totalItems}</b> data
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <label htmlFor="itemsPerPage">Tampilkan</label>
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded px-2 py-1"
        >
          {ITEMS_CHOICES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <span>per halaman</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Prev
        </Button>

        {getPagination().map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-2 text-gray-400">
              ...
            </span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={currentPage === p ? "default" : "outline"}
              className={
                currentPage === p
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-[#333] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }
              onClick={() => setCurrentPage(p)}
            >
              {p}
            </Button>
          )
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default function AdjustmentStock() {
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();

  const [productId, setProductId] = useState("");
  const [type, setType] = useState("IN");
  const [qty, setQty] = useState("");
  const [unitId, setUnitId] = useState("");
  const [note, setNote] = useState("");

  // Search filter
  const [searchTx, setSearchTx] = useState("");

  // Items per page
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Queries
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: unitsData } = useQuery({
    queryKey: ["units"],
    queryFn: getUnits,
  });

  const { data: txData, isLoading } = useQuery({
    queryKey: ["stockTransactions"],
    queryFn: getStockTransactions,
  });

  const transactions = Array.isArray(txData?.data?.data) ? txData.data.data : [];

  // Filtered transactions
  const filteredTx = useMemo(() => {
    const q = searchTx.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) => {
      const product = t.product?.name?.toLowerCase() || "";
      const typeT = t.type?.toLowerCase() || "";
      const unit = t.unit?.short?.toLowerCase() || "";
      const noteT = t.note?.toLowerCase() || "";
      const date = new Date(t.createdAt).toLocaleString("id-ID").toLowerCase();
      return (
        product.includes(q) ||
        typeT.includes(q) ||
        unit.includes(q) ||
        noteT.includes(q) ||
        date.includes(q)
      );
    });
  }, [transactions, searchTx]);

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    indexOfFirstItem,
    indexOfLastItem,
    currentItems,
    totalPages,
  } = usePagination(filteredTx, itemsPerPage);

  // Mutation
  const mutation = useMutation({
    mutationFn: createStockTransaction,
    onSuccess: () => {
      enqueueSnackbar("Stock adjusted successfully", { variant: "success" });
      queryClient.invalidateQueries({ queryKey: ["stockTransactions"] });
      setProductId("");
      setType("IN");
      setQty("");
      setUnitId("");
      setNote("");
    },
    onError: (err) => {
      enqueueSnackbar(err.response?.data?.message || err.message, { variant: "error" });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productId || !qty || !unitId) {
      return enqueueSnackbar("Please fill all required fields", { variant: "warning" });
    }
    mutation.mutate({ product: productId, type, qty: Number(qty), unit: unitId, note });
  };

  return (
    <Card className="bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white shadow-lg">
      <CardContent className="p-6 space-y-6">
        <h2 className="text-xl font-bold mb-4">Adjustment Stok</h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded"
          >
            <option value="">Pilih Produk</option>
            {productsData?.data?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded"
          >
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
          </select>

          <input
            type="number"
            placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded"
          />

          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded"
          >
            <option value="">Pilih Unit</option>
            {unitsData?.data?.map((u) => (
              <option key={u._id} value={u._id}>
                {u.short}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Catatan"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="bg-gray-100 dark:bg-[#333] border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded col-span-4"
          />

          <Button type="submit" className="col-span-4 md:col-span-1 bg-green-600 hover:bg-green-700">
            Submit
          </Button>
        </form>

        {/* Search */}
        <Input
          placeholder="Cari transaksi..."
          value={searchTx}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchTx(e.target.value);
          }}
          className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white mb-4"
        />

        {/* Table */}
        {isLoading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : filteredTx.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Tidak ada data.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Tanggal</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Produk</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Tipe</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Qty</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Unit</th>
                  <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((s) => (
                  <tr
                    key={s._id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                  >
                    <td className="px-3 py-2">{new Date(s.createdAt).toLocaleString("id-ID")}</td>
                    <td className="px-3 py-2">{s.product?.name}</td>
                    <td className={`px-3 py-2 font-semibold ${s.type === "IN" ? "text-green-600" : "text-red-500"}`}>
                      {s.type}
                    </td>
                    <td className="px-3 py-2 text-right">{s.qty}</td>
                    <td className="px-3 py-2">{s.unit?.short}</td>
                    <td className="px-3 py-2">{s.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <PaginationBar
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              showingFrom={filteredTx.length ? indexOfFirstItem + 1 : 0}
              showingTo={Math.min(indexOfLastItem, filteredTx.length)}
              totalItems={filteredTx.length}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
