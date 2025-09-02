import React from "react";
import { CiCircleMore } from "react-icons/ci";
import { FaCashRegister, FaTable } from "react-icons/fa";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex items-center justify-between px-4 md:px-10">
      {/* Navigation Buttons */}
      <button
        onClick={() => navigate("/")}
        className={`flex items-center justify-center font-bold w-[22%] md:w-[120px] rounded-[20px] py-2 text-sm md:text-base ${
          isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        }`}
      >
        Home
      </button>
      <button
        onClick={() => navigate("/orders")}
        className={`flex items-center justify-center font-bold w-[22%] md:w-[120px] rounded-[20px] py-2 text-sm md:text-base ${
          isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        }`}
      >
        <FaCashRegister className="mr-2" size={18} /> Orders
      </button>
      <button
        onClick={() => navigate("/tables")}
        className={`flex items-center justify-center font-bold w-[22%] md:w-[120px] rounded-[20px] py-2 text-sm md:text-base ${
          isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        }`}
      >
        <FaTable className="mr-2" size={18} /> Tables
      </button>
      <button
        className="flex items-center justify-center text-[#ababab] w-[22%] md:w-[120px] rounded-[20px] py-2 text-sm md:text-base"
        disabled
      >
        <CiCircleMore className="mr-2" size={18} /> More
      </button>

      {/* Floating Order Button langsung ke menu */}
      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={() => navigate("/menu")}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 flex items-center justify-center shadow-lg hover:bg-yellow-700 transition-colors"
        title="Go to Menu"
      >
        <BiSolidDish size={30} />
      </button>
    </div>
  );
};

export default BottomNav;
