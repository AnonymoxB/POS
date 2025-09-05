"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getStockTransactions,
  getStockSummary,
  getStockSummaryByProduct,
  getStockHistoryByProduct,
  getAllStockSummary,
} from "../../https";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet } from "lucide-react";

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

export default function Stock() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [selectedProduct, setSelectedProduct] = useState("");

  // Global search per tab
  const [searchTx, setSearchTx] = useState("");
  const [searchSum, setSearchSum] = useState("");
  const [searchHist, setSearchHist] = useState("");

  // Items per page per tab
  const [txItemsPerPage, setTxItemsPerPage] = useState(10);
  const [sumItemsPerPage, setSumItemsPerPage] = useState(10);
  const [histItemsPerPage, setHistItemsPerPage] = useState(10);

  // --- Transactions ---
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["stockTransactions"],
    queryFn: getStockTransactions,
  });
  const transactions = Array.isArray(txData?.data?.data) ? txData.data.data : [];

  // Create product list from transactions
  const productList = useMemo(
    () => [
      ...new Map(transactions.map((t) => [t.product?._id, t.product]).filter(Boolean)).values(),
    ],
    [transactions]
  );

  // --- Summary (per produk) ---
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["stockSummary"],
    queryFn: getStockSummary,
  });
  const summaryRows = Array.isArray(summaryData?.data?.data)
    ? summaryData.data.data
    : [];

  // --- Summary by product ---
  const { data: summaryByProductData, isLoading: summaryByProductLoading } =
    useQuery({
      queryKey: ["summaryByProduct", selectedProduct],
      queryFn: () => getStockSummaryByProduct(selectedProduct),
      enabled: !!selectedProduct,
    });

  // --- History ---
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["historyByProduct", selectedProduct],
    queryFn: () => getStockHistoryByProduct(selectedProduct),
    enabled: !!selectedProduct,
  });
  const historyRows = Array.isArray(historyData?.data?.data)
    ? historyData.data.data
    : [];

  // --- All Summary (total semua) ---
  const { data: allSummaryData, isLoading: allSummaryLoading } = useQuery({
    queryKey: ["allSummary"],
    queryFn: getAllStockSummary,
  });
  const allSummaryRows = Array.isArray(allSummaryData?.data?.data)
    ? allSummaryData.data.data
    : [];

  // Filters
  const filteredTx = useMemo(() => {
    const q = searchTx.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((t) => {
      const product = t.product?.name?.toLowerCase() || "";
      const type = t.type?.toLowerCase() || "";
      const unit = t.unit?.short?.toLowerCase() || "";
      const note = t.note?.toLowerCase() || "";
      const date = new Date(t.createdAt).toLocaleString("id-ID").toLowerCase();
      return (
        product.includes(q) ||
        type.includes(q) ||
        unit.includes(q) ||
        note.includes(q) ||
        date.includes(q)
      );
    });
  }, [transactions, searchTx]);

  const filteredSummary = useMemo(() => {
    const q = searchSum.trim().toLowerCase();
    if (!q) return summaryRows;
    return summaryRows.filter((r) => (r.productName || "").toLowerCase().includes(q));
  }, [summaryRows, searchSum]);

  const filteredHistory = useMemo(() => {
    const q = searchHist.trim().toLowerCase();
    if (!q) return historyRows;
    return historyRows.filter((h) => {
      const type = h.type?.toLowerCase() || "";
      const unit = h.unit?.short?.toLowerCase() || "";
      const note = h.note?.toLowerCase() || "";
      const date = new Date(h.createdAt).toLocaleString("id-ID").toLowerCase();
      return type.includes(q) || unit.includes(q) || note.includes(q) || date.includes(q);
    });
  }, [historyRows, searchHist]);

  // Paginations
  const {
    currentPage: txPage,
    setCurrentPage: setTxPage,
    indexOfFirstItem: txFirst,
    indexOfLastItem: txLast,
    currentItems: txItems,
    totalPages: txTotalPages,
  } = usePagination(filteredTx, txItemsPerPage);

  const {
    currentPage: sumPage,
    setCurrentPage: setSumPage,
    indexOfFirstItem: sumFirst,
    indexOfLastItem: sumLast,
    currentItems: sumItems,
    totalPages: sumTotalPages,
  } = usePagination(filteredSummary, sumItemsPerPage);

  const {
    currentPage: histPage,
    setCurrentPage: setHistPage,
    indexOfFirstItem: histFirst,
    indexOfLastItem: histLast,
    currentItems: histItems,
    totalPages: histTotalPages,
  } = usePagination(filteredHistory, histItemsPerPage);

  const tabs = [
    { key: "transactions", label: "Transaksi" },
    { key: "summary", label: "Ringkasan Stok" },
    { key: "summaryByProduct", label: "Ringkasan per Produk" },
    { key: "history", label: "Riwayat Produk" },
    { key: "allSummary", label: "Total Semua Stok" },
  ];

  return (
    <Card className="bg-white dark:bg-[#1f1f1f] text-gray-900 dark:text-white shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-3 mb-2">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "outline"}
              onClick={() => setActiveTab(tab.key)}
              className={
                activeTab === tab.key
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dropdown Produk untuk tab tertentu */}
        {(activeTab === "summaryByProduct" || activeTab === "history") && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg"
            >
              <option value="">Pilih Produk</option>
              {productList.map((p) => (
                <option key={p?._id} value={p?._id}>
                  {p?.name}
                </option>
              ))}
            </select>

            {activeTab === "summaryByProduct" && selectedProduct && (
              <Button asChild className="bg-green-600 hover:bg-green-700">
                {/* Route export summary per produk */}
                <a href={`/api/stock/summary/export/${selectedProduct}`}>
                  <FileSpreadsheet size={18} className="mr-2" /> Export Ringkasan
                </a>
              </Button>
            )}

            {activeTab === "history" && selectedProduct && (
              <Button asChild className="bg-green-600 hover:bg-green-700">
                {/* Route export history per produk */}
                <a href={`/api/stock/history/export/${selectedProduct}`}>
                  <FileSpreadsheet size={18} className="mr-2" /> Export Riwayat
                </a>
              </Button>
            )}
          </div>
        )}

        {/* ========================= Transaksi ========================= */}
        {activeTab === "transactions" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Transaksi Stok</h2>
              <Input
                placeholder="Cari transaksi..."
                value={searchTx}
                onChange={(e) => {
                  setTxPage(1);
                  setSearchTx(e.target.value);
                }}
                className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
              />
            </div>

            {txLoading ? (
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
                    {txItems.map((s) => (
                      <tr
                        key={s._id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                      >
                        <td className="px-3 py-2">
                          {new Date(s.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2">{s.product?.name}</td>
                        <td
                          className={`px-3 py-2 font-semibold ${
                            s.type === "IN" ? "text-green-600" : "text-red-500"
                          }`}
                        >
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
                  currentPage={txPage}
                  setCurrentPage={setTxPage}
                  totalPages={txTotalPages}
                  itemsPerPage={txItemsPerPage}
                  setItemsPerPage={setTxItemsPerPage}
                  showingFrom={filteredTx.length ? txFirst + 1 : 0}
                  showingTo={Math.min(txLast, filteredTx.length)}
                  totalItems={filteredTx.length}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================= Ringkasan Stok ========================= */}
        {activeTab === "summary" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Ringkasan Stok</h2>
              <Input
                placeholder="Cari produk..."
                value={searchSum}
                onChange={(e) => {
                  setSumPage(1);
                  setSearchSum(e.target.value);
                }}
                className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
              />
            </div>

            {summaryLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : filteredSummary.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Tidak ada data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2">#</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Produk</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Masuk (base)</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Keluar (base)</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Saldo</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sumItems.map((item, idx) => (
                      <tr
                        key={item.productId}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                      >
                        <td className="px-3 py-2">{sumFirst + idx + 1}</td>
                        <td className="px-3 py-2">{item.productName}</td>
                        <td className="px-3 py-2 text-right">{item.totalIn}</td>
                        <td className="px-3 py-2 text-right">{item.totalOut}</td>
                        <td className="px-3 py-2 text-right">{item.balance}</td>
                        <td className="px-3 py-2">{item.unitShort}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <PaginationBar
                  currentPage={sumPage}
                  setCurrentPage={setSumPage}
                  totalPages={sumTotalPages}
                  itemsPerPage={sumItemsPerPage}
                  setItemsPerPage={setSumItemsPerPage}
                  showingFrom={filteredSummary.length ? sumFirst + 1 : 0}
                  showingTo={Math.min(sumLast, filteredSummary.length)}
                  totalItems={filteredSummary.length}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================= Ringkasan per Produk ========================= */}
        {activeTab === "summaryByProduct" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Ringkasan per Produk</h2>
            </div>

            {!selectedProduct ? (
              <p className="text-gray-500 dark:text-gray-400">Silakan pilih produk</p>
            ) : summaryByProductLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Produk</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Saldo</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]">
                      <td className="px-3 py-2">{summaryByProductData?.data?.product?.name}</td>
                      <td className="px-3 py-2 text-right">{summaryByProductData?.data?.balance}</td>
                      <td className="px-3 py-2">{summaryByProductData?.data?.unitShort}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================= Riwayat Produk ========================= */}
        {activeTab === "history" && (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold">Riwayat Produk</h2>
              <Input
                placeholder="Cari riwayat..."
                value={searchHist}
                onChange={(e) => {
                  setHistPage(1);
                  setSearchHist(e.target.value);
                }}
                className="bg-gray-100 dark:bg-[#333] text-gray-900 dark:text-white"
              />
            </div>

            {!selectedProduct ? (
              <p className="text-gray-500 dark:text-gray-400">Silakan pilih produk</p>
            ) : historyLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : filteredHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Tidak ada data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Tanggal</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Tipe</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Qty</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Unit</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {histItems.map((h) => (
                      <tr
                        key={h._id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                      >
                        <td className="px-3 py-2">{new Date(h.createdAt).toLocaleString("id-ID")}</td>
                        <td
                          className={`px-3 py-2 font-semibold ${
                            h.type === "IN" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {h.type}
                        </td>
                        <td className="px-3 py-2 text-right">{h.qty}</td>
                        <td className="px-3 py-2">{h.unit?.short}</td>
                        <td className="px-3 py-2">{h.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <PaginationBar
                  currentPage={histPage}
                  setCurrentPage={setHistPage}
                  totalPages={histTotalPages}
                  itemsPerPage={histItemsPerPage}
                  setItemsPerPage={setHistItemsPerPage}
                  showingFrom={filteredHistory.length ? histFirst + 1 : 0}
                  showingTo={Math.min(histLast, filteredHistory.length)}
                  totalItems={filteredHistory.length}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================= Total Semua Stok ========================= */}
        {activeTab === "allSummary" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Total Semua Stok</h2>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <a href="/api/stock/export-summary">
                  <FileSpreadsheet size={18} className="mr-2" /> Export
                </a>
              </Button>
            </div>

            {allSummaryLoading ? (
              <p className="text-gray-500 dark:text-gray-400">Loading...</p>
            ) : allSummaryRows.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Tidak ada data.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300">
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left">Produk</th>
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSummaryRows.map((s) => (
                      <tr
                        key={s.productId}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                      >
                        <td className="px-3 py-2">{s.productName}</td>
                        <td className="px-3 py-2 text-right">
                          {s.balance} {s.unitShort} ({s.balanceBase} {s.baseUnitShort})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
