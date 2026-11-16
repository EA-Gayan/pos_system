import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { currentMonth, monthLabel, shiftMonth } from "./employeeUtils";

const MonthSwitcher = ({ month, onChange }) => {
  const isCurrent = month === currentMonth();

  return (
    <div className="flex items-center gap-1 bg-[#242424] border border-[#383838] rounded-xl p-1">
      <button
        onClick={() => onChange(shiftMonth(month, -1))}
        className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#2f2f2f] cursor-pointer"
        title="Previous month"
      >
        <MdChevronLeft className="text-lg" />
      </button>
      <span className="text-xs sm:text-sm font-semibold text-white min-w-32 text-center">
        {monthLabel(month)}
      </span>
      <button
        onClick={() => onChange(shiftMonth(month, 1))}
        disabled={isCurrent}
        className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-[#2f2f2f] cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        title="Next month"
      >
        <MdChevronRight className="text-lg" />
      </button>
      {!isCurrent && (
        <button
          onClick={() => onChange(currentMonth())}
          className="text-[11px] font-semibold text-[#f6b100] hover:underline px-2 cursor-pointer"
        >
          This month
        </button>
      )}
    </div>
  );
};

export default MonthSwitcher;
