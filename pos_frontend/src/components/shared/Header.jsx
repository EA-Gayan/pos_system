import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FaUserCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo-modified.png";
import { logout, searchCategory } from "../../https";
import { removeUser } from "../../redux/slices/userSlice";
import SearchBar from "./SearchBar";
import { searchProduct } from "../../https";
import { setSearchProductList } from "../../redux/slices/productSlice";
import { getfindOrders } from "../../https";
import { setSearchOrderList } from "../../redux/slices/orderSlice";
import { OrderTypes } from "../../enum/orderTypes";
import { enqueueSnackbar } from "notistack";
import { searchExpenseRecord } from "../../https";
import { setSearchExpensesList } from "../../redux/slices/expensesSlice";
import { setSearchCategoryList } from "../../redux/slices/CategorySlice";

const meals = [
  { name: "Breakfast", value: 1 },
  { name: "Lunch", value: 2 },
  { name: "Dinner", value: 3 },
];

const Header = () => {
  const userData = {
    name: localStorage.getItem("name"),
    role: localStorage.getItem("role"),
  };
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedMeal, setSelectedMeal] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false);
  const [isShowMenuTypeIcon, setIsShowMenuTypeIcon] = useState(false);
  const [isShowSearch, setIsShowSearch] = useState(false);
  const [pageName, setPageName] = useState("");

  const dropdownRef = useRef();
  const calendarDropdownRef = useRef();
  const latestSearchRef = useRef("");

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onError: (error) => {
      console.error("Logout failed:", error);
    },
    onSettled: () => {
      dispatch(removeUser());
      localStorage.clear();
      navigate("/auth");
    },
  });

  const searchProductMutation = useMutation({
    mutationFn: (value) => {
      const selectedStatus = parseInt(
        localStorage.getItem("selectedStatus"),
        10
      );
      return searchProduct({ value, selectedStatus });
    },
    onSuccess: (res, value) => {
      // Ignore stale responses (e.g. user cleared/changed input quickly)
      if (latestSearchRef.current !== value) return;
      dispatch(setSearchProductList(res?.data?.data));
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || error?.message || "Request failed",
        {
          variant: "error",
        }
      );
    },
  });

  const searchCategoryMutation = useMutation({
    mutationFn: (value) => {
      const selectedStatus = selectedMeal;
      return searchCategory({ value, selectedStatus });
    },
    onSuccess: (res, value) => {
      // Ignore stale responses (e.g. user cleared/changed input quickly)
      if (latestSearchRef.current !== value) return;
      dispatch(setSearchCategoryList(res?.data?.data));
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || error?.message || "Request failed",
        {
          variant: "error",
        }
      );
    },
  });

  const searchOrderMutation = useMutation({
    mutationFn: (value) => getfindOrders({ id: value, status: OrderTypes.ALL }),
    onSuccess: (res, value) => {
      if (latestSearchRef.current !== value) return;
      dispatch(setSearchOrderList(res?.data?.data));
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || error?.message || "Request failed",
        {
          variant: "error",
        }
      );
    },
  });

  const searchRecordMutation = useMutation({
    mutationFn: (query) => searchExpenseRecord(query),
    onSuccess: (res, query) => {
      if (latestSearchRef.current !== query) return;
      dispatch(setSearchExpensesList(res?.data?.data));
    },
    onError: (error) => {
      enqueueSnackbar(
        error?.response?.data?.message || error?.message || "Request failed",
        {
          variant: "error",
        }
      );
    },
  });

  const handleLogOut = () => logoutMutation.mutate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (
        calendarDropdownRef.current &&
        !calendarDropdownRef.current.contains(event.target)
      ) {
        setCalendarDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const savedMeal = localStorage.getItem("selectedStatus");
    if (savedMeal) {
      setSelectedMeal(parseInt(savedMeal));
    }
  }, []);

  //Effect to update page name, menu icon, and search bar visibility on route change
  useEffect(() => {
    const path = location.pathname;

    const pathSegments = path.split("/").filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || "";
    setPageName(lastSegment);

    if (path.includes("menu")) {
      setIsShowMenuTypeIcon(true);
    } else {
      setIsShowMenuTypeIcon(false);
    }
    // Hide search only on root path ("/")
    if (path === "/dashboard" || path === "/") {
      setIsShowSearch(false);
    } else {
      setIsShowSearch(true);
    }
  }, [location]);

  const handleMealSelect = (value) => {
    if (selectedMeal !== value) {
      setSelectedMeal(value);
      localStorage.setItem("selectedStatus", value);
      setCalendarDropdownOpen(false);
      window.location.reload();
    }
  };

  const handleSearchChange = (value) => {
    latestSearchRef.current = value;
    if (
      (pageName === "menu" && value != "") ||
      (pageName === "total-items" && value != "")
    ) {
      searchProductMutation.mutate(value);
    }
    if (pageName === "total-categories" && value != "") {
      searchCategoryMutation.mutate(value);
    }
    if (pageName === "orders" && value != "") {
      searchOrderMutation.mutate(value);
    }
    if (pageName === "expenses" && value != "") {
      searchRecordMutation.mutate(value);
    }
  };

  useEffect(() => {
    const path = location.pathname.split("/")[1]; // get first segment after "/"
    if (path === "orders") {
    } else if (path === "tables") {
    } else if (path === "menu") {
    }
  }, [location.pathname]);

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a] sticky top-0">
      {/* LOGO */}
      <div className="flex items-center gap-2 cursor-pointer">
        <img
          src={logo}
          className="h-12 w-12"
          alt="main logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* SEARCH */}
      {isShowSearch && <SearchBar onSearchChange={handleSearchChange} />}

      {pageName === "dashboard" && (
        <div className="flex items-center text-[#f5f5f5] font-semibold text-md gap-2">
          <h2>Admin Dashboard</h2>
        </div>
      )}
      {pageName === "" && (
        <div className="flex items-center text-[#f5f5f5] font-semibold text-md gap-2">
          <h1>Jayanthi Hotel</h1>
        </div>
      )}
      {/* GOTO ADMIN SECTION */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>
        {userData.role === "Admin" && (
          <div className="bg-[#1f1f1f] rounded-[15px] p-1 cursor-pointer">
            <MdDashboard
              className="text-[#f5f5f5] text-2xl"
              onClick={() => navigate("/dashboard")}
            />
          </div>
        )}

        {/* Calendar Icon */}
        {isShowMenuTypeIcon && (
          <div
            className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer relative"
            onClick={() => setCalendarDropdownOpen((prev) => !prev)}
            ref={calendarDropdownRef}
          >
            <RiCalendarScheduleFill className="text-[#f5f5f5] text-2xl" />

            {/* Dropdown */}
            {calendarDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 bg-[#1f1f1f] shadow-lg rounded-lg py-2 w-40 z-50">
                {meals.map((meal) => (
                  <button
                    key={meal.value}
                    onClick={() => handleMealSelect(meal.value)}
                    className={`block w-full text-left px-4 py-2 text-sm transition cursor-pointer ${selectedMeal === meal.value
                      ? "bg-[#333] text-white font-semibold"
                      : "text-[#f5f5f5] hover:bg-[#333]"
                      }`}
                  >
                    {meal.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Icon */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setDropdownOpen((prev) => !prev)}
        >
          <FaUserCircle className="text-[#f5f5f5] text-4xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
              {userData.name || "Test User"}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {userData.role || "N/A"}
            </p>
          </div>
        </div>

        {/* User Dropdown */}
        {dropdownOpen && (
          <div className="absolute top-full right-0 mt-2 bg-[#1f1f1f] shadow-lg rounded-lg py-2 w-40 z-50">
            <button
              onClick={handleLogOut}
              className="block w-full text-left px-4 py-2 text-sm text-[#f5f5f5] hover:bg-[#333] transition cursor-pointer"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
