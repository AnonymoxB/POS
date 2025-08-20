import React, { useEffect, useState } from "react";
import { getOrders } from "../../https";

const statusColors = {
  Ready: "bg-green-500 text-white",
  "In Progress": "bg-yellow-500 text-white",
  Pending: "bg-red-500 text-white",
};

const OrderCard = ({ order }) => {
  if (!order) return null;

  const { customerDetails, orderStatus, items, bills, orderDate, orderId } = order;
  const formattedDate = new Date(orderDate).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex-shrink-0 w-80 bg-[#1f1f1f] p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow mr-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-white font-semibold">{customerDetails.name}</h2>
          <p className="text-gray-400 text-sm">{orderId} • {customerDetails.type}</p>
          <p className="text-gray-400 text-xs mt-1">{formattedDate}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[orderStatus] || "bg-gray-500 text-white"}`}>
          {orderStatus}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-t border-gray-700 pt-2">
        {items.map(item => (
          <div key={item.dishId} className="flex justify-between text-gray-300 text-sm">
            <span>{item.name} x {item.qty}</span>
            <span>Rp {item.totalPrice.toLocaleString("id-ID")}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-700">
        <span className="text-gray-400 text-sm">{items.length} Items</span>
        <span className="text-white font-semibold">Rp {bills.total.toLocaleString("id-ID")}</span>
      </div>
    </div>
  );
};

const OrdersList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.data.data || []);
      } catch (err) {
        console.error("Gagal fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="text-white text-center mt-10">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-white text-center mt-10">Belum ada order.</p>;

  return (
    <div className="flex overflow-x-auto space-x-4 px-4 py-6">
      {orders.map(order => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};

export default OrdersList;
