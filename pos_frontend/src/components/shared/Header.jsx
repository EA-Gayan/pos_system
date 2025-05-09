import React from "react";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import logo from "../../assets/images/logo-modified.png";
import { useDispatch, useSelector } from "react-redux";
import { IoLogOutOutline } from "react-icons/io5";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../https";
import { useNavigate } from "react-router-dom";
import { removeUser } from "../../redux/slices/userSlice";
import { MdDashboard } from "react-icons/md";
const Header = () => {
  const userData = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: (data) => {
      dispatch(removeUser());
      navigate("/auth");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });

  const handleLogOut = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 bg-[#1a1a1a]">
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

      {/* LOGGED USER DETAILS */}
      <div className="flex items-center gap-4">
        {userData.role === "Admin" && (
          <div className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
            <MdDashboard
              className="text-[#f5f5f5] text-2xl"
              onClick={() => navigate("/dashboard")}
            />
          </div>
        )}

        <div className="bg-[#1f1f1f] rounded-[15px] p-3 cursor-pointer">
          <FaBell className="text-[#f5f5f5] text-2xl" />
        </div>
        <div className="flex items-center gap-3 cursor-pointer">
          <FaUserCircle className="text-[#f5f5f5] text-4xl" />
          <div className="flex flex-col items-start">
            <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
              {userData.name || "Test User"}
            </h1>
            <p className="text-xs text-[#ababab] font-medium">
              {userData.role || "N/A"}
            </p>
          </div>
          <IoLogOutOutline
            onClick={handleLogOut}
            className="text-[#f5f5f5] text-4xl"
            size={35}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
