import React, { useState } from "react";
import { useSelector } from "react-redux";
import { formatDate, formatTime, getAvatarName } from "../../utils";
const CustomerInfo = () => {
  const [dateTime, setDateTime] = useState(new Date());

  const customerData = useSelector((state) => state.customer);

  return (
    <div className="flex  items-center justify-between px-4 py-3">
      <div className="flex flex-col items-start">
        <h1 className="text-md text-[#f5f5f5] font-semibold tracking-wide">
          {customerData.customerName}
        </h1>
        <p className="text-xs text-[#ababab] font-medium mt-1">
          #{formatTime()} /
          {customerData.tableNo === "" ? " Take away" : " Dine In"}
        </p>
        <p className="text-xs text-[#ababab] font-medium mt-2">
          {formatDate(dateTime)}
        </p>
      </div>
      <button className="bg-[#F6B100] font-bold rounded-lg p-3 text-xl">
        {getAvatarName(customerData.customerName)}
      </button>
    </div>
  );
};

export default CustomerInfo;
