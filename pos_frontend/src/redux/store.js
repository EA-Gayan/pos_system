import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice";
import cartSlice from "./slices/cartSlice";
import userSlice from "./slices/userSlice";
import tableSlice from "./slices/tableSlice";
import productSlice from "./slices/productSlice";
import orderSlice from "./slices/orderSlice";

const store = configureStore({
  reducer: {
    customer: customerSlice,
    cart: cartSlice,
    user: userSlice,
    table: tableSlice,
    product: productSlice,
    order: orderSlice,
  },
});

export default store;
