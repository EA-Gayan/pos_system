import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  expensesList: [],
  searchList: [],
};

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    setExpensesList: (state, action) => {
      state.expensesList = action.payload;
    },
    clearExpensesList: (state) => {
      state.expensesList = [];
    },
    setSearchExpensesList: (state, action) => {
      state.searchList = action.payload;
    },
    setClearSearchExpensesList: (state, action) => {
      state.searchList = [];
    },
  },
});

export const {
  setExpensesList,
  clearExpensesList,
  setSearchExpensesList,
  setClearSearchExpensesList,
} = expensesSlice.actions;
export default expensesSlice.reducer;
