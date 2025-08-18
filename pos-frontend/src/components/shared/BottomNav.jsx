import React, { useState } from "react";
import { CiCircleMore } from "react-icons/ci";
import { FaCashRegister, FaTable } from "react-icons/fa";
import { BiSolidDish } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCustomer } from "../../redux/slices/customerSlices";

import Modal from "./Modal";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestCount, setGuestCount] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState("dinein");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const increment = () => {
    if (guestCount < 6) setGuestCount((prev) => prev + 1);
  };
  const decrement = () => {
    if (guestCount > 0) setGuestCount((prev) => prev - 1);
  };

  const isActive = (path) => location.pathname === path;

  const handleCreateOrder = () => {
    dispatch(
      setCustomer({
        name,
        phone,
        guests: guestCount,
        type: orderType,
      })
    );

    if (orderType === "dinein") {
      navigate("/tables");
    } else {
      navigate("/menu");
    }
    closeModal();
  };

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

      {/* Floating Order Button */}
      <button
        disabled={isActive("/tables") || isActive("/menu")}
        onClick={openModal}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 flex items-center justify-center shadow-lg hover:bg-yellow-700 transition-colors"
        title="Create Order"
      >
        <BiSolidDish size={30} />
      </button>


      {/* Modal for Create Order */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={"Create Order"}>
        <div>
          <label className="block text-[#ababab] mb-2 text-sm font-medium">
            Customer Name
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter customer name"
              className="bg-transparent flex-1 text-white focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-[#ababab] mb-2 mt-3 text-sm font-medium">
            Customer Phone
          </label>
          <div className="flex items-center rounded-lg p-3 px-4 bg-[#1f1f1f]">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+91-9999999999"
              className="bg-transparent flex-1 text-white focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block mb-2 mt-3 text-sm font-medium text-[#ababab]">
            Guest
          </label>
          <div className="flex items-center justify-between bg-[#1f1f1f] px-4 py-3 rounded-lg">
            <button onClick={decrement} className="text-yellow-500 text-2xl">
              &minus;
            </button>
            <span className="text-white">{guestCount} Person{guestCount !== 1 && 's'}</span>
            <button onClick={increment} className="text-yellow-500 text-2xl">
              &#43;
            </button>
          </div>
        </div>
        <div>
          <label className="block mt-4 mb-2 text-sm font-medium text-[#ababab]">
            Order Type
          </label>
          <div className="flex gap-4 text-white">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="dinein"
                checked={orderType === "dinein"}
                onChange={() => setOrderType("dinein")}
                className="cursor-pointer"
              />
              Dine In
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="takeaway"
                checked={orderType === "takeaway"}
                onChange={() => setOrderType("takeaway")}
                className="cursor-pointer"
              />
              Takeaway
            </label>
          </div>
        </div>
        <button
          onClick={handleCreateOrder}
          className="w-full bg-[#F6B100] text-[#f5f5f5] rounded-lg py-3 mt-8 hover:bg-yellow-700 transition-colors"
        >
          Create Order
        </button>
      </Modal>
    </div>
  );
};

export default BottomNav;
