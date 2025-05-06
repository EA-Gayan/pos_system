import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice"; // Import your slices here

const store = configureStore({
  reducer: { customer: customerSlice }, // Add your reducers here
});

export default store;
