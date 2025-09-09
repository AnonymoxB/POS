// Menu.jsx
import React, { useEffect } from "react";
import BottomNav from "../components/shared/BottomNav";
import BckButton from "../components/shared/BckButton";
import { MdRestaurantMenu } from "react-icons/md";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import { useSelector } from "react-redux";

const Menu = () => {
  useEffect(() => {
    document.title = "POS | Menu";
  }, []);

  const customerData = useSelector((state) => state.customer);

  return (
    <section className="bg-gray-50 dark:bg-[#1f1f1f] min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-3 overflow-hidden px-2 lg:px-0 transition-colors">

      {/* Left Div */}
      <div className="flex-[3] w-full lg:w-auto flex flex-col">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between px-4 lg:px-10 py-4 gap-4">
          <div className="flex items-center gap-4">
            <BckButton />
            <h1 className="text-gray-900 dark:text-[#f5f5f5] text-2xl font-bold tracking-wider">
              Menu
            </h1>
          </div>
          <div className="flex items-center gap-3 cursor-pointer">
            <MdRestaurantMenu className="text-gray-800 dark:text-[#f5f5f5] text-4xl" />
            <div className="flex flex-col items-start">
              <h1 className="text-md text-gray-900 dark:text-[#f5f5f5] font-semibold tracking-wide">
                {customerData.customerName || "Customer Name"}
              </h1>
              <p className="text-xs text-gray-500 dark:text-[#ababab] font-medium">
                Table: {customerData.table?.tableNo || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Menu Container */}
        <div className="flex-1 overflow-y-auto">
          <MenuContainer />
        </div>
      </div>

      {/* Right Div */}
      <div className="flex-[1] w-full lg:w-auto bg-white dark:bg-[#1a1a1a] rounded-lg pt-2 lg:mt-4 lg:mr-3 flex flex-col max-h-[calc(100vh-6rem)] shadow-md dark:shadow-none border border-gray-200 dark:border-[#2a2a2a] transition-colors">

        {/* Sticky Header */}
        <div className="sticky top-0 bg-white dark:bg-[#1a1a1a] z-10 px-4 py-2">
          <CustomerInfo />
          <hr className="border-gray-200 dark:border-[#2a2a2a] my-2" />
          <CartInfo />
          <hr className="border-gray-200 dark:border-[#2a2a2a] mt-2" />
        </div>

        {/* Scrollable Bill */}
        <div className="sticky bottom-0 bg-white dark:bg-[#1a1a1a] border-t px-4 py-3 z-10">
          <Bill />
        </div>
      </div>

      <BottomNav />
    </section>
  );
};

export default Menu;
