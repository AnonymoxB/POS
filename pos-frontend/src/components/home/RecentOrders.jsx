import React, { useEffect, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import OrderList from './OrderList'
import { getOrders } from '../../https'
import { enqueueSnackbar } from 'notistack'

const RecentOrders = () => {
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    console.log('🚀 Mulai fetchOrders...')
    setLoading(true)
    try {
      const response = await getOrders()
      const data = response?.data?.data ?? response?.data ?? []
      console.log('📦 Data Order dari API:', data)

      if (!Array.isArray(data)) {
        console.error('Expected array but got:', data)
        setOrders([])
      } else {
        setOrders(data)
      }
    } catch (error) {
      console.error('❌ Error saat fetchOrders:', error)
      enqueueSnackbar('Gagal memuat order', { variant: 'error' })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🎯 useEffect jalan, panggil fetchOrders()')
    fetchOrders()
  }, [])

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) =>
        order.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <div className="flex-grow min-w-[280px] max-w-[600px] px-4 sm:px-8 mt-6 w-full">
    <div className="bg-[#1a1a1a] rounded-xl min-h-[350px] max-h-[460px] flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold tracking-wide">
          Orderan Terbaru
        </h1>
        <a href="#" className="text-[#025cca] text-sm font-semibold">
          Lihat Semua
        </a>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-[#1f1f1f] rounded-xl px-5 py-3 mx-6">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Cari Orderan Terbaru"
          className="bg-transparent outline-none text-[#f5f5f5] w-full placeholder:text-[#ccc]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Order List */}
      <div className="mt-4 px-6 overflow-y-auto flex-1 scrollbar-hide">
        {loading ? (
          <p className="text-[#ccc] text-sm italic">Memuat data...</p>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderList key={order._id} order={order} />
          ))
        ) : (
          <p className="text-[#ccc] text-sm italic">Tidak ada order ditemukan.</p>
        )}
      </div>
    </div>
  </div>
  )
}

export default RecentOrders
