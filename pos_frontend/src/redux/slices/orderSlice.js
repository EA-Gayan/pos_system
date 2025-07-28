import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderList: [],
  searchList: [],
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setOrderList: (state, action) => {
      state.orderList = action.payload;
    },
    clearOrderList: (state) => {
      state.orderList = [];
    },
    setSearchOrderList: (state, action) => {
      state.searchList = action.payload;
    },
    setClearSearchOrderList: (state, action) => {
      state.searchList = [];
    },
  },
});

export const {
  setOrderList,
  clearOrderList,
  setSearchOrderList,
  setClearSearchOrderList,
} = orderSlice.actions;
export default orderSlice.reducer;
