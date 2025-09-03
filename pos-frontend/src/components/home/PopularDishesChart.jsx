// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { TrendingUp } from "lucide-react"
// @ts-ignore
import { getPopularDishes } from "../../https"
import { enqueueSnackbar } from "notistack"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function PopularDishesChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchPopularDishes = async () => {
    setLoading(true)
    try {
      const response = await getPopularDishes()
      const dishes = response?.data?.data || []

      const chartReady = dishes
        .filter((dish) => dish.totalOrders > 0)
        .sort((a, b) => b.totalOrders - a.totalOrders)
        .map((dish, index) => ({
          name: dish.name,
          totalOrders: Number(dish.totalOrders),
          fill: `hsl(var(--chart-${(index % 20) + 1}))`,
        }))

      setData(chartReady)
    } catch {
      enqueueSnackbar("Gagal memuat data popular dish", { variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPopularDishes()
  }, [])

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-gray-100 text-lg font-semibold mb-2">
          Menu Terpopuler
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Memuat data...</p>
        ) : data.length > 0 ? (
          <ChartContainer config={{ totalOrders: { label: "Total Order" } }}>
            <BarChart
              width={100}
              height={data.length * 40}
              data={data}
              layout="vertical"
              margin={{ left: 30, right: 30 }}
            >
              <YAxis
                dataKey="name"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tick={{ fontWeight: "bold", fill: "currentColor" }}
              />
              <XAxis dataKey="totalOrders" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelClassName="font-bold"
                    valueClassName="font-bold"
                  />
                }
              />
              <Bar
                dataKey="totalOrders"
                radius={5}
                minPointSize={5}
                layout="vertical"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada data.</p>
        )}
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium text-gray-900 dark:text-gray-100 text-base">
          Berdasarkan pesanan tertinggi <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-gray-500 dark:text-gray-400 leading-none">
          Data diambil dari menu yang paling sering dipesan
        </div>
      </CardFooter>
    </Card>
  )
}
