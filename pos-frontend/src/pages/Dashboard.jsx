import React, { useState, useEffect } from "react";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Dish from "../components/dashboard/dish/Dish";
import Modal from "../components/dashboard/Modal";
import AddCategoryModal from "../components/dashboard/category/AddCategoryModal";
import AddDishModal from "../components/dashboard/dish/AddDishModal";
import Payment from "../components/dashboard/Payment";
import Category from "../components/dashboard/category/Category";
import Table from "../components/dashboard/table/Table";
import Unit from "../components/dashboard/unit/Unit";
import Product from "../components/dashboard/product/Product";
import Purchase from "../components/dashboard/purchase/Purchase";
import ProductCategoryPage from "../components/dashboard/productcateg/ProductCategory";
import Supplier from "../components/dashboard/supplier/Supplier";
import Stock from "../components/dashboard/Stock";

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
  Scale,
  ChevronDown,
  ChevronRight,
  PackagePlus,
  LayoutList,
  ContactRound,
  Wheat
} from "lucide-react";
import DishBOM from "../components/dashboard/dishBOM/DishBOM";
import DishBOMPage from "../components/dashboard/dishBOM/DishBOMPage";
import Expense from "../components/dashboard/expense/Expense";



// Grup tab (Metrics pindah ke Dashboard group)
const tabGroups = [
  {
    group: "Dashboard",
    items: [{ name: "Metrics", icon: LayoutDashboard }],
  },
  {
    group: "Master Data",
    items: [
      { name: "Table", icon: TableIcon },
      { name: "Category", icon: List },
      { name: "Dish", icon: UtensilsCrossed },
      { name: "Dish BOM", icon: Wheat},
      { name: "Unit", icon: Scale },
      { name: "Product", icon: PackagePlus},
      { name: "Product Category", icon: LayoutList},
      { name: "Supplier", icon: ContactRound}
    ],
  },
  {
    group: "Transaksi",
    items: [
      { name: "Orders", icon: ShoppingCart },
      { name: "Purchase", icon: Package },
      { name: "Expenses", icon: Receipt },
      { name: "Payments", icon: Wallet },
    ],
  },
  {
    group: "Inventory",
    items: [{ name: "Stock", icon: Boxes }],
  },
];

// Sidebar
const Sidebar = ({ activeTab, setActiveTab }) => {
  const [openGroup, setOpenGroup] = useState("Dashboard"); // default buka Dashboard

  return (
    <div className="w-60 bg-[#1a1a1a] border-r border-gray-700 flex flex-col p-4">
      <h1 className="text-white text-center font-bold text-lg mb-6">
        Dashboard
      </h1>

      <nav className="flex flex-col gap-2">
        {tabGroups.map((group) => (
          <div key={group.group} className="mb-2">
            {/* Group header */}
            <button
              onClick={() =>
                setOpenGroup(openGroup === group.group ? "" : group.group)
              }
              className="flex items-center justify-between w-full px-4 py-2 text-gray-400 hover:text-white"
            >
              <span className="text-xs uppercase tracking-wide">
                {group.group}
              </span>
              {openGroup === group.group ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>

            {/* Items kalau group aktif */}
            {openGroup === group.group && (
              <div className="flex flex-col gap-1 mt-1">
                {group.items.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`flex items-center gap-3 px-6 py-2 rounded-md text-sm font-medium ${
                        activeTab === tab.name
                          ? "bg-[#262626] text-green-500"
                          : "text-gray-300 hover:bg-[#262626]"
                      }`}
                    >
                      <Icon size={18} />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

// Dashboard utama
const Dashboard = () => {
  useEffect(() => {
    document.title = "POS | Admin Dashboard";
  }, []);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("Metrics"); // default Metrics aktif

  return (
    <div className="flex bg-[#1f1f1f] h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "Metrics" && <Metrics />}
        {activeTab === "Orders" && <RecentOrders />}
        {activeTab === "Payments" && <Payment />}
        {activeTab === "Dish" && <Dish />}
        {activeTab === "Category" && <Category />}
        {activeTab === "Table" && <Table />}
        {activeTab === "Unit" && <Unit />}
        {activeTab === "Product" && <Product />}
        {activeTab === "Product Category" && <ProductCategoryPage/>}
        {activeTab === "Purchase" && <Purchase/>}
        {activeTab === "Supplier" && <Supplier/>}
        {activeTab === "Stock" && <Stock/>}
        {activeTab === "Dish BOM" && <DishBOMPage/>}
        {activeTab === "Expenses" && <Expense/>}
        
      </div>

      {/* Modals */}
      {isTableModalOpen && (
        <Modal setIsTableModalOpen={setIsTableModalOpen} />
      )}
      {isCategoryModalOpen && (
        <AddCategoryModal setIsCategoryModalOpen={setIsCategoryModalOpen} />
      )}
      {isDishModalOpen && (
        <AddDishModal setIsDishModalOpen={setIsDishModalOpen} />
      )}
    </div>
  );
};

export default Dashboard;
