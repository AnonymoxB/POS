import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";

import { login } from "../../https/index";
import { setUser } from "../../redux/slices/userSlices";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (reqData) => login(reqData),
    onSuccess: (res) => {
      const { data: user, token } = res.data;

      // Simpan token ke localStorage
      localStorage.setItem("token", token);

      // Simpan user ke redux
      dispatch(
        setUser({
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          token,
        })
      );

      enqueueSnackbar("Login berhasil", { variant: "success" });
      navigate("/");
    },
    onError: (error) => {
      console.error("Login error:", error);

      if (error.response?.data?.message) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar("Gagal login. Coba lagi nanti.", { variant: "error" });
      }
    },
  });

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Email */}
      <div>
        <label className="block text-gray-600 mb-2 text-sm font-medium">
          Employee Email
        </label>
        <div className="flex items-center rounded-lg px-4 bg-gray-100 border border-gray-300">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter employee email"
            className="bg-transparent flex-1 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
            required
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-gray-600 mb-2 text-sm font-medium">
          Password
        </label>
        <div className="flex items-center rounded-lg px-4 bg-gray-100 border border-gray-300">
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="bg-transparent flex-1 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loginMutation.isLoading}
        className="w-full rounded-lg py-3 text-lg bg-yellow-400 text-gray-900 font-bold disabled:opacity-50 hover:bg-yellow-500 transition"
      >
        {loginMutation.isLoading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
};

export default Login;
