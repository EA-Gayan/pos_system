import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tableData: [],
};

const tableSlice = createSlice({
  name: "table",
  initialState,
  reducers: {
    setTable: (state, action) => {
      state.tableData = action.payload; // payload is now just the array
    },
  },
});

export const { setTable } = tableSlice.actions;
export default tableSlice.reducer;
