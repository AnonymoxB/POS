import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
    name : "cart",
    initialState,
    reducers : {
        addItems: (state, action) => {
        const { id, name, variant, quantity, pricePerQuantity } = action.payload;
        const existing = state.find(
            item => item.id === id && item.name === name && item.variant === variant
        );

        if (existing) {
            existing.quantity += quantity;
            existing.price += pricePerQuantity * quantity;
        } else {
            state.push(action.payload);
        }
        },




        removeItem: (state, action) => {
        return state.filter(item => item.id !== action.payload);
        },


        removeAllItems: () => {
            return [];
        },

        increaseQty: (state, action) => {
        const item = state.find(i => i.id === action.payload);
        if (item) {
            item.quantity += 1;
            item.price += item.pricePerQuantity;
        }
        },

        decreaseQty: (state, action) => {
        const item = state.find(i => i.id === action.payload);
        if (item && item.quantity > 1) {
            item.quantity -= 1;
            item.price -= item.pricePerQuantity;
        }
        },


    }
})



export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);
export const { addItems, removeItem, removeAllItems, increaseQty, decreaseQty } = cartSlice.actions;
export default cartSlice.reducer;