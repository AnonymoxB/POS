import React, { useEffect, useState } from 'react'
import BottomNav from '../components/shared/BottomNav'
import OrderCard from '../components/orders/OrderCard'
import BckButton from '../components/shared/BckButton'
import { getOrders } from '../https'

const Orders = () => {
  const [status, setStatus] = useState("all")
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders()
        setOrders(res.data.data || [])
      } catch (err) {
        console.error("Gagal fetch orders:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order =>
    status === "all" ? true : order.orderStatus.toLowerCase() === status
  )

  return (
    <section className='bg-[#1f1f1f] h-[calc(100vh-5rem)] overflow-hidden'>
      <div className='flex items-center justify-between px-10 py-4'>
        <div className='flex items-center gap-4'>
          <BckButton/>
          <h1 className='text-[#f5f5f5] text-2xl font-bold tracking-wide'>Orders</h1>
        </div>
        <div className='flex items-center justify-around gap-4'>
          {["all","progress","ready","completed"].map((s) => (
            <button
              key={s}
              onClick={()=> setStatus(s)}
              className={`text-[#ababab] text-lg ${status === s && "bg-[#383838]"} rounded-lg px-5 py-2 font-semibold`}
            >
              {s === "progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-white text-center mt-10">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-white text-center mt-10">Belum ada order.</p>
      ) : (
        <div className='flex gap-6 px-8 py-4 overflow-x-auto scrollbar-hide'>
        {orders.map(order => (
          <OrderCard key={order._id} order={order} />
        ))}
      </div>

      )}

      <BottomNav/>
    </section>
  )
}

export default Orders
