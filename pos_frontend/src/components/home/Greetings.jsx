import React, { useState, useEffect } from "react";
import { FaRegClock, FaRegCalendarAlt } from "react-icons/fa";

const Greetings = () => {
  const [dateTime, setDateTime] = useState(new Date());

  const userData = {
    name: localStorage.getItem("name"),
    role: localStorage.getItem("role"),
  };

  useEffect(() => {
    const timer = setInterval(() => setDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#1f1f1f] via-[#242424] to-[#1a1a1a] p-4 sm:p-6 rounded-2xl shadow-xl border border-[#2c2c2c] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* Subtle decorative glow */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#f6b100]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Left Greeting & Status */}
      <div className="relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-[#f5f5f5] text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
            Hi, {userData.name || "Janith"}
          </h1>
          <span className="text-xl sm:text-2xl animate-bounce">👋</span>
          <span className="text-[11px] font-semibold bg-[#f6b100]/15 text-[#f6b100] px-2.5 py-0.5 rounded-full border border-[#f6b100]/30 tracking-wide">
            {userData.role || "Admin"}
          </span>
        </div>
        <p className="text-[#a0a0a0] text-xs sm:text-sm mt-1 flex items-center gap-2">
          <span>Welcome back! Here is today's restaurant activity</span>
        </p>
      </div>

      {/* Right Realtime Clock Card */}
      <div className="relative z-10 flex items-center gap-3 bg-[#161616]/90 border border-[#2e2e2e] py-2 px-4 rounded-xl shadow-inner w-full sm:w-auto justify-between sm:justify-start">
        <div className="w-10 h-10 rounded-lg bg-[#f6b100]/10 border border-[#f6b100]/25 flex items-center justify-center text-[#f6b100] shrink-0">
          <FaRegClock className="text-lg" />
        </div>
        <div className="text-right sm:text-left">
          <div className="text-lg sm:text-xl font-bold font-mono text-[#f6b100] tracking-wider leading-none">
            {formatTime(dateTime)}
          </div>
          <div className="text-[11px] text-[#888] font-medium mt-0.5 flex items-center justify-end sm:justify-start gap-1">
            <FaRegCalendarAlt className="text-[9px] text-[#666]" />
            <span>{formatDate(dateTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Greetings;
