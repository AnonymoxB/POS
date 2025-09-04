import React, { useState, useEffect } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";
import { BsSun, BsMoon } from "react-icons/bs";
import logo from "../../assets/images/logo.png";

import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logout } from "../../https";
import { removeUser } from "../../redux/slices/userSlices";

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // toggle dark mode di <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-md px-4 py-3 flex items-center justify-between flex-wrap gap-4 transition-colors">
    {/* Logo */}
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => navigate("/")}
    >
      <img src={logo} className="h-8 w-8" alt="coffelogo" />
      <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
        POINT OF SALES
      </h1>
    </div>

    {/* Search */}
    {/* <div className="flex-1 max-w-xl w-full bg-gray-100 dark:bg-gray-800 rounded-[20px] flex items-center px-4 py-2 gap-3">
      <FaSearch className="text-gray-500 dark:text-gray-400" />
      <input
        type="text"
        placeholder="Search"
        className="bg-transparent outline-none w-full text-gray-800 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
      />
    </div> */}

    {/* Right Side */}
    <div className="flex items-center gap-4">
      {userData.role === "Admin" && (
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <MdDashboard className="text-gray-700 dark:text-gray-200 text-2xl" />
        </button>
      )}

      {/* User */}
      <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        <FaUserCircle className="text-gray-600 dark:text-gray-200 text-2xl" />
        <div className="flex flex-col items-start">
          <h1 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {userData.name || "Guest User"}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {userData.role || "N/A"}
          </p>
        </div>
      </div>

      {/* Toggle Dark/Light */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        {darkMode ? (
          <BsSun className="text-yellow-400 text-xl" />
        ) : (
          <BsMoon className="text-gray-700 text-xl" />
        )}
      </button>

      {/* Logout */}
      <IoLogOut
        onClick={handleLogout}
        size={24}
        className="text-gray-600 dark:text-gray-200 ml-2 hover:text-red-500 transition cursor-pointer"
      />
    </div>
  </header>

  );
};

export default Header;
