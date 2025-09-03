import React from "react";
import { FaCheckDouble, FaCircle } from "react-icons/fa";

const OrderList = ({ order }) => {
  const { customerDetails, items, table, orderStatus } = order;

  return (
    <div className="flex items-center gap-5 mb-3">
      {/* Avatar inisial nama customer */}
      <div className="bg-yellow-500 text-white p-3 text-xl font-bold rounded-lg">
        {customerDetails?.name?.slice(0, 2).toUpperCase() || "NA"}
      </div>

      <div className="grid grid-cols-3 w-full items-center">
        {/* Kiri: Nama & jumlah item */}
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-gray-900 dark:text-gray-100 text-lg font-semibold tracking-wide">
            {customerDetails?.name || "Tanpa Nama"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {Array.isArray(items) ? items.length : 0} Item
          </p>
        </div>

        {/* Tengah: Nomor meja / takeaway */}
        <div className="flex justify-center">
          <h1 className="text-yellow-600 border border-yellow-500 rounded-lg px-2 py-1 text-sm font-medium">
            {table?.tableNo ? `Meja No: ${table.tableNo}` : "Takeaway"}
          </h1>
        </div>

        {/* Kanan: Status order */}
        <div className="flex flex-col items-end gap-2">
          <p
            className={`flex items-center text-sm font-medium ${
              orderStatus === "In Progress" ? "text-yellow-600" : "text-green-600"
            }`}
          >
            <FaCheckDouble className="mr-2" />
            {orderStatus === "In Progress" ? "Diproses" : "Siap"}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
            <FaCircle
              className={`mr-2 ${
                orderStatus === "In Progress" ? "text-yellow-500" : "text-green-600"
              }`}
            />
            {orderStatus === "In Progress" ? "Segera Disajikan" : "Siap Disajikan"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
