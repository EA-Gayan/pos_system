import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    categoryList: [],
    searchList: [],
};

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setCategoryList: (state, action) => {
            state.categoryList = action.payload;
        },
        clearCategoryList: (state) => {
            state.categoryList = [];
        },
        setSearchCategoryList: (state, action) => {
            state.searchList = action.payload;
        },
        setClearSearchCategoryList: (state, action) => {
            state.searchList = [];
        },
    },
});

export const {
    setCategoryList,
    clearCategoryList,
    setSearchCategoryList,
    setClearSearchCategoryList,
} = categorySlice.actions;
export default categorySlice.reducer;
