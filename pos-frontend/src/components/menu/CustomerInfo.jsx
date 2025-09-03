import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatDate, getAvatarName } from "../../utils";

const CustomerInfo = () => {
  const [dateTime] = useState(new Date());
  const customerData = useSelector((state) => state.customer);

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex flex-col items-start">
        {/* Nama Customer */}
        <h1 className="text-md text-gray-900 dark:text-gray-100 font-semibold tracking-wide">
          {customerData.customerName || "Customer Name"}
        </h1>

        {/* Order Id + Type */}
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-1">
          #{customerData.orderId || "N/A"} /{" "}
          {customerData.type === "takeaway" ? "Takeaway" : "Dine In"}
        </p>

        {/* Waktu */}
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-2">
          {formatDate(dateTime)}
        </p>
      </div>

      {/* Avatar */}
      <button className="bg-yellow-400 dark:bg-yellow-500 text-gray-900 dark:text-gray-100 p-3 text-xl font-bold rounded-lg">
        {getAvatarName(customerData.customerName) || "CN"}
      </button>
    </div>
  );
};

export default CustomerInfo;
