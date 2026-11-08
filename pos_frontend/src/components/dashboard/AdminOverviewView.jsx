import React from "react";
import { BiSolidDish } from "react-icons/bi";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { MdCategory, MdOutlineReorder, MdTableBar } from "react-icons/md";

const AdminOverviewView = ({
  counts = {},
  earnings = 0,
  expenses = 0,
  ordersCount = 0,
  bestSellingCount = 0,
  sessionSalesSummary = null,
  onSelectSection,
}) => {
  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-[#1f1f1f] border border-[#2d2d2d] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Admin Overview
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Real-time restaurant performance, catalog summary, and dining metrics.
          </p>
        </div>

        {/* Date & Status Tag */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#262626] text-gray-300 border border-[#383838]">
            📅 {todayFormatted}
          </span>
        </div>
      </div>

      {/* Item Details Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white text-base sm:text-lg tracking-wide">
            Catalog & System Details
          </h2>
          <span className="text-xs text-gray-400">Click any card to manage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Total Categories Card */}
          <div
            onClick={() => onSelectSection("categories")}
            className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl shadow-md overflow-hidden"
            style={{ backgroundColor: "#5b45b0" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                  Total Categories
                </p>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {counts.categories ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 text-white backdrop-blur-xs group-hover:scale-110 transition">
                <MdCategory className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90 font-medium">
              <span>View & Manage Categories</span>
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Total Items Card */}
          <div
            onClick={() => onSelectSection("items")}
            className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl shadow-md overflow-hidden"
            style={{ backgroundColor: "#285430" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                  Total Products & Items
                </p>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {counts.products ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 text-white backdrop-blur-xs group-hover:scale-110 transition">
                <BiSolidDish className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90 font-medium">
              <span>Browse All Menu Items</span>
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Total Tables Card */}
          <div
            onClick={() => onSelectSection("tables")}
            className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl shadow-md overflow-hidden"
            style={{ backgroundColor: "#7f167f" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                  Dining Tables
                </p>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {counts.tables ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 text-white backdrop-blur-xs group-hover:scale-110 transition">
                <MdTableBar className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90 font-medium">
              <span>Manage Seating & Tables</span>
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Active Orders Card */}
          <div
            onClick={() => onSelectSection("orders")}
            className="group relative rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl shadow-md overflow-hidden"
            style={{ backgroundColor: "#735f32" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                  Active Orders
                </p>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {counts.inProgressOrders ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/15 text-white backdrop-blur-xs group-hover:scale-110 transition">
                <MdOutlineReorder className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90 font-medium">
              <span>Go to Orders Screen</span>
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Performance Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white text-base sm:text-lg tracking-wide">
            Today's Financial Performance
          </h2>
          <span className="text-xs text-gray-400">Live POS metrics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Today Income */}
          <div
            className="rounded-2xl p-5 shadow-md transition-all duration-200 hover:-translate-y-1"
            style={{ backgroundColor: "#025cca" }}
          >
            <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
              Today's Income
            </p>
            <p className="text-3xl font-extrabold text-white mt-2">
              Rs. {Number(earnings || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-white/70 mt-3 font-medium">
              Total billed gross sales for today
            </p>
          </div>

          {/* Today Expense */}
          <div
            className="rounded-2xl p-5 shadow-md transition-all duration-200 hover:-translate-y-1"
            style={{ backgroundColor: "#02ca3a" }}
          >
            <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
              Today's Expense
            </p>
            <p className="text-3xl font-extrabold text-white mt-2">
              Rs. {Number(expenses || 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-white/70 mt-3 font-medium">
              Total logged expenses for today
            </p>
          </div>

          {/* Today Orders Count */}
          <div
            className="rounded-2xl p-5 shadow-md transition-all duration-200 hover:-translate-y-1"
            style={{ backgroundColor: "#be3e3f" }}
          >
            <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
              Today's Orders Count
            </p>
            <p className="text-3xl font-extrabold text-white mt-2">
              {ordersCount ?? 0}
            </p>
            <p className="text-[11px] text-white/70 mt-3 font-medium">
              Total completed orders processed
            </p>
          </div>

          {/* Best Selling Products */}
          <div
            onClick={() => onSelectSection("best-selling")}
            className="group rounded-2xl p-5 shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer"
            style={{ backgroundColor: "#999400" }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">
                  Best Selling Products
                </p>
                <p className="text-3xl font-extrabold text-white mt-2">
                  {bestSellingCount} items
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/15 text-white group-hover:scale-110 transition">
                <FaStar className="text-xl" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-white/90 font-medium">
              <span>View Ranked List</span>
              <FaArrowRight className="text-xs group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Session Sales Strip */}
      {sessionSalesSummary && (
        <div
          onClick={() => onSelectSection("session-sales")}
          className="bg-[#1a1a1a] border border-[#2d2d2d] hover:border-[#f6b100]/40 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-sm group"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#f6b100] transition flex items-center gap-2">
                <span>Today's Sold Items by Session</span>
                <span className="text-[11px] bg-[#f6b100]/20 text-[#f6b100] px-2 py-0.5 rounded-full font-semibold">
                  {sessionSalesSummary.totalItemsSold || 0} Total Units Sold Today
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time sold item counts across Breakfast, Lunch, and Dinner sessions without downloading reports.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs bg-[#252525] px-3 py-1.5 rounded-xl border border-[#333] text-amber-300 font-medium">
                🍳 Breakfast: <strong>{sessionSalesSummary.breakfastCount || 0}</strong>
              </span>
              <span className="text-xs bg-[#252525] px-3 py-1.5 rounded-xl border border-[#333] text-emerald-300 font-medium">
                🍛 Lunch: <strong>{sessionSalesSummary.lunchCount || 0}</strong>
              </span>
              <span className="text-xs bg-[#252525] px-3 py-1.5 rounded-xl border border-[#333] text-purple-300 font-medium">
                🍲 Dinner: <strong>{sessionSalesSummary.dinnerCount || 0}</strong>
              </span>
              <span className="text-xs text-[#f6b100] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition ml-1">
                <span>Details</span>
                <FaArrowRight className="text-[10px]" />
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverviewView;
