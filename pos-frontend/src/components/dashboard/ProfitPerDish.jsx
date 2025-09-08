import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getMetrics } from "../../https";

const formatRupiah = (num) => {
  if (typeof num !== "number") return "-";
  return `Rp ${num.toLocaleString("id-ID")}`;
};

export default function ProfitPerDish() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getMetrics();
        setData(res.data?.profitPerDish || []);
      } catch (err) {
        console.error("❌ Error fetch profit per dish:", err);
      }
    };
    fetchMetrics();
  }, []);

  const sortedData = [...data].sort((a, b) => b.profit - a.profit);

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* ==================== CHART ==================== */}
      <Card className="p-4 shadow-md rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Profit per Dish</h2>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData}>
              <XAxis dataKey="dish" />
              <YAxis />
              <Tooltip formatter={(value) => formatRupiah(value)} />
              <Bar dataKey="profit" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ==================== TABLE ==================== */}
      <Card className="p-4 shadow-md rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Detail Profit Dish</h2>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Dish</th>
                  <th className="p-2">Harga</th>
                  <th className="p-2">HPP</th>
                  <th className="p-2">Terjual</th>
                  <th className="p-2">Revenue</th>
                  <th className="p-2">Profit</th>
                  <th className="p-2">% Margin</th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((d, i) => {
                  const margin =
                    d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) : 0;
                  return (
                    <tr
                      key={i}
                      className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="p-2">{d.dish}</td>
                      <td className="p-2">{formatRupiah(d.price)}</td>
                      <td className="p-2">{formatRupiah(d.hpp)}</td>
                      <td className="p-2">{d.totalSold}</td>
                      <td className="p-2">{formatRupiah(d.revenue)}</td>
                      <td className="p-2 font-semibold text-green-600">
                        {formatRupiah(d.profit)}
                      </td>
                      <td className="p-2">{margin}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
