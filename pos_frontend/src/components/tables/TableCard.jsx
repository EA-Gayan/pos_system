import React from "react";
import { useNavigate } from "react-router-dom";
import { getAvatarName } from "../../utils";
import { useDispatch } from "react-redux";
import { updateTable } from "../../redux/slices/customerSlice";

const TableCard = ({ id, name, status, initials, seats, draftTotal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleClick = (name) => {

    const table = {
      tableId: id,
      tableNo: name,
    };

    dispatch(updateTable({ table }));
    navigate(`/waiter-menu/${id}`);
  };

  // Determine what to show in the avatar circle
  // If the table has a draft, show the draft total amount
  // If there's a customer name initial, show those initials
  // Otherwise show N/A (only for available/empty tables)
  const avatarContent = () => {
    if (draftTotal !== null && draftTotal !== undefined) {
      return `Rs ${draftTotal}`;
    }
    if (initials) {
      return getAvatarName(initials);
    }
    return "N/A";
  };

  const hasContent = draftTotal !== null && draftTotal !== undefined ? true : !!initials;

  return (
    <div
      onClick={() => handleClick(name)}
      key={id}
      className="hover:bg-[#2c2c2c] bg-gradient-to-br from-[#262626] to-[#1f1f1f] p-3 sm:p-5 rounded-xl cursor-pointer shadow-lg hover:shadow-2xl hover:scale-105 active:scale-98 transition-all duration-300 border border-[#333] flex flex-col justify-between"
    >
      <div className="flex items-center justify-between gap-1 px-0.5">
        <h1 className="text-[#f5f5f5] text-sm sm:text-xl font-bold truncate">
          Table {name}
        </h1>
        <p
          className={`${status === "Booked"
            ? "text-green-400 bg-green-500/20"
            : status === "Available"
              ? "text-yellow-400 bg-yellow-500/20"
              : "text-blue-400 bg-blue-500/20"
            } px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg font-semibold text-[10px] sm:text-sm shrink-0`}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center my-4 sm:my-7">
        <div
          className={`text-white rounded-full h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center text-center font-bold shadow-lg text-xs sm:text-lg px-1 ${
            draftTotal !== null && draftTotal !== undefined ? "text-[11px] sm:text-base leading-tight" : ""
          }`}
          style={{ backgroundColor: hasContent ? "#e5a400" : "#2a2a2a" }}
        >
          <span className="truncate">{avatarContent()}</span>
        </div>
      </div>
      <p className="text-[#ababab] text-[11px] sm:text-xs">
        Seats: <span className="text-[#f5f5f5] font-semibold">{seats}</span>
      </p>
    </div>
  );
};

export default TableCard;
