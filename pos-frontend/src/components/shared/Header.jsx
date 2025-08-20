import React from 'react'
import { FaSearch } from 'react-icons/fa';
import { FaUserCircle } from 'react-icons/fa';
import { FaBell } from 'react-icons/fa';
import logo from "../../assets/images/logo.png";
import { useDispatch, useSelector } from 'react-redux';
import { IoLogOut } from 'react-icons/io5';
import { useMutation } from '@tanstack/react-query';
import { logout } from '../../https';
import {  useNavigate } from 'react-router-dom';
import { removeUser } from '../../redux/slices/userSlices';
import { MdDashboard } from 'react-icons/md';


const Header = () => {

    const userData = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const logoutMutation = useMutation({
        mutationFn: ()=> logout(),
        onSuccess: (data)=> {
            console.log(data);
            dispatch(removeUser());
            navigate("/auth"); 
        },
        onError: (error) => {
            console.log(error);
            dispatch(removeUser());
            navigate("/auth");
        }
    })
    
    const handleLogout = () => {
        logoutMutation.mutate();
    }

  return (
    <header className="bg-[#1a1a1a] px-4 py-3 flex items-center justify-between flex-wrap gap-4">
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <img src={logo} className="h-8 w-8" alt="coffelogo" />
        <h1 className="text-lg font-semibold text-[#f5f5f5] whitespace-nowrap">
          POINT OF SALES
        </h1>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-xl w-full bg-[#1f1f1f] rounded-[20px] flex items-center px-4 py-2 gap-3">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none w-full text-[#f5f5f5] placeholder:text-[#999]"
        />
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-4">
        {userData.role === 'Admin' && (
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#1f1f1f] p-3 rounded-full hover:bg-[#2c2c2c] transition"
          >
            <MdDashboard className="text-[#f5f5f5] text-2xl" />
          </button>
        )}

        <div className="flex items-center gap-3 bg-[#1f1f1f] px-4 py-2 rounded-xl cursor-pointer hover:bg-[#2c2c2c] transition">
          <FaUserCircle className="text-[#f5f5f5] text-2xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-sm font-semibold text-[#f5f5f5]">
              {userData.name || 'Guest User'}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {userData.role || 'N/A'}
            </p>
          </div>
         
        </div>
         <IoLogOut
            onClick={handleLogout}
            size={24}
            className="text-[#f5f5f5] ml-2 hover:text-red-400 transition"
          />
      </div>
    </header>
  )
}

export default Header