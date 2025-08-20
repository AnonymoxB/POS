import React from "react";
import { FaCircle } from "react-icons/fa";

const OrderCard = ({ order, onStatusChange }) => {
  if (!order) return null;

  const { customerDetails = {}, orderStatus, items = [], bills = {}, orderDate, orderId } =
    order;

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
      case "in progress":
        return {
          color: "text-yellow-500",
          bg: "bg-yellow-800/40",
          icon: <FaCircle className="text-yellow-500 inline mr-2" />,
          label: "Sedang Diproses",
        };
      case "ready":
        return {
          color: "text-blue-500",
          bg: "bg-blue-800/40",
          icon: <FaCircle className="text-blue-500 inline mr-2" />,
          label: "Siap Disajikan",
        };
      case "completed":
        return {
          color: "text-green-600",
          bg: "bg-[#2e4a40]",
          icon: <FaCircle className="text-green-600 inline mr-2" />,
          label: "Selesai",
        };
      default:
        return {
          color: "text-gray-400",
          bg: "bg-gray-700",
          icon: <FaCircle className="text-gray-400 inline mr-2" />,
          label: "Unknown",
        };
    }
  };

  const statusStyle = getStatusStyle(orderStatus);

  return (
    <div className="w-[500px] bg-[#262626] p-4 rounded-lg mb-4">
      <div className="flex items-center gap-5">
        <button className="bg-[#f6b100] p-3 text-xl font-bold rounded-lg">
          {customerDetails?.name
            ? customerDetails.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "?"}
        </button>

        <div className="flex items-center justify-between w-[100%]">
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-[#f5f5f5] text-lg font-semibold tracking-wide">
              {customerDetails?.name || "Unknown"}
            </h1>
            <p className="text-[#ababab] text-sm">
              #{orderId} / {customerDetails?.type || "-"}
            </p>
          </div>

          {/* Status Dropdown */}
          <div className="flex flex-col items-end gap-2">
            <select
              value={orderStatus}
              onChange={(e) =>
                onStatusChange && onStatusChange(order._id, e.target.value)
              }
              className={`text-sm font-semibold rounded-lg px-2 py-1 ${statusStyle.color} ${statusStyle.bg}`}
            >
              <option value="In Progress">In Progress</option>
              <option value="Ready">Ready</option>
              <option value="Completed">Completed</option>
            </select>

            <p className="text-[#ababab] text-sm flex items-center">
              {statusStyle.icon}
              {statusStyle.label}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 text-[#ababab]">
        <p>{formattedDate}</p>
        <p>{items?.length || 0} Items</p>
      </div>

      <hr className="w-full mt-4 border-t-1 border-gray-500" />

      <div className="flex items-center justify-between mt-4">
        <h1 className="text-[#f5f5f5] text-lg font-semibold">Total</h1>
        <p className="text-[#f5f5f5] text-lg font-semibold">
          Rp {(bills.totalWithTax || bills.total || 0).toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
};

export default OrderCard;
