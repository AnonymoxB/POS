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
import DishBOMPage from "../components/dashboard/dishBOM/DishBOMPage";
import Expense from "../components/dashboard/expense/Expense";

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
  ChevronLeft,
  PackagePlus,
  LayoutList,
  ContactRound,
  Wheat,
  ChartNoAxesCombinedIcon,
  PencilRuler
} from "lucide-react";
import ProfitPerDish from "../components/dashboard/ProfitPerDish";
import AdjustmentStock from "../components/dashboard/AdjustmentStock";

// Grup tab
const tabGroups = [
  {
    group: "Dashboard",
    items: [
      { name: "Metrics", icon: LayoutDashboard },
      { name: "Profit per Dish", icon: ChartNoAxesCombinedIcon },
    ],
  },
  {
    group: "Master Data",
    items: [
      // { name: "Table", icon: TableIcon },
      { name: "Category", icon: List },
      { name: "Dish", icon: UtensilsCrossed },
      { name: "Dish BOM", icon: Wheat },
      { name: "Unit", icon: Scale },
      { name: "Product", icon: PackagePlus },
      { name: "Product Category", icon: LayoutList },
      { name: "Supplier", icon: ContactRound },
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
    items: [
      { name: "Stock", icon: Boxes },
      { name: "Stock Adjustment", icon: PencilRuler}
    ],
    
  },
];

// Sidebar
const Sidebar = ({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen }) => {
  const [openGroup, setOpenGroup] = useState("Dashboard");

  return (
    <div
      className={`${
        isSidebarOpen ? "w-60" : "w-16"
      } bg-gray-100 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 flex flex-col p-4 transition-all duration-300`}
    >
      {/* Header + toggle */}
      <div className="flex items-center justify-between mb-6">
        {isSidebarOpen && (
          <h1 className="text-gray-900 dark:text-white font-bold text-lg">
            Dashboard
          </h1>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        {tabGroups.map((group) => (
          <div key={group.group} className="mb-2">
            {/* Group header */}
            {isSidebarOpen && (
              <button
                onClick={() =>
                  setOpenGroup(openGroup === group.group ? "" : group.group)
                }
                className="flex items-center justify-between w-full px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
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
            )}

            {/* Items */}
            {openGroup === group.group && (
              <div className="flex flex-col gap-1 mt-1">
                {group.items.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.name}
                      onClick={() => setActiveTab(tab.name)}
                      className={`flex items-center ${
                        isSidebarOpen ? "gap-3 px-6" : "justify-center"
                      } py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          activeTab === tab.name
                            ? "bg-gray-200 text-green-600 dark:bg-gray-800 dark:text-green-400"
                            : "text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                    >
                      <Icon size={18} />
                      {isSidebarOpen && tab.name}
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

  const [activeTab, setActiveTab] = useState("Metrics");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 h-[calc(100vh-5rem)]">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === "Metrics" && <Metrics />}
        {activeTab === "Orders" && <RecentOrders />}
        {activeTab === "Payments" && <Payment />}
        {activeTab === "Dish" && <Dish />}
        {activeTab === "Category" && <Category />}
        {/* {activeTab === "Table" && <Table />} */}
        {activeTab === "Unit" && <Unit />}
        {activeTab === "Product" && <Product />}
        {activeTab === "Product Category" && <ProductCategoryPage />}
        {activeTab === "Purchase" && <Purchase />}
        {activeTab === "Supplier" && <Supplier />}
        {activeTab === "Stock" && <Stock />}
        {activeTab === "Dish BOM" && <DishBOMPage />}
        {activeTab === "Expenses" && <Expense />}
        {activeTab === "Profit per Dish" && <ProfitPerDish/>}
        {activeTab === "Stock Adjustment" && <AdjustmentStock/>}

      </div>

      {/* Modals */}
      {isTableModalOpen && <Modal setIsTableModalOpen={setIsTableModalOpen} />}
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
