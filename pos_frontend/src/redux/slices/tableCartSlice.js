import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  tableId: null,
};

const tableCartSlice = createSlice({
  name: "tableCart",
  initialState,
  reducers: {
    setTableCartItems: (state, action) => {
      state.items = action.payload;
    },
    setTableId: (state, action) => {
      state.tableId = action.payload;
    },
    addTableCartItem: (state, action) => {
      state.items.push(action.payload);
    },
    addTableCombo: (state, action) => {
      const totalPrice = action.payload.totalPrice;
      const totalItems = action.payload.totalItems;

      state.items.push({
        id: `combo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: action.payload.name,
        pricePerQuantity: totalItems > 0 ? totalPrice / totalItems : 0,
        quantity: totalItems,
        price: totalPrice,
        isCombo: true,
        comboProducts: action.payload.products,
      });
    },
    removeTableCartItem: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    clearTableCartItems: (state) => {
      state.items = [];
    },
    incrementTableQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.quantity += 1;
        item.price = item.pricePerQuantity * item.quantity;
      }
    },
    decrementTableQuantity: (state, action) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.price = item.pricePerQuantity * item.quantity;
      }
    },
  },
});

export const getTableTotalPrice = (state) => {
  return state.tableCart.items.reduce((total, item) => total + item.price, 0);
};
export const {
  setTableCartItems,
  setTableId,
  addTableCartItem,
  addTableCombo,
  removeTableCartItem,
  clearTableCartItems,
  incrementTableQuantity,
  decrementTableQuantity,
} = tableCartSlice.actions;
export default tableCartSlice.reducer;
