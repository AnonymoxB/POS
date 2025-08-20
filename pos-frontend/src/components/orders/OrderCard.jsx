import React, { useEffect, useState } from "react";
import { FaCheckDouble, FaCircle } from "react-icons/fa";
import { getOrders } from "../../https";

const OrderCard = ({ order }) => {
    if (!order) return null;
  
    const { customerDetails, orderStatus, items, bills, orderDate, orderId } = order;
  
    const formattedDate = new Date(orderDate).toLocaleString("id-ID", {
        weekday: "long", 
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
  
    const getStatusStyle = (status) => {
      switch (status.toLowerCase()) {
        case "progress":
          return {
            color: "text-yellow-500",
            bg: "bg-yellow-800/40",
            icon: <FaCircle className="text-yellow-500 inline mr-2" />,
          };
        case "ready":
          return {
            color: "text-blue-500",
            bg: "bg-blue-800/40",
            icon: <FaCircle className="text-blue-500 inline mr-2" />,
          };
        case "completed":
          return {
            color: "text-green-600",
            bg: "bg-[#2e4a40]",
            icon: <FaCircle className="text-green-600 inline mr-2" />,
          };
        default:
          return {
            color: "text-gray-400",
            bg: "bg-gray-700",
            icon: <FaCircle className="text-gray-400 inline mr-2" />,
          };
      }
    };
  
    const statusStyle = getStatusStyle(orderStatus);
  
    return (
      <div className="w-[500px] bg-[#262626] p-4 rounded-lg mb-4">
        <div className="flex items-center gap-5">
          <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
            {customerDetails.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </button>
  
          <div className="flex items-center justify-between w-[100%]">
            <div className="flex flex-col items-start gap-1">
              <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
                {customerDetails.name}
              </h1>
              <p className="text-[#ababab] text-sm">
                #{orderId} / {customerDetails.type}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className={`${statusStyle.color} ${statusStyle.bg} px-2 py-1 rounded-lg flex items-center`}>
                <FaCheckDouble className="inline mr-2" />
                {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
              </p>
              <p className="text-[#ababab] text-sm flex items-center">
                {statusStyle.icon}
                {orderStatus === "completed"
                  ? "Selesai"
                  : orderStatus === "ready"
                  ? "Siap Disajikan"
                  : "Sedang Diproses"}
              </p>
            </div>
          </div>
        </div>
  
        <div className="flex justify-between items-center mt-4 text-[#ababab]">
          <p>{formattedDate}</p>
          <p>{items.length} Items</p>
        </div>
  
        <hr className="w-full mt-4 border-t-1 border-gray-500" />
  
        <div className="flex items-center justify-between mt-4">
          <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
          <p className="text-[#f5f5f5] text-lg font-semibold">
            Rp {bills.total.toLocaleString("id-ID")}
          </p>
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
        setOrders(response.data.data); // sesuai response dari backend
      } catch (err) {
        console.error("Gagal fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <p className="text-white">Loading orders...</p>;
  if (orders.length === 0) return <p className="text-white">Belum ada order.</p>;

  return (
    <div className="flex flex-col items-center mt-10">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
};


export default OrdersList;
