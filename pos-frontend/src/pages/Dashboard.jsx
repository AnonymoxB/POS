import React, { useState, useEffect } from "react";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Dish from "../components/dashboard/Dish";
import Modal from "../components/dashboard/Modal";
import AddCategoryModal from "../components/dashboard/AddCategoryModal";
import AddDishModal from "../components/dashboard/AddDishModal";
import Payment from "../components/dashboard/Payment";
import Category from "../components/dashboard/Category";
import Table from "../components/dashboard/Table";
import Unit from "../components/dashboard/Unit";

import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  Table as TableIcon,
  List,
  Package,
  Wallet,
  Receipt,
  Boxes,
  Scale
} from "lucide-react";


// daftar tab
const tabs = [
  { name: "Metrics", icon: LayoutDashboard },
  { name: "Table", icon: TableIcon },
  { name: "Category", icon: List },
  { name: "Dish", icon: UtensilsCrossed },
  { name: "Unit", icon: Scale },
  { name: "Orders", icon: ShoppingCart },
  { name: "Purchase", icon: Package },
  { name: "Expenses", icon: Receipt },
  { name: "Stock", icon: Boxes },
  { name: "Payments", icon: Wallet },
  
];

const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");

  return (
    <div className="flex bg-[#1f1f1f] h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <div className="w-60 bg-[#1a1a1a] border-r border-gray-700 flex flex-col p-4">
        <h1 className="text-white text-center font-bold text-lg mb-6">Dashboard</h1>

        <nav className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.name}
                className={`flex items-center gap-3 text-left px-4 py-2 rounded-md font-medium ${
                  activeTab === tab.name
                    ? "bg-[#262626] text-green-500"
                    : "text-gray-300 hover:bg-[#262626]"
                }`}
                onClick={() => setActiveTab(tab.name)}
              >
                <Icon size={18} />
                {tab.name}        
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "Metrics" && <Metrics />}
        {activeTab === "Orders" && <RecentOrders />}
        {activeTab === "Payments" && <Payment />}
        {activeTab === "Dish" && <Dish />}
        {activeTab === "Category" && <Category />}
        {activeTab === "Table" && <Table />}
        {activeTab === "Unit" && <Unit/>}
      </div>

      {/* Modal Add Table */}
      {isTableModalOpen && <Modal setIsTableModalOpen={setIsTableModalOpen} />}

      {/* Modal Add Category */}
      {isCategoryModalOpen && (
        <AddCategoryModal setIsCategoryModalOpen={setIsCategoryModalOpen} />
      )}

      {/* Modal add Dish */}
      {isDishModalOpen && (
        <AddDishModal setIsDishModalOpen={setIsDishModalOpen} />
      )}
    </div>
  );
};

export default Dashboard;
