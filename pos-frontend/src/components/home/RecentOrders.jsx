import React, { useEffect, useState } from "react"
import { FaSearch } from "react-icons/fa"
import OrderList from "./OrderList"
import { getOrders } from "../../https"
import { enqueueSnackbar } from "notistack"

const RecentOrders = () => {
  const [orders, setOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await getOrders()
      const data = response?.data?.data ?? response?.data ?? []
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", data)
        setOrders([])
      } else {
        setOrders(data)
      }
    } catch (error) {
      console.error("❌ Error saat fetchOrders:", error)
      enqueueSnackbar("Gagal memuat order", { variant: "error" })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = Array.isArray(orders)
    ? orders.filter((order) =>
        order.customerDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <div className="flex-grow min-w-[280px] max-w-[600px] px-4 sm:px-8 mt-6 w-full">
      <div className="bg-white dark:bg-gray-900 rounded-xl min-h-[350px] max-h-[460px] flex flex-col border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-gray-900 dark:text-gray-100 text-base sm:text-lg font-semibold tracking-wide">
            Orderan Terbaru
          </h1>
          <a
            href="#"
            className="text-blue-600 dark:text-blue-400 text-sm font-semibold hover:underline"
          >
            Lihat Semua
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-5 py-3 mx-6">
          <FaSearch className="text-gray-500 dark:text-gray-400" />
          <input
            type="text"
            placeholder="Cari Orderan Terbaru"
            className="bg-transparent outline-none text-gray-900 dark:text-gray-100 w-full placeholder:text-gray-400 dark:placeholder:text-gray-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Order List */}
        <div className="mt-4 px-6 overflow-y-auto flex-1 scrollbar-hide">
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              Memuat data...
            </p>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderList key={order._id} order={order} />
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm italic">
              Tidak ada order ditemukan.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default RecentOrders
