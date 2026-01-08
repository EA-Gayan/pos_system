import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice";
import cartSlice from "./slices/cartSlice";
import userSlice from "./slices/userSlice";
import tableSlice from "./slices/tableSlice";
import productSlice from "./slices/productSlice";
import orderSlice from "./slices/orderSlice";
import expensesSlice from "./slices/expensesSlice";
import categorySlice from "./slices/CategorySlice"

const store = configureStore({
  reducer: {
    customer: customerSlice,
    cart: cartSlice,
    user: userSlice,
    table: tableSlice,
    product: productSlice,
    order: orderSlice,
    expenses: expensesSlice,
    category: categorySlice
  },
});

export default store;
