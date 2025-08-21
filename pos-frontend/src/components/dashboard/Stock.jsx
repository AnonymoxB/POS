import React, { useState } from "react";
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

const Stock = () => {
  const [activeTab, setActiveTab] = useState("transactions");
  const [selectedProduct, setSelectedProduct] = useState("");

  // --- Transactions ---
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ["stockTransactions"],
    queryFn: getStockTransactions,
  });

  const transactions = Array.isArray(txData?.data?.data) ? txData.data.data : [];

  const productList = [
    ...new Map(transactions.map((t) => [t.product?._id, t.product])).values(),
  ];

  // --- Summary (per produk) ---
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["stockSummary"],
    queryFn: getStockSummary,
  });

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

  // --- All Summary (total semua) ---
  const { data: allSummaryData, isLoading: allSummaryLoading } = useQuery({
    queryKey: ["allSummary"],
    queryFn: getAllStockSummary,
  });

  return (
    <div className="p-6 space-y-6">
      {/* --- Tabs --- */}
      <div className="flex gap-3 mb-4">
        {["transactions", "summary", "summaryByProduct", "history", "allSummary"].map(
          (tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          )
        )}
      </div>

      {/* --- Dropdown Produk --- */}
      {(activeTab === "summaryByProduct" || activeTab === "history") && (
        <div className="mb-4">
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="bg-[#333] text-white px-3 py-2 rounded-lg"
          >
            <option value="">Pilih Produk</option>
            {productList.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* --- Transactions --- */}
      {activeTab === "transactions" && (
        <Card className="bg-[#262626] text-white">
          <CardContent className="p-6">
            <h1 className="text-xl font-bold mb-4">Stock Transactions</h1>
            {txLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#333] text-gray-300">
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">Produk</th>
                      <th className="px-3 py-2">Tipe</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Unit</th>
                      <th className="px-3 py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((s) => (
                      <tr
                        key={s._id}
                        className="border-t border-gray-700 hover:bg-[#333]/50"
                      >
                        <td className="px-3 py-2">
                          {new Date(s.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td className="px-3 py-2">{s.product?.name}</td>
                        <td
                          className={`px-3 py-2 font-semibold ${
                            s.type === "IN" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {s.type}
                        </td>
                        <td className="px-3 py-2">{s.qty}</td>
                        <td className="px-3 py-2">{s.unit?.short}</td>
                        <td className="px-3 py-2">{s.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Summary --- */}
      {activeTab === "summary" && (
        <Card className="bg-[#262626] text-white">
          <CardContent className="p-6">
            <h1 className="text-xl font-bold mb-4">Stock Summary</h1>

            {summaryLoading ? (
              <p>Loading...</p>
            ) : (
              <table className="w-full border-collapse border border-gray-600 text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="border border-gray-600 px-3 py-2 text-left">#</th>
                    <th className="border border-gray-600 px-3 py-2 text-left">Produk</th>
                    <th className="border border-gray-600 px-3 py-2 text-right">Masuk</th>
                    <th className="border border-gray-600 px-3 py-2 text-right">Keluar</th>
                    <th className="border border-gray-600 px-3 py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {(summaryData?.data?.data || []).map((item, idx) => (
                    <tr key={item.productId} className="hover:bg-gray-700">
                      <td className="border border-gray-600 px-3 py-2">{idx + 1}</td>
                      <td className="border border-gray-600 px-3 py-2">{item.productName}</td>
                      <td className="border border-gray-600 px-3 py-2 text-right">{item.totalIn}</td>
                      <td className="border border-gray-600 px-3 py-2 text-right">{item.totalOut}</td>
                      <td className="border border-gray-600 px-3 py-2 text-right">{item.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- Summary by Product --- */}
      {activeTab === "summaryByProduct" && (
        <Card className="bg-[#262626] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">Summary by Product</h1>
              {selectedProduct && (
                <Button
                  className="bg-green-600 hover:bg-green-700 rounded-lg"
                  asChild
                >
                  <a href={`/api/stock/export?productId=${selectedProduct}`}>
                    Export Excel
                  </a>
                </Button>
              )}
            </div>

            {!selectedProduct ? (
              <p className="text-gray-400">Silakan pilih produk</p>
            ) : summaryByProductLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#333] text-gray-300">
                      <th className="px-3 py-2">Produk</th>
                      <th className="px-3 py-2">Total Qty</th>
                      <th className="px-3 py-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-700 hover:bg-[#333]/50">
                      <td className="px-3 py-2">
                        {summaryByProductData?.data?.product?.name}
                      </td>
                      <td className="px-3 py-2">
                        {summaryByProductData?.data?.totalQty}
                      </td>
                      <td className="px-3 py-2">
                        {summaryByProductData?.data?.unit?.short}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- History by Product --- */}
      {activeTab === "history" && (
        <Card className="bg-[#262626] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">History by Product</h1>
              {selectedProduct && (
                <Button
                  className="bg-green-600 hover:bg-green-700 rounded-lg"
                  asChild
                >
                  <a href={`/api/stock/export-history?productId=${selectedProduct}`}>
                    Export Excel
                  </a>
                </Button>
              )}
            </div>

            {!selectedProduct ? (
              <p className="text-gray-400">Silakan pilih produk</p>
            ) : historyLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#333] text-gray-300">
                      <th className="px-3 py-2">Tanggal</th>
                      <th className="px-3 py-2">Tipe</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Unit</th>
                      <th className="px-3 py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData?.data?.map((h) => (
                      <tr
                        key={h._id}
                        className="border-t border-gray-700 hover:bg-[#333]/50"
                      >
                        <td className="px-3 py-2">
                          {new Date(h.createdAt).toLocaleString("id-ID")}
                        </td>
                        <td
                          className={`px-3 py-2 font-semibold ${
                            h.type === "IN" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {h.type}
                        </td>
                        <td className="px-3 py-2">{h.qty}</td>
                        <td className="px-3 py-2">{h.unit?.short}</td>
                        <td className="px-3 py-2">{h.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- All Summary --- */}
      {activeTab === "allSummary" && (
        <Card className="bg-[#262626] text-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold">All Stock Summary</h1>
              <Button
                className="bg-green-600 hover:bg-green-700 rounded-lg"
                asChild
              >
                <a href="/api/stock/export-summary">Export Excel</a>
              </Button>
            </div>

            {allSummaryLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#333] text-gray-300">
                      <th className="px-3 py-2">Produk</th>
                      <th className="px-3 py-2">Total Qty</th>
                      <th className="px-3 py-2">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSummaryData?.data?.map((s) => (
                      <tr
                        key={s.product._id}
                        className="border-t border-gray-700 hover:bg-[#333]/50"
                      >
                        <td className="px-3 py-2">{s.product?.name}</td>
                        <td className="px-3 py-2">{s.totalQty}</td>
                        <td className="px-3 py-2">{s.unit?.short}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Stock;
