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
      className="hover:bg-[#2c2c2c] bg-gradient-to-br from-[#262626] to-[#1f1f1f] p-5 rounded-xl cursor-pointer shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-[#333]"
    >
      <div className="flex items-center justify-between px-1">
        <h1 className="text-[#f5f5f5] text-xl font-bold">
          <p className="text-[#ababab] ml-2 inline" /> Table {name}
        </h1>
        <p
          className={`${status === "Booked"
            ? "text-green-400 bg-green-500/20"
            : status === "Available"
              ? "text-yellow-400 bg-yellow-500/20"
              : "text-blue-400 bg-blue-500/20"
            } px-3 py-1.5 rounded-lg font-semibold text-sm`}
        >
          {status}
        </p>
      </div>
      <div className="flex items-center justify-center mt-6 mb-8">
        <h1
          className={`text-white rounded-full p-6 text-2xl font-bold shadow-lg ${draftTotal !== null && draftTotal !== undefined ? "text-lg" : ""}`}
          style={{ backgroundColor: hasContent ? "#e5a400" : "#2a2a2a" }}
        >
          {avatarContent()}
        </h1>
      </div>
      <p className="text-[#ababab] text-xs">
        Seats: <span className="text-[#f5f5f5]">{seats}</span>
      </p>
    </div>
  );
};

export default TableCard;
