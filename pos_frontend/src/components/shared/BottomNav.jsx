import { BiSolidDish } from "react-icons/bi";
import { CiCircleMore } from "react-icons/ci";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const userData = {
    name: localStorage.getItem("name"),
    role: localStorage.getItem("role"),
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#262626] p-2 h-16 flex justify-around z-50">
      {userData.role === "Admin" && (
        <button
          onClick={() => navigate("/")}
          className={`flex items-center justify-center font-bold ${
            isActive("/") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
          } w-[300px] rounded-[20px]`}
        >
          <FaHome className="inline mr-2" size={20} />
          <p>Home</p>
        </button>
      )}
      <button
        onClick={() => {
          navigate("/expenses");
        }}
        className={`flex items-center justify-center font-bold ${
          isActive("/expenses")
            ? "text-[#f5f5f5] bg-[#343434]"
            : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <CiCircleMore className="inline mr-2" size={20} />
        <p>Expenses</p>
      </button>
      <button
        onClick={() => navigate("/tables")}
        className={`flex items-center justify-center font-bold ${
          isActive("/tables") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <MdTableBar className="inline mr-2" size={20} />
        <p>Tables</p>
      </button>
      <button
        onClick={() => navigate("/orders")}
        className={`flex items-center justify-center font-bold ${
          isActive("/orders") ? "text-[#f5f5f5] bg-[#343434]" : "text-[#ababab]"
        } w-[300px] rounded-[20px]`}
      >
        <MdOutlineReorder className="inline mr-2" size={20} />
        <p>Orders</p>
      </button>
      <button
        onClick={() => navigate("/menu")}
        className="absolute bottom-6 bg-[#F6B100] text-[#f5f5f5] rounded-full p-4 mb-5"
      >
        <BiSolidDish size={35} />
      </button>
    </div>
  );
};

export default BottomNav;
