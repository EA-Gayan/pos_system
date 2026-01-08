import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setClearSearchProductList } from "../../redux/slices/productSlice";
import { setClearSearchOrderList } from "../../redux/slices/orderSlice";
import { setClearSearchExpensesList } from "../../redux/slices/expensesSlice";
import { setClearSearchCategoryList } from "../../redux/slices/CategorySlice";

const SearchBar = ({ onSearchChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);

    // If user cleared the input, immediately reset all search lists.
    if (value === "") {
      dispatch(setClearSearchProductList());
      dispatch(setClearSearchOrderList());
      dispatch(setClearSearchExpensesList());
      dispatch(setClearSearchCategoryList());
    }
  };

  const handleClear = () => {
    setSearchValue("");
    onSearchChange("");
    dispatch(setClearSearchProductList());
    dispatch(setClearSearchOrderList());
    dispatch(setClearSearchExpensesList());
    dispatch(setClearSearchCategoryList());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchChange(searchValue);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-5 py-2 w-[500px] border-2 border-transparent focus-within:border-[#f6b100] focus-within:shadow-lg transition-all duration-300">
      <FaSearch className="text-[#f5f5f5] transition-colors duration-200" />
      <input
        type="text"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search"
        className="bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1 placeholder:text-gray-500"
      />
      {searchValue && (
        <IoMdClose
          className="text-[#f5f5f5] cursor-pointer hover:text-[#f6b100] transition-colors duration-200 hover:scale-110"
          onClick={handleClear}
        />
      )}
    </div>
  );
};

export default SearchBar;
