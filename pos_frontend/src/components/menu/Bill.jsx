import React from "react";
import { useSelector } from "react-redux";
import { getTotalPrice } from "../../redux/slices/cartSlice";

const Bill = () => {
  const cartData = useSelector((state) => state.cart);
  const total = useSelector(getTotalPrice);
  const taxRate = 0;
  const tax = total * taxRate;
  const grandTotal = total + tax;

  return (
    <>
      <div className="space-y-2 px-4 sm:px-5 mt-2">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#ababab] font-medium">
            Items({cartData.length})
          </p>
          <h1 className="text-[#f5f5f5] text-md font-bold">Rs {total}</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#ababab] font-medium">Tax {taxRate}%</p>
          <h1 className="text-[#f5f5f5] text-md font-bold">Rs {tax}</h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#ababab] font-medium">Total</p>
          <h1 className="text-[#f5f5f5] text-md font-bold">Rs {grandTotal}</h1>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-3 px-4 sm:px-5 mt-4">
        <button className="bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] text-sm sm:text-base font-medium break-words">
          Cash
        </button>
        <button className="bg-[#1f1f1f] px-4 py-3 w-full rounded-lg text-[#ababab] text-sm sm:text-base font-medium break-words">
          Online
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 px-4 sm:px-5 mt-4">
        <button className="bg-[#025cca] px-4 py-3 w-full rounded-lg text-[#ababab] text-sm sm:text-lg font-semibold break-words">
          Print Receipt
        </button>
        <button className="bg-[#f6b100] px-4 py-3 w-full rounded-lg text-[#1f1f1f] text-sm sm:text-lg font-semibold break-words">
          Online
        </button>
      </div>
    </>
  );
};

export default Bill;
