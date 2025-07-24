import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  productList: [],
  searchList: [],
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProductList: (state, action) => {
      state.productList = action.payload;
    },
    clearProductList: (state) => {
      state.productList = [];
    },
    setSearchProductList: (state, action) => {
      state.searchList = action.payload;
    },
    setClearSearchProductList: (state, action) => {
      state.searchList = [];
    },
  },
});

export const {
  setProductList,
  clearProductList,
  setSearchProductList,
  setClearSearchProductList,
} = productSlice.actions;
export default productSlice.reducer;
