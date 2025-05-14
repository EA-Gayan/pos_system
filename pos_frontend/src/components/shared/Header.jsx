import { useEffect, useRef, useState } from "react";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/images/logo-modified.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOutOutline } from "react-icons/io5";
import { RiCalendarScheduleFill } from "react-icons/ri";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { useNavigate } from "react-router-dom";
import { removeUser } from "../../redux/slices/userSlice";
import { MdDashboard } from "react-icons/md";

const meals = [
  { name: "Breakfast", value: 1 },
  { name: "Lunch", value: 2 },
  { name: "Dinner", value: 3 },
];

const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [calendarDropdownOpen, setCalendarDropdownOpen] = useState(false);
  const [isShowMenuTypeIcon, setIsShowMenuTypeIcon] = useState(false);
  const dropdownRef = useRef();
  const calendarDropdownRef = useRef();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
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

  useEffect(() => {
    if (window.location.pathname.includes("menu")) {
      setIsShowMenuTypeIcon(true);
    } else {
      setIsShowMenuTypeIcon(false);
    }
  }, [window.location.pathname]);

  const handleMealSelect = (value) => {
    if (selectedMeal !== value) {
      setSelectedMeal(value);
      localStorage.setItem("selectedStatus", value);
      setCalendarDropdownOpen(false);
      window.location.reload();
    }
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a] relative">
      {/* LOGO */}
      <div className="flex items-center gap-2 cursor-pointer">
        <img
          src={logo}
          className="h-16 w-16"
          alt="main logo"
          onClick={() => navigate("/")}
        />
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-4 bg-[#1f1f1f] rounded-[15px] px-5 py-2 w-[500px]">
        <FaSearch className="text-[#f5f5f5]" />
        <input
          type="text"
          placeholder="Search"
          className="bg-[#1f1f1f] outline-none text-[#f5f5f5]"
        />
      </div>

      {/* USER SECTION */}
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
                    className={`block w-full text-left px-4 py-2 text-sm transition ${
                      selectedMeal === meal.value
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
              className="block w-full text-left px-4 py-2 text-sm text-[#f5f5f5] hover:bg-[#333] transition"
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
