import React from "react";

const MiniCard = ({ title, icon, number = 0, footerNum = 0 }) => {
  const isRevenue = title === "Total Pendapatan";

  // Format angka
  const formattedNumber = isRevenue
    ? `Rp ${Number(number).toLocaleString("id-ID")}`
    : Number(number).toLocaleString("id-ID");

  // Warna growth %
  const isPositive = footerNum >= 0;

  return (
    <div className="bg-white dark:bg-[#1a1a1a] py-5 px-5 rounded-lg shadow-sm flex-1 min-w-[280px] transition-colors">
      <div className="flex items-start justify-between">
        <h1 className="text-gray-900 dark:text-gray-100 text-lg font-semibold tracking-wide">
          {title}
        </h1>
        <div
          className={`${
            isRevenue ? "bg-green-500" : "bg-yellow-500"
          } p-3 rounded-lg text-white text-2xl`}
        >
          {icon}
        </div>
      </div>
      <div>
        <h1 className="text-gray-900 dark:text-gray-100 text-4xl font-bold mt-5">
          {formattedNumber}
        </h1>
        <h1 className="text-gray-600 dark:text-gray-300 text-lg mt-2">
          <span
            className={isPositive ? "text-green-500" : "text-red-500"}
          >
            {footerNum}%
          </span>{" "}
          Dibandingkan kemarin
        </h1>
      </div>
    </div>
  );
};

export default MiniCard;
