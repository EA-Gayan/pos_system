import { BiSolidDish } from "react-icons/bi";
import { CiCircleMore } from "react-icons/ci";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNav = ({ isVisible = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const userData = {
    name: localStorage.getItem("name"),
    role: localStorage.getItem("role"),
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={[
        "fixed bottom-0 left-0 right-0 bg-[#262626]/95 backdrop-blur-md border-t border-[#333] px-3 sm:px-8 md:px-12 lg:px-16 h-16 flex items-center justify-center z-50",
        "transition-transform duration-300 ease-out will-change-transform pb-safe",
        isVisible ? "translate-y-0" : "translate-y-20",
      ].join(" ")}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div className="flex items-center justify-between w-full max-w-6xl xl:max-w-7xl mx-auto relative gap-1 xs:gap-2 sm:gap-6 md:gap-10 lg:gap-14">
        {userData.role === "Admin" && (
          <button
            onClick={() => navigate("/")}
            className={`flex-1 sm:max-w-[220px] md:max-w-[260px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 py-1.5 sm:py-2.5 px-2 sm:px-5 rounded-2xl font-semibold cursor-pointer transition-all duration-200 ${
              isActive("/")
                ? "text-[#f6b100] bg-[#333333] shadow-lg shadow-black/40 border border-[#f6b100]/25 font-bold scale-102"
                : "text-[#ababab] hover:text-[#f5f5f5] hover:bg-[#2e2e2e]"
            }`}
          >
            <FaHome className="shrink-0 text-base sm:text-xl" />
            <span className="text-[10px] sm:text-xs md:text-sm tracking-wide">Home</span>
          </button>
        )}

        <button
          onClick={() => navigate("/tables")}
          className={`flex-1 sm:max-w-[220px] md:max-w-[260px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 py-1.5 sm:py-2.5 px-2 sm:px-5 rounded-2xl font-semibold cursor-pointer transition-all duration-200 ${
            isActive("/tables")
              ? "text-[#f6b100] bg-[#333333] shadow-lg shadow-black/40 border border-[#f6b100]/25 font-bold scale-102"
              : "text-[#ababab] hover:text-[#f5f5f5] hover:bg-[#2e2e2e]"
          }`}
        >
          <MdTableBar className="shrink-0 text-base sm:text-xl" />
          <span className="text-[10px] sm:text-xs md:text-sm tracking-wide">Tables</span>
        </button>

        {/* Center Floating Dish / Menu Button */}
        {userData.role !== "Waiter" && (
          <div className="flex items-center justify-center px-1 sm:px-3 shrink-0">
            <button
              onClick={() => navigate("/menu")}
              className={`-mt-7 sm:-mt-8 bg-gradient-to-tr from-[#e5a400] to-[#f6b100] text-[#1a1a1a] rounded-full p-3.5 sm:p-4 shadow-2xl border-4 border-[#262626] cursor-pointer hover:scale-110 active:scale-95 transition-all duration-200 ${
                isActive("/menu") ? "ring-4 ring-[#f6b100]/40 shadow-[#f6b100]/40" : ""
              }`}
              title="Menu"
            >
              <BiSolidDish className="text-2xl sm:text-3xl" />
            </button>
          </div>
        )}

        {userData.role !== "Waiter" && (
          <button
            onClick={() => navigate("/orders")}
            className={`flex-1 sm:max-w-[220px] md:max-w-[260px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 py-1.5 sm:py-2.5 px-2 sm:px-5 rounded-2xl font-semibold cursor-pointer transition-all duration-200 ${
              isActive("/orders")
                ? "text-[#f6b100] bg-[#333333] shadow-lg shadow-black/40 border border-[#f6b100]/25 font-bold scale-102"
                : "text-[#ababab] hover:text-[#f5f5f5] hover:bg-[#2e2e2e]"
            }`}
          >
            <MdOutlineReorder className="shrink-0 text-base sm:text-xl" />
            <span className="text-[10px] sm:text-xs md:text-sm tracking-wide">Orders</span>
          </button>
        )}

        {userData.role !== "Waiter" && (
          <button
            onClick={() => navigate("/expenses")}
            className={`flex-1 sm:max-w-[220px] md:max-w-[260px] flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 py-1.5 sm:py-2.5 px-2 sm:px-5 rounded-2xl font-semibold cursor-pointer transition-all duration-200 ${
              isActive("/expenses")
                ? "text-[#f6b100] bg-[#333333] shadow-lg shadow-black/40 border border-[#f6b100]/25 font-bold scale-102"
                : "text-[#ababab] hover:text-[#f5f5f5] hover:bg-[#2e2e2e]"
            }`}
          >
            <CiCircleMore className="shrink-0 text-base sm:text-xl" />
            <span className="text-[10px] sm:text-xs md:text-sm tracking-wide">Expenses</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default BottomNav;
