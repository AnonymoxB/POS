import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStockTransactions } from "../https";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Stock = () => {
  const [filterType, setFilterType] = useState(""); // IN / OUT / ""
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["stockTransactions"],
    queryFn: getStockTransactions,
  });

  if (isLoading) return <p className="text-white">Loading...</p>;

  let filteredData = data?.data || [];

  // filter berdasarkan tipe IN/OUT
  if (filterType) {
    filteredData = filteredData.filter((s) => s.type === filterType);
  }

  // filter berdasarkan date range
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    filteredData = filteredData.filter((s) => {
      const created = new Date(s.createdAt);
      return created >= start && created <= end;
    });
  }

  return (
    <div className="p-6">
      <Card className="bg-[#262626] text-white shadow-lg rounded-2xl">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-xl font-bold">Stock Transactions</h1>
            <Button
              asChild
              className="bg-green-600 hover:bg-green-700 rounded-lg"
            >
              <a href="/api/stock/export">
                Export Excel
              </a>
            </Button>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Dropdown tipe */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-[#333] text-white px-3 py-2 rounded-lg"
            >
              <option value="">Semua Tipe</option>
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>

            {/* Date range */}
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#333] text-white px-3 py-2 rounded-lg"
            />
            <span>-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#333] text-white px-3 py-2 rounded-lg"
            />

            {/* Reset button */}
            <Button
              onClick={() => {
                setFilterType("");
                setStartDate("");
                setEndDate("");
              }}
              className="bg-gray-600 hover:bg-gray-700 rounded-lg"
            >
              Reset
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#333] text-gray-300">
                  <th className="px-3 py-2 text-left">Tanggal</th>
                  <th className="px-3 py-2 text-left">Produk</th>
                  <th className="px-3 py-2 text-left">Tipe</th>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Unit</th>
                  <th className="px-3 py-2 text-left">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((s) => (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Stock;
