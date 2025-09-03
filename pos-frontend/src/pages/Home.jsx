import React from "react"
import { FaMoneyBillTrendUp, FaReceipt } from "react-icons/fa6"
import { motion } from "framer-motion"

import BottomNav from "../components/shared/BottomNav"
import Greetings from "../components/home/Greetings"
import MiniCard from "../components/home/MiniCard"
import RecentOrders from "../components/home/RecentOrders"
import PopularDishesChart from "../components/home/PopularDishesChart"

import { usePaymentSummary } from "@/hooks/usePaymentSummary"

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

const Home = () => {
  const { data, isLoading, error } = usePaymentSummary()

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-300 animate-pulse">
          Memuat data...
        </p>
      </div>
    )
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 dark:text-red-400 font-medium">
          Gagal memuat ringkasan.
        </p>
      </div>
    )

  return (
    <>
      {/* Section Utama */}
      <section className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-[#0d0d0d] dark:via-[#111] dark:to-[#1a1a1a] min-h-screen overflow-auto flex flex-col gap-10 sm:p-4 p-6 pb-24 transition-colors">
        
        {/* Greetings */}
        <motion.div
          className="backdrop-blur-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200/40 dark:border-gray-700/40 p-6"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <Greetings />
        </motion.div>

        {/* Mini Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
        >
          <MiniCard
            title="Total Pendapatan"
            icon={<FaMoneyBillTrendUp />}
            number={data.totalRevenue || 0}
            footerNum={data.revenueGrowth || 0}
          />
          <MiniCard
            title="Total Transaksi"
            icon={<FaReceipt />}
            number={data.totalTransactions || 0}
            footerNum={data.transactionGrowth || 0}
          />
        </motion.div>

        {/* Chart + Orders Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.4 }}
        >
          {/* Popular Dishes Chart (lebih lebar biar fokus) */}
          <div className="lg:col-span-2 backdrop-blur-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200/40 dark:border-gray-700/40 transition transform hover:scale-[1.01]">
            <PopularDishesChart />
          </div>

          {/* Recent Orders */}
          <div className="backdrop-blur-md bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-xl border border-gray-200/40 dark:border-gray-700/40">
            <RecentOrders />
          </div>
        </motion.div>
      </section>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  )
}

export default Home
