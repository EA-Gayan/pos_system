import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { setClearSearchProductList } from "../../redux/slices/productSlice";

const SearchBar = ({ onSearchChange }) => {
  const [searchValue, setSearchValue] = useState("");
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange(value);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearchChange("");
    dispatch(setClearSearchProductList());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      onSearchChange(searchValue);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-5 py-2 w-[500px]">
      <FaSearch className="text-[#f5f5f5]" />
      <input
        type="text"
        value={searchValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Search"
        className="bg-[#1f1f1f] outline-none text-[#f5f5f5] flex-1"
      />
      {searchValue && (
        <IoMdClose
          className="text-[#f5f5f5] cursor-pointer"
          onClick={handleClear}
        />
      )}
    </div>
  );
};

export default SearchBar;
