import React from "react";
import { FaCheckDouble, FaCircle } from "react-icons/fa";

const OrderCard = ({ order }) => {
  if (!order) return null;

  const {
    customerDetails,
    orderStatus,
    items,
    bills,
    orderDate,
  } = order;

  const formattedDate = new Date(orderDate).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const statusColor = orderStatus === "Ready" ? "green-600" : "yellow-500";

  return (
    <div className="w-[500px] bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {customerDetails.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </button>
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {customerDetails.name}
            </h1>
            <p className="text-[#ababab] text-sm">
              {order.orderId} / {customerDetails.type}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <p className={`text-green-600 bg-[#2e4a40] px-2 py-1 rounded-lg`}>
              <FaCheckDouble className="inline mr-2" />
              {orderStatus}
            </p>
            <p className="text-[#ababab] text-sm">
              <FaCircle className={`text-${statusColor} inline mr-2`} />
              {orderStatus} Disajikan
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

export default OrderCard;
