import React, { useMemo, useState } from "react";
import { BiSolidDish } from "react-icons/bi";
import { FaCalendarDay, FaRedo, FaSearch, FaUtensils } from "react-icons/fa";
import { MdOutlineFoodBank } from "react-icons/md";
import FullScreenLoader from "../shared/FullScreenLoader";
import Table from "../shared/Table";

const AdminSessionSalesView = ({
  sessionSalesData,
  isLoading,
  onRefresh,
}) => {
  const [activeSession, setActiveSession] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const summary = sessionSalesData?.summary || {
    totalItemsSold: 0,
    breakfastCount: 0,
    lunchCount: 0,
    dinnerCount: 0,
    totalRevenue: 0,
  };

  const bySession = sessionSalesData?.bySession || {};
  const allItems = sessionSalesData?.allItems || [];

  // Filter items based on active session and search
  const currentItems = useMemo(() => {
    let items = [];
    if (activeSession === "all") {
      items = allItems;
    } else if (activeSession === "breakfast") {
      items = bySession.breakfast?.items || [];
    } else if (activeSession === "lunch") {
      items = bySession.lunch?.items || [];
    } else if (activeSession === "dinner") {
      items = bySession.dinner?.items || [];
    }

    if (!searchTerm.trim()) return items;

    const term = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.productName?.toLowerCase().includes(term) ||
        item.categoryName?.toLowerCase().includes(term)
    );
  }, [activeSession, allItems, bySession, searchTerm]);

  // Headers adapt depending on whether viewing All Sessions or a specific session
  const headers = useMemo(() => {
    if (activeSession === "all") {
      return [
        "Item Name",
        "Category",
        "Breakfast",
        "Lunch",
        "Dinner",
        "Total Sold (Today)",
        "Total Sales",
      ];
    }
    return [
      "Item Name",
      "Category",
      "Unit Price",
      "Sold Count",
      "Total Sales",
    ];
  }, [activeSession]);

  const renderRow = (row, index) => {
    if (activeSession === "all") {
      return (
        <tr
          key={`${row.productName}-${index}`}
          className="border-b border-line-strong hover:bg-elevated transition-colors duration-150"
        >
          <td className="p-4 font-semibold text-fg">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-muted text-accent">
                <BiSolidDish className="text-base" />
              </span>
              <span className="font-semibold text-sm sm:text-base text-fg">
                {row.productName}
              </span>
            </div>
          </td>
          <td className="p-4 text-fg-soft text-sm">
            <span className="bg-elevated px-2.5 py-1 rounded-full text-xs font-medium border border-line-strong">
              {row.categoryName}
            </span>
          </td>
          <td className="p-4 text-sm font-semibold text-amber-300">
            {row.breakfastQty > 0 ? (
              <span className="bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                {row.breakfastQty}
              </span>
            ) : (
              <span className="text-gray-600 font-normal">-</span>
            )}
          </td>
          <td className="p-4 text-sm font-semibold text-emerald-300">
            {row.lunchQty > 0 ? (
              <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                {row.lunchQty}
              </span>
            ) : (
              <span className="text-gray-600 font-normal">-</span>
            )}
          </td>
          <td className="p-4 text-sm font-semibold text-purple-300">
            {row.dinnerQty > 0 ? (
              <span className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                {row.dinnerQty}
              </span>
            ) : (
              <span className="text-gray-600 font-normal">-</span>
            )}
          </td>
          <td className="p-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold bg-[#f6b100]/15 text-accent border border-[#f6b100]/30">
              <span>{row.totalSoldQty}</span>
              <span className="text-[10px] font-normal text-amber-200">sold</span>
            </span>
          </td>
          <td className="p-4 font-bold text-accent text-sm sm:text-base">
            Rs. {Number(row.income || 0).toLocaleString()}
          </td>
        </tr>
      );
    }

    // Single Session Row (Breakfast, Lunch, or Dinner)
    return (
      <tr
        key={`${row.productName}-${index}`}
        className="border-b border-line-strong hover:bg-elevated transition-colors duration-150"
      >
        <td className="p-4 font-semibold text-fg">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-muted text-accent">
              <BiSolidDish className="text-base" />
            </span>
            <span className="font-semibold text-sm sm:text-base text-fg">
              {row.productName}
            </span>
          </div>
        </td>
        <td className="p-4 text-fg-soft text-sm">
          <span className="bg-elevated px-2.5 py-1 rounded-full text-xs font-medium border border-line-strong">
            {row.categoryName}
          </span>
        </td>
        <td className="p-4 text-fg-soft text-sm font-medium">
          Rs. {Number(row.price || 0).toLocaleString()}
        </td>
        <td className="p-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span>{row.soldQty}</span>
            <span className="text-[10px] font-normal text-emerald-300">sold</span>
          </span>
        </td>
        <td className="p-4 font-bold text-accent text-sm sm:text-base">
          Rs. {Number(row.income || 0).toLocaleString()}
        </td>
      </tr>
    );
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Top Banner */}
      <div className="bg-surface border border-line rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-muted text-accent">
              <MdOutlineFoodBank className="text-xl" />
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-fg tracking-wide">
              Today's Sold Items by Session
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-fg-dim mt-1">
            Real-time count of items sold today categorized by meal sessions (Breakfast, Lunch, Dinner).
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-elevated text-fg-soft border border-line-strong flex items-center gap-1.5">
            <FaCalendarDay className="text-accent text-xs" />
            <span>{todayFormatted}</span>
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 rounded-xl bg-elevated text-fg-soft hover:text-fg hover:bg-strong transition cursor-pointer"
              title="Refresh Data"
            >
              <FaRedo className="text-xs" />
            </button>
          )}
        </div>
      </div>

      {/* 3 Session Metric Cards (Breakfast, Lunch, Dinner - No Common) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Breakfast Card */}
        <div
          onClick={() => setActiveSession("breakfast")}
          className={`rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm ${
            activeSession === "breakfast"
              ? "bg-elevated border-amber-400 ring-2 ring-amber-400/30"
              : "bg-base border-line hover:border-line-stronger"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🍳</span> Breakfast
            </span>
            <span className="text-[11px] text-fg-dim font-medium">Morning</span>
          </div>
          <p className="text-3xl font-extrabold text-fg mt-2">
            {summary.breakfastCount}{" "}
            <span className="text-xs font-normal text-fg-dim">units</span>
          </p>
          <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-xs text-fg-dim">
            <span>Session Revenue:</span>
            <span className="text-accent font-semibold">
              Rs. {Number(bySession.breakfast?.totalRevenue || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Lunch Card */}
        <div
          onClick={() => setActiveSession("lunch")}
          className={`rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm ${
            activeSession === "lunch"
              ? "bg-elevated border-emerald-400 ring-2 ring-emerald-400/30"
              : "bg-base border-line hover:border-line-stronger"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🍛</span> Lunch
            </span>
            <span className="text-[11px] text-fg-dim font-medium">Afternoon</span>
          </div>
          <p className="text-3xl font-extrabold text-fg mt-2">
            {summary.lunchCount}{" "}
            <span className="text-xs font-normal text-fg-dim">units</span>
          </p>
          <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-xs text-fg-dim">
            <span>Session Revenue:</span>
            <span className="text-accent font-semibold">
              Rs. {Number(bySession.lunch?.totalRevenue || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dinner Card */}
        <div
          onClick={() => setActiveSession("dinner")}
          className={`rounded-2xl p-4 sm:p-5 border cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-sm ${
            activeSession === "dinner"
              ? "bg-elevated border-purple-400 ring-2 ring-purple-400/30"
              : "bg-base border-line hover:border-line-stronger"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>🍲</span> Dinner
            </span>
            <span className="text-[11px] text-fg-dim font-medium">Evening & Night</span>
          </div>
          <p className="text-3xl font-extrabold text-fg mt-2">
            {summary.dinnerCount}{" "}
            <span className="text-xs font-normal text-fg-dim">units</span>
          </p>
          <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-xs text-fg-dim">
            <span>Session Revenue:</span>
            <span className="text-accent font-semibold">
              Rs. {Number(bySession.dinner?.totalRevenue || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar (Only All, Breakfast, Lunch, Dinner - No Common) */}
      <div className="bg-base border border-line rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Session Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveSession("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeSession === "all"
                ? "bg-[#f6b100] text-black shadow-sm"
                : "bg-elevated text-fg-dim hover:text-fg hover:bg-muted"
            }`}
          >
            All Sessions ({summary.totalItemsSold})
          </button>
          <button
            onClick={() => setActiveSession("breakfast")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeSession === "breakfast"
                ? "bg-amber-400 text-black shadow-sm"
                : "bg-elevated text-fg-dim hover:text-fg hover:bg-muted"
            }`}
          >
            Breakfast ({summary.breakfastCount})
          </button>
          <button
            onClick={() => setActiveSession("lunch")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeSession === "lunch"
                ? "bg-emerald-400 text-black shadow-sm"
                : "bg-elevated text-fg-dim hover:text-fg hover:bg-muted"
            }`}
          >
            Lunch ({summary.lunchCount})
          </button>
          <button
            onClick={() => setActiveSession("dinner")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
              activeSession === "dinner"
                ? "bg-purple-400 text-white shadow-sm"
                : "bg-elevated text-fg-dim hover:text-fg hover:bg-muted"
            }`}
          >
            Dinner ({summary.dinnerCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64 md:w-80">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sold items or categories..."
            className="w-full bg-elevated text-fg text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl border border-line-strong focus:border-[#f6b100] focus:outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-fg-dim hover:text-fg cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 bg-base border border-line rounded-2xl overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <FullScreenLoader />
            </div>
          ) : currentItems.length > 0 ? (
            <Table
              headers={headers}
              data={currentItems}
              renderRow={renderRow}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
              <FaUtensils className="text-4xl text-gray-600 mb-3" />
              <h3 className="text-base font-semibold text-fg-soft">
                {searchTerm
                  ? "No items match your search"
                  : `No items sold for ${activeSession} today`}
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm">
                {searchTerm
                  ? `No sold items match "${searchTerm}".`
                  : "As customer orders are billed today, sold items will automatically appear in their respective sessions."}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-3 text-xs text-accent hover:underline cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSessionSalesView;
