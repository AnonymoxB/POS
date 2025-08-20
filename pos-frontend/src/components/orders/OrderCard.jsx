import React, { useEffect, useState } from "react";
import { FaCheckDouble, FaCircle } from "react-icons/fa";
import { getOrders } from "../../https";

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
    <div className="flex-shrink-0 w-80 bg-[#262626] p-4 rounded-xl mb-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-2">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {customerDetails.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </button>
        <div className="flex-1 flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-[#f5f5f5] font-semibold">{customerDetails.name}</h1>
            <p className="text-[#ababab] text-sm">{orderId} / {customerDetails.type}</p>
            <p className="text-[#ababab] text-xs">{formattedDate}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg text-sm flex items-center">
              <FaCheckDouble className="mr-1" /> {orderStatus}
            </span>
            <span className="text-[#ababab] text-xs flex items-center">
              <FaCircle className="text-green-600 mr-1" /> Siap Disajikan
            </span>
          </div>
        </div>
      </div>
      <hr className="border-gray-700 my-2" />
      <div className="flex justify-between text-[#f5f5f5] font-semibold">
        <span>{items.length} Items</span>
        <span>Rp {bills.total.toLocaleString("id-ID")}</span>
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
    <div className="flex overflow-x-auto gap-4 px-4 py-6">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};

export default OrdersList;
