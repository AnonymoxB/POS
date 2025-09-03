import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const Greetings = () => {
  const userData = useSelector((state) => state.user);
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(
      2,
      "0"
    )}, ${date.getFullYear()}`;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-8 mt-4 gap-4">
      <div className="text-left">
        <h1 className="text-gray-900 dark:text-gray-100 text-xl sm:text-2xl font-semibold tracking-wide">
          Selamat{" "}
          {dateTime.getHours() < 12
            ? "Pagi"
            : dateTime.getHours() < 18
            ? "Siang"
            : "Malam"}
          , {userData.name || "User"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Berikan pelayanan terbaik untuk pelanggan
        </p>
      </div>
      <div className="text-right sm:text-left min-w-[130px]">
        <h1 className="text-gray-900 dark:text-gray-100 text-xl sm:text-2xl font-semibold tracking-wide">
          {formatTime(dateTime)}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {formatDate(dateTime)}
        </p>
      </div>
    </div>
  );
};

export default Greetings;
