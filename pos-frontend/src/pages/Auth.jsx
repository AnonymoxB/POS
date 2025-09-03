import React from "react";
import { BiSolidCoffeeTogo } from "react-icons/bi";
import Login from "../components/auth/Login";

const Auth = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">
        {/* Logo & Title */}
        <div className="flex flex-col items-center mb-6">
          <BiSolidCoffeeTogo className="h-16 w-16 text-black border-2 border-yellow-400 rounded-full p-3" />
          <h1 className="text-2xl mt-2 font-semibold text-black">
            Login
          </h1>
        </div>

        {/* Login Form */}
        <Login />
      </div>
    </div>
  );
};

export default Auth;
