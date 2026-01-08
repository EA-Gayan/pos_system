import React from "react";
import { useNavigate } from "react-router-dom";
import { getBgColor, getAvatarName } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";

const TableCard = ({ id, name, status, initials, seats }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleClick = (name) => {
    if (status === "Booked") return;

    const table = {
      tableId: id,
      tableNo: name,
    };

    dispatch(updateTable({ table }));
    navigate(`/menu`);
  };

  return (
    <div
      onClick={() => handleClick(name)}
      key={id}
      className="hover:bg-[#2c2c2c] bg-gradient-to-br from-[#262626] to-[#1f1f1f] p-5 rounded-xl cursor-pointer shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#333]"
    >
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-xl font-bold">
          <p className="text-[#ababab] ml-2 inline" /> Table {name}
        </h1>
        <p
          className={`${status === "Booked"
              ? "text-green-400 bg-green-500 bg-opacity-20"
              : "bg-yellow-500 bg-opacity-20 text-yellow-400"
            } px-3 py-1.5 rounded-lg font-semibold text-sm`}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center mt-6 mb-8">
        <h1
          className={`text-white rounded-full p-6 text-2xl font-bold shadow-lg`}
          style={{ backgroundColor: initials ? getBgColor() : "#1f1f1f" }}
        >
          {getAvatarName(initials) || "N/A"}
        </h1>
      </div>
      <p className="text-[#ababab] text-xs">
        Seats: <span className="text-[#f5f5f5]">{seats}</span>
      </p>
    </div>
  );
};

export default TableCard;
