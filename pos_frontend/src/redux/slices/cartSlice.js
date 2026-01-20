import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItems: (state, action) => {
      state.push(action.payload);
    },
    addCombo: (state, action) => {
      // Add combo as a special cart item
      const totalPrice = action.payload.totalPrice;
      const totalItems = action.payload.totalItems;
      
      state.push({
        id: `combo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: action.payload.name,
        pricePerQuantity: totalItems > 0 ? totalPrice / totalItems : 0,
        quantity: totalItems,
        price: totalPrice,
        isCombo: true,
        comboProducts: action.payload.products,
      });
    },
    removeItem: (state, action) => {
      return state.filter((item) => item.id !== action.payload);
    },
    removeAllItems: () => {
      return [];
    },
  },
});

export const getTotalPrice = (state) => {
  return state.cart.reduce((total, item) => total + item.price, 0);
};
export const { addItems, addCombo, removeItem, removeAllItems } = cartSlice.actions;
export default cartSlice.reducer;
