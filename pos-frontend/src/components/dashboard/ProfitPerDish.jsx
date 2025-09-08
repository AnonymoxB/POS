import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getMetrics } from "../../https";

export default function ProfitPerDish() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await getMetrics();
        setData(res.data.profitPerDish || []);
      } catch (err) {
        console.error("❌ Error fetch profit per dish:", err);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-6">
      {/* ==================== CHART ==================== */}
      <Card className="p-4 shadow-md rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Profit per Dish</h2>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <XAxis dataKey="dish" />
              <YAxis />
              <Tooltip formatter={(value) => `Rp ${value.toLocaleString()}`} />
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
                </tr>
              </thead>
              <tbody>
                {data.map((d, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2">{d.dish}</td>
                    <td className="p-2">Rp {d.price.toLocaleString()}</td>
                    <td className="p-2">Rp {d.hpp.toLocaleString()}</td>
                    <td className="p-2">{d.totalSold}</td>
                    <td className="p-2">Rp {d.revenue.toLocaleString()}</td>
                    <td className="p-2 font-semibold text-green-600">
                      Rp {d.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
