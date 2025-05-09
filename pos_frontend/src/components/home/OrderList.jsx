import React from "react";
import { FaCheckDouble, FaLongArrowAltRight } from "react-icons/fa";
import { FaCircle } from "react-icons/fa";
import { getAvatarName } from "../../utils";

const OrderList = ({ key, order }) => {
  return (
    <div
      className="flex items-center justify-between gap-4 p-4 bg-[#1e1e1e] rounded-lg mb-3"
      key={key}
    >
      {/* Left: Avatar + Name/Items */}
      <div className="flex items-center gap-4 min-w-0">
        <button className="bg-[#f6b100] w-12 h-12 text-xl font-bold rounded-full flex items-center justify-center shrink-0">
          {getAvatarName(order?.customerDetails?.name || "N/A")}
        </button>
        <div className="flex flex-col">
          <h1 className="text-white text-base font-semibold leading-tight truncate max-w-[100px]">
            {order?.customerDetails?.name || "N/A"}
          </h1>
          <p className="text-[#ababab] text-sm leading-tight">
            {order?.items?.length || 0} Items
          </p>
        </div>
      </div>

      {/* Center: Table Badge */}
      <div className="flex items-center">
        <span className="text-[#f6b100] font-semibold border border-[#f6b100] rounded-lg px-3 py-1 flex items-center whitespace-nowrap">
          Table <FaLongArrowAltRight className="mx-2 text-[#ababab]" />
          {order?.table?.tableNo || "N/A"}
        </span>
      </div>

      {/* Right: Status Badge */}
      <div className="flex items-center justify-between gap-4 p-4 bg-[#1e1e1e] rounded-lg mb-3 min-h-[80px]">
        {order?.orderStatus === "Ready" ? (
          <span className="text-green-500 bg-[#2e4a40] px-3 py-1.5 rounded-lg text-sm font-medium flex items-center min-h-[32px]">
            <FaCheckDouble className="mr-1 text-xs" />
            Ready
          </span>
        ) : (
          <span className="text-yellow-500 bg-[#4a452e] px-3 py-1.5 rounded-lg text-sm font-medium flex items-center min-h-[32px]">
            <FaCircle className="mr-1 text-xs" />
            In Progress
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderList;
