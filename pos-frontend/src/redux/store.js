import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlices"
import cartSlice from "./slices/cartSlices";
import userSlice from "./slices/userSlices";

const store = configureStore({
    reducer: {
        customer: customerSlice,
        cart : cartSlice,
        user : userSlice
    },

    devTools: import.meta.env.NODE_ENV !== "production",
});

export default store;