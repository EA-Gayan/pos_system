import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

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
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(
      2,
      "0"
    )}, ${date.getFullYear()}`;
  };

  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

  return (
    <div className="flex justify-between items-center bg-gradient-to-r from-[#1a1a1a] to-[#262626] p-6 rounded-xl shadow-lg mb-2">
      <div>
        <h1 className="text-[#f5f5f5] text-3xl font-bold tracking-wide ml-3">
          Hi, {userData.name || "Test User"} 👋
        </h1>
        <p className="text-[#ababab] text-sm ml-3 mt-1">
          Give your best services for customers
        </p>
      </div>
      <div className="text-right">
        <h1 className="text-[#f6b100] text-3xl font-bold tracking-wide w-[130px]">
          {formatTime(dateTime)}
        </h1>
        <p className="text-[#ababab] text-sm mt-1">{formatDate(dateTime)}</p>
      </div>
    </div>
  );
};

export default Greetings;
