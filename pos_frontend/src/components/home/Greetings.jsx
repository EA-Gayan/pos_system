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
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-[#f5f5f5] text-2xl font-semibold tracking-wide ml-3">
          Hi, {userData.name || "Test User"} 👋
        </h1>
        <p className="text-[#ababab] text-sm ml-3">
          Give your best services for customers
        </p>
      </div>
      <div>
        <h1 className="text-[#f5f5f5] text-3xl font-bold tracking-wide w-[130px]">
          {formatTime(dateTime)}
        </h1>
        <p className="text-[#ababab] text-sm">{formatDate(dateTime)}</p>
      </div>
    </div>
  );
};

export default Greetings;
