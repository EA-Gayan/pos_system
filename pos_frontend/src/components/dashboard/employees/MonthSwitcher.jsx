import React from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import { currentMonth, monthLabel, shiftMonth } from "./employeeUtils";

const MonthSwitcher = ({ month, onChange }) => {
  const isCurrent = month === currentMonth();

  return (
    <div className="flex items-center gap-1 bg-elevated border border-line-strong rounded-xl p-1">
      <button
        onClick={() => onChange(shiftMonth(month, -1))}
        className="p-1.5 rounded-lg text-fg-soft hover:text-fg hover:bg-muted cursor-pointer"
        title="Previous month"
      >
        <MdChevronLeft className="text-lg" />
      </button>
      <span className="text-xs sm:text-sm font-semibold text-fg min-w-32 text-center">
        {monthLabel(month)}
      </span>
      <button
        onClick={() => onChange(shiftMonth(month, 1))}
        disabled={isCurrent}
        className="p-1.5 rounded-lg text-fg-soft hover:text-fg hover:bg-muted cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        title="Next month"
      >
        <MdChevronRight className="text-lg" />
      </button>
      {!isCurrent && (
        <button
          onClick={() => onChange(currentMonth())}
          className="text-[11px] font-semibold text-accent hover:underline px-2 cursor-pointer"
        >
          This month
        </button>
      )}
    </div>
  );
};

export default MonthSwitcher;
