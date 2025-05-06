import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice"; // Import your slices here
import cartSlice from "./slices/cartSlice";

const store = configureStore({
  reducer: { customer: customerSlice, cart: cartSlice }, // Add your reducers here
});

export default store;
