import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: localStorage.getItem("_id") || "",
  name: localStorage.getItem("name") || "",
  email: localStorage.getItem("email") || "",
  phone: localStorage.getItem("phone") || "",
  role: localStorage.getItem("role") || "",
  isAuth: localStorage.getItem("token") ? true : false, // cek ada token apa nggak
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { _id, name, phone, email, role, token } = action.payload;
      state._id = _id;
      state.name = name;
      state.phone = phone;
      state.email = email;
      state.role = role;
      state.isAuth = true;

      // simpan juga ke localStorage biar persist setelah refresh
      localStorage.setItem("_id", _id);
      localStorage.setItem("name", name);
      localStorage.setItem("phone", phone);
      localStorage.setItem("email", email);
      localStorage.setItem("role", role);
      if (token) localStorage.setItem("token", token);
    },

    removeUser: (state) => {
      state._id = "";
      state.email = "";
      state.name = "";
      state.phone = "";
      state.role = "";
      state.isAuth = false;

      // bersihin localStorage juga
      localStorage.removeItem("_id");
      localStorage.removeItem("name");
      localStorage.removeItem("phone");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
