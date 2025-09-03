import React from "react";
import { FaCashRegister } from "react-icons/fa";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { SiHomebridge } from "react-icons/si";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-700 p-2 h-16 flex items-center justify-between px-4 md:px-10 transition-colors">
      {/* Home */}
      <button
        onClick={() => navigate("/")}
        className={`flex items-center justify-center font-medium w-[22%] md:w-[120px] rounded-[20px] py-2 text-sm md:text-base transition ${
          isActive("/")
            ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/40"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        <SiHomebridge className="mr-2" size={18} />Home
      </button>

      {/* Orders */}
      <button
        onClick={() => navigate("/orders")}
        className={`flex items-center justify-center font-medium w-[22%] md:w-[120px] rounded-[20px] py-2 text-sm md:text-base transition ${
          isActive("/orders")
            ? "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/40"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        <FaCashRegister className="mr-2" size={18} /> Orders
      </button>

      {/* Floating Menu Button */}
      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={() => navigate("/menu")}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white rounded-full p-4 flex items-center justify-center shadow-lg hover:bg-yellow-600 transition-colors disabled:opacity-60"
        title="Go to Menu"
      >
        <BiSolidDish size={28} />
      </button>
    </div>
  );
};

export default BottomNav;
