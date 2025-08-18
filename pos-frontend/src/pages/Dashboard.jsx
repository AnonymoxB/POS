import React, { useState, useEffect } from "react";
import { MdTableBar, MdCategory } from "react-icons/md";
import { BiSolidDish } from "react-icons/bi";
import Metrics from "../components/dashboard/Metrics";
import RecentOrders from "../components/dashboard/RecentOrders";
import Dish from "../components/dashboard/Dish";
import Modal from "../components/dashboard/Modal";
import AddCategoryModal from "../components/dashboard/AddCategoryModal";
import AddDishModal from "../components/dashboard/AddDishModal";
import Payment from "../components/dashboard/Payment";
import Category from "../components/dashboard/Category";
import Table from "../components/dashboard/Table";


const tabs = ["Metrics", "Table", "Category", "Dish", "Orders", "Payments"];

const Dashboard = () => {

  useEffect(() => {
    document.title = "POS | Admin Dashboard"
  }, [])

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDishModalOpen,setIsDishModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Metrics");

  

  return (
    <div className="bg-[#1f1f1f] h-[calc(100vh-5rem)]">
      <div className="container mx-auto flex items-center justify-between py-14 px-6 md:px-4">
        {/* <div className="flex items-center gap-3">
          
        </div> */}

        <div className="flex items-center gap-3">
          {tabs.map((tab) => {
            return (
              <button
                key={tab}
                className={`
                px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2 ${
                  activeTab === tab
                    ? "bg-[#262626]"
                    : "bg-[#1a1a1a] hover:bg-[#262626]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === "Metrics" && <Metrics />}
      {activeTab === "Orders" && <RecentOrders />}
      {activeTab === "Payments" && <Payment/>}
      {activeTab === "Dish" && <Dish/>}
      {activeTab === "Category" && <Category/>}
      {activeTab === "Table" && <Table/>}
      

      {/* Modal Add Table */}
      {isTableModalOpen && <Modal setIsTableModalOpen={setIsTableModalOpen} />}

      {/* Modal Add Category */}
      {isCategoryModalOpen && (
        <AddCategoryModal setIsCategoryModalOpen={setIsCategoryModalOpen} />
      )}
      {/* Modal add Dish */}
      {isDishModalOpen && (
        <AddDishModal setIsDishModalOpen={setIsDishModalOpen}/>
      )}
    </div>
  );
};

export default Dashboard;