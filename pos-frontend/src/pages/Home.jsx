import React from 'react'
import { BsCashCoin } from "react-icons/bs"
import { GrInProgress } from "react-icons/gr"
import { FaBell, FaMoneyBillTrendUp, FaReceipt} from "react-icons/fa6"

import BottomNav from '../components/shared/BottomNav'
import Greetings from '../components/home/Greetings'
import MiniCard from '../components/home/MiniCard'
import RecentOrders from '../components/home/RecentOrders'
import PopularDishesChart from '../components/home/PopularDishesChart'

import { usePaymentSummary } from '@/hooks/usePaymentSummary'

const Home = () => {
  const { data, isLoading, error } = usePaymentSummary()
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading summary.</p>;
  console.log('DATA PAYMENT SUMMARY:', data)

  return (
    <>
      {/* Konten Utama */}
      <section className="bg-[#1f1f1f] min-h-[100vh] overflow-auto flex flex-col lg:flex-row gap-4 p-4 pb-24">
  {/* Left Side */}
  <div className="flex flex-col gap-6 flex-1 min-w-0">
    <Greetings />

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full px-4">
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
    </div>

    <div className="overflow-x-auto px-4">
      <RecentOrders />
    </div>
  </div>

  {/* Right Side */}
  <div className="flex-1 min-w-0 px-4">
    <PopularDishesChart />
  </div>
</section>


      {/* Bottom Navigation */}
      <BottomNav />
    </>
  )
}

export default Home
