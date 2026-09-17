import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const MiniCard = ({
  title,
  icon,
  number,
  footerNum,
  subtitle,
  variant = "gold", // "gold" | "green" | "blue"
  isCurrency = false,
}) => {
  // Theme styling for the icon badge
  const iconTheme = {
    gold: "bg-[#f6b100]/15 text-[#f6b100] border-[#f6b100]/30",
    green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    blue: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  }[variant] || "bg-[#f6b100]/15 text-[#f6b100] border-[#f6b100]/30";

  return (
    <div className="group relative bg-[#1f1f1f] p-4 sm:p-5 rounded-2xl border border-[#2c2c2c] hover:border-[#f6b100]/40 shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top row: Title and Icon Badge */}
      <div className="flex items-center justify-between">
        <span className="text-[#a0a0a0] text-xs sm:text-sm font-medium tracking-wide">
          {title}
        </span>
        <div
          className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg sm:text-xl shadow-md transition-transform group-hover:scale-110 ${iconTheme}`}
        >
          {icon}
        </div>
      </div>

      {/* Metric Value */}
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f5] tracking-tight truncate">
          {isCurrency ? `Rs ${typeof number === "number" ? number.toLocaleString() : number}` : number}
        </div>
      </div>

      {/* Footer / Trend Info */}
      <div className="mt-3 pt-2.5 border-t border-[#2a2a2a] flex items-center justify-between text-xs">
        {footerNum !== undefined && footerNum !== null ? (
          <div className="flex items-center gap-1.5 font-semibold">
            {typeof footerNum === "number" ? (
              footerNum >= 0 ? (
                <span className="flex items-center text-emerald-400 gap-0.5">
                  <FaArrowUp className="text-[10px]" /> +{footerNum}%
                </span>
              ) : (
                <span className="flex items-center text-rose-400 gap-0.5">
                  <FaArrowDown className="text-[10px]" /> {footerNum}%
                </span>
              )
            ) : (
              footerNum
            )}
            <span className="text-[#777] font-normal text-[11px]">vs yesterday</span>
          </div>
        ) : subtitle ? (
          <span className="text-[#777] text-[11px] font-normal">{subtitle}</span>
        ) : (
          <span className="text-[#777] text-[11px]">Live restaurant stat</span>
        )}
      </div>
    </div>
  );
};

export default MiniCard;
